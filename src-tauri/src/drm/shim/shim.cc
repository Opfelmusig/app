// The host for the system Widevine CDM, driven through its official interface
// (cdm::ContentDecryptionModule_11 + cdm::Host_11, or _10 for a module too old for 11).
//
// Host_10 and Host_11 are implemented here in full, so the compiler enforces every pure virtual
// against the vendored Chromium header and the vtable is right by construction. The module is
// loaded with dlopen on Linux and macOS and LoadLibraryExW on Windows, and a small C API is what
// Rust sees:
//
//   ch_open(path)                          -> load + init the CDM
//   ch_load_error()                        -> why the last ch_open could not load the module
//   ch_challenge(init_data,len,out,outlen) -> CreateSessionAndGenerateRequest, the challenge
//   ch_update(license,len)                 -> UpdateSession, the license back
//   ch_decrypt(...)                        -> Decrypt one CENC buffer
//   ch_free(p)                             -> release a buffer the two above handed out
//
// No keys are extracted. The CDM keeps its device key sealed and does the challenge and the
// decryption internally; only its public ABI is used.
//
// Derived from cdm-host by kopuz contributors (https://github.com/Kopuz-org/cdm-host), MIT,
// see LICENSE beside this file. The interface headers under cdm/ are Chromium's, under the BSD
// license beside them.

#if defined(_WIN32)
#define WIN32_LEAN_AND_MEAN
#define NOMINMAX
#include <windows.h>
#else
#include <dlfcn.h>
#endif

#include "content_decryption_module.h"

#include <algorithm>
#include <chrono>
#include <cstdint>
#include <cstdlib>
#include <cstring>
#include <string>
#include <thread>
#include <utility>
#include <vector>

using namespace cdm;

namespace {

// Heap-backed cdm::Buffer the CDM uses for its outputs.
class HeapBuffer : public Buffer {
 public:
  explicit HeapBuffer(uint32_t cap) : data_(cap), size_(0) {}
  void Destroy() override { delete this; }
  uint32_t Capacity() const override { return static_cast<uint32_t>(data_.size()); }
  uint8_t* Data() override { return data_.data(); }
  void SetSize(uint32_t size) override { size_ = size; }
  uint32_t Size() const override { return size_; }
 private:
  std::vector<uint8_t> data_;
  uint32_t size_;
};

// One opened CDM as the C API drives it, whichever interface version it answered to, and what
// its host callbacks have captured so far.
class Session {
 public:
  virtual ~Session() = default;

  virtual void initialize() = 0;
  virtual void generate(const uint8_t* init_data, uint32_t len) = 0;
  virtual void update(const uint8_t* license, uint32_t len) = 0;
  virtual Status decrypt(const InputBuffer_2& in, DecryptedBlock* out) = 0;
  virtual void expire(void* context) = 0;

  using Clock = std::chrono::steady_clock;
  void fire_timers() {
    const auto now = Clock::now();
    std::vector<void*> due;
    auto timer = timers.begin();
    while (timer != timers.end()) {
      if (timer->first <= now) {
        due.push_back(timer->second);
        timer = timers.erase(timer);
      } else {
        ++timer;
      }
    }
    // Remove due timers before callbacks, which may schedule new timers.
    for (void* context : due) expire(context);
  }

  template <class Ready>
  void wait(Ready ready) {
    const auto deadline = Clock::now() + std::chrono::seconds(8);
    while (!ready() && Clock::now() < deadline) {
      fire_timers();
      if (!ready()) std::this_thread::sleep_for(std::chrono::milliseconds(1));
    }
  }

  // captured state
  bool initialized = false, init_ok = false;
  std::string session_id;
  bool got_message = false;
  std::vector<uint8_t> challenge;
  bool rejected = false;
  std::string error;
  bool usable = false, expired = false;
  Time expiration = 0;
  MessageType message_type = kLicenseRequest;
  bool resolved = false;
  std::vector<std::pair<Clock::time_point, void*>> timers;
};

// Host_11 is Host_10 with ReportMetrics added at the end, so only that one method differs.
template <class Base>
class Metrics : public Base {};

template <>
class Metrics<Host_11> : public Host_11 {
 public:
  void ReportMetrics(MetricName, uint64_t) override {}
};

// The host side of one interface version, for a CDM of type `Cdm`.
template <class Cdm>
class Host : public Metrics<typename Cdm::Host>, public Session {
 public:
  Cdm* cdm = nullptr;

  ~Host() override {
    if (cdm) cdm->Destroy();
  }

  // --- Session ---
  void initialize() override {
    cdm->Initialize(/*allow_distinctive_identifier=*/false,
                    /*allow_persistent_state=*/false,
                    /*use_hw_secure_codecs=*/false);
  }
  void generate(const uint8_t* init_data, uint32_t len) override {
    cdm->CreateSessionAndGenerateRequest(1, SessionType::kTemporary, InitDataType::kCenc,
                                         init_data, len);
  }
  void update(const uint8_t* license, uint32_t len) override {
    cdm->UpdateSession(2, session_id.c_str(), static_cast<uint32_t>(session_id.size()),
                       license, len);
  }
  Status decrypt(const InputBuffer_2& in, DecryptedBlock* out) override {
    return cdm->Decrypt(in, out);
  }
  void expire(void* context) override { cdm->TimerExpired(context); }

  // --- cdm::Host_10 / cdm::Host_11 ---
  Buffer* Allocate(uint32_t capacity) override { return new HeapBuffer(capacity); }
  void SetTimer(int64_t delay_ms, void* context) override {
    timers.push_back({Clock::now() + std::chrono::milliseconds(std::max<int64_t>(0, delay_ms)), context});
  }
  Time GetCurrentWallTime() override {
    using namespace std::chrono;
    return duration<double>(system_clock::now().time_since_epoch()).count();
  }
  void OnInitialized(bool success) override { initialized = true; init_ok = success; }
  void OnResolveKeyStatusPromise(uint32_t, KeyStatus) override { resolved = true; }
  void OnResolveNewSessionPromise(uint32_t, const char* sid, uint32_t n) override {
    session_id.assign(sid, n); resolved = true;
  }
  void OnResolvePromise(uint32_t) override { resolved = true; }
  void OnRejectPromise(uint32_t, Exception, uint32_t, const char* msg, uint32_t n) override {
    rejected = true; if (msg && n) error.assign(msg, n);
  }
  void OnSessionMessage(const char*, uint32_t, MessageType type, const char* msg, uint32_t n) override {
    message_type = type;
    got_message = true; challenge.assign(reinterpret_cast<const uint8_t*>(msg),
                                         reinterpret_cast<const uint8_t*>(msg) + n);
  }
  void OnSessionKeysChange(const char*, uint32_t, bool, const KeyInformation* keys, uint32_t count) override {
    usable = false; expired = false;
    for (uint32_t i = 0; i < count; ++i) {
      usable |= keys[i].status == kUsable;
      expired |= keys[i].status == kExpired;
    }
  }
  void OnExpirationChange(const char*, uint32_t, Time time) override { expiration = time; }
  void OnSessionClosed(const char*, uint32_t) override { usable = false; expired = true; }
  void SendPlatformChallenge(const char*, uint32_t, const char*, uint32_t) override {}
  void EnableOutputProtection(uint32_t) override {}
  void QueryOutputProtectionStatus() override {}
  void OnDeferredInitializationDone(StreamType, Status) override {}
  FileIO* CreateFileIO(FileIOClient*) override { return nullptr; }
  void RequestStorageId(uint32_t version) override { (void)version; }
};

Session* g_session = nullptr;

// Why the last load failed, for ch_load_error.
std::string g_load_error;

// Hands the CDM the host it was created with, when it asks for the version that host speaks.
template <class Cdm>
void* GetHost(int version, void* user_data) {
  using Wanted = typename Cdm::Host;
  if (version != Wanted::kVersion) return nullptr;
  return static_cast<Wanted*>(static_cast<Host<Cdm>*>(user_data));
}

using CreateFunc = void* (*)(int, const char*, uint32_t, GetCdmHostFunc, void*);

// Asks the module for a CDM of interface `Cdm`, or null when it was not built for that one.
template <class Cdm>
Session* create(CreateFunc make) {
  auto* host = new Host<Cdm>();
  const char* ks = "com.widevine.alpha";
  void* inst = make(Cdm::kVersion, ks, static_cast<uint32_t>(strlen(ks)), GetHost<Cdm>, host);
  if (!inst) {
    delete host;
    return nullptr;
  }
  host->cdm = static_cast<Cdm*>(inst);
  return host;
}

// Loads the module at a UTF-8 path, or returns null with g_load_error set. On Windows the
// module's own folder is searched for its dependencies, which is what a browser gives it too.
void* load(const char* path) {
#if defined(_WIN32)
  int length = MultiByteToWideChar(CP_UTF8, 0, path, -1, nullptr, 0);
  if (length <= 0) {
    g_load_error = "the module path is not utf-8";
    return nullptr;
  }
  std::wstring wide(static_cast<size_t>(length), L'\0');
  MultiByteToWideChar(CP_UTF8, 0, path, -1, &wide[0], length);
  HMODULE lib = LoadLibraryExW(wide.c_str(), nullptr, LOAD_WITH_ALTERED_SEARCH_PATH);
  if (!lib) g_load_error = "LoadLibraryExW failed with error " + std::to_string(GetLastError());
  return lib;
#else
  void* lib = dlopen(path, RTLD_NOW | RTLD_GLOBAL);
  if (!lib) {
    const char* reason = dlerror();
    g_load_error = reason ? reason : "dlopen failed";
  }
  return lib;
#endif
}

// One exported symbol of a loaded module, or null.
template <typename F>
F resolve(void* lib, const char* name) {
#if defined(_WIN32)
  FARPROC symbol = GetProcAddress(static_cast<HMODULE>(lib), name);
  return reinterpret_cast<F>(reinterpret_cast<void*>(symbol));
#else
  return reinterpret_cast<F>(dlsym(lib, name));
#endif
}

}  // namespace

extern "C" {

// 0 = success. 1 = the module did not load, see ch_load_error. 2 = it is not a CDM.
// 3 = no instance for either interface. 4 = the instance did not initialize.
int ch_open(const char* path) {
  delete g_session;
  g_session = nullptr;
  void* lib = load(path);
  if (!lib) return 1;
  auto init = resolve<void (*)()>(lib, "InitializeCdmModule_4");
  auto make = resolve<CreateFunc>(lib, "CreateCdmInstance");
  if (!init || !make) return 2;
  init();
  // A module answers only to the interface versions it was built for, and older Widevine
  // releases stop at 10.
  Session* session = create<ContentDecryptionModule_11>(make);
  if (!session) session = create<ContentDecryptionModule_10>(make);
  if (!session) return 3;
  g_session = session;
  session->initialize();
  session->wait([&] { return session->initialized; });
  return session->initialized && session->init_ok ? 0 : 4;
}

// The loader's reason for the last ch_open that answered 1. Valid until the next ch_open.
const char* ch_load_error() { return g_load_error.c_str(); }

// init_data = the CENC pssh box. Returns the license challenge in *out (malloc'd).
int ch_challenge(const uint8_t* init_data, uint32_t len, uint8_t** out, uint32_t* out_len) {
  Session* s = g_session;
  if (!s) return 10;
  s->got_message = false; s->rejected = false; s->challenge.clear();
  s->generate(init_data, len);
  s->wait([&] { return s->got_message || s->rejected; });
  if (s->rejected) return 11;
  if (!s->got_message) return 12;
  s->got_message = false;
  *out_len = static_cast<uint32_t>(s->challenge.size());
  if (*out_len == 0) {
    *out = nullptr;
    return 0;
  }
  *out = static_cast<uint8_t*>(malloc(*out_len));
  memcpy(*out, s->challenge.data(), *out_len);
  return 0;
}

// Feed the license response back into the CDM.
int ch_update(const uint8_t* license, uint32_t len) {
  Session* s = g_session;
  if (!s) return 20;
  s->rejected = false; s->resolved = false;
  s->update(license, len);
  s->wait([&] { return s->resolved || s->rejected; });
  if (s->rejected) return 21;
  if (!s->resolved) return 22;
  return s->usable ? 0 : 23;
}

// Called on the same host thread during idle time as well as before commands.
void ch_tick() { if (g_session) g_session->fire_timers(); }

// Sleep until the next timer is due; -1 lets the host block on its command pipe.
int64_t ch_timer_delay() {
  if (!g_session || g_session->timers.empty()) return -1;
  auto next = g_session->timers.front().first;
  for (const auto& timer : g_session->timers) next = std::min(next, timer.first);
  const auto remaining = next - Session::Clock::now();
  if (remaining <= Session::Clock::duration::zero()) return 0;
  return std::chrono::duration_cast<std::chrono::milliseconds>(remaining).count() + 1;
}

// One expiration flag followed by an optional licence renewal challenge.
int ch_status(uint8_t** out, uint32_t* out_len) {
  Session* s = g_session;
  if (!s) return 30;
  const double now = std::chrono::duration<double>(
      std::chrono::system_clock::now().time_since_epoch()).count();
  const bool renewal = s->got_message && s->message_type == kLicenseRenewal;
  *out_len = 1 + (renewal ? static_cast<uint32_t>(s->challenge.size()) : 0);
  *out = static_cast<uint8_t*>(malloc(*out_len));
  (*out)[0] = s->expired || (s->expiration > 0 && now >= s->expiration);
  if (renewal) {
    memcpy(*out + 1, s->challenge.data(), s->challenge.size());
    s->got_message = false;
    s->challenge.clear();
  }
  return 0;
}

// Decrypt one CENC buffer (single-key, key_id from the pssh). Returns cleartext.
// subs = flattened [clear0, cipher0, clear1, cipher1, ...] (u32 each), num_subs pairs.
int ch_decrypt(const uint8_t* data, uint32_t data_size,
               const uint8_t* key_id, uint32_t key_id_size,
               const uint8_t* iv, uint32_t iv_size,
               const uint32_t* subs, uint32_t num_subs,
               uint8_t** out, uint32_t* out_len) {
  if (!g_session) return 30;
  std::vector<SubsampleEntry> subsamples;
  subsamples.reserve(num_subs);
  for (uint32_t i = 0; i < num_subs; ++i) {
    SubsampleEntry e;
    e.clear_bytes = subs[i * 2];
    e.cipher_bytes = subs[i * 2 + 1];
    subsamples.push_back(e);
  }
  InputBuffer_2 in;
  memset(&in, 0, sizeof(in));
  in.data = data; in.data_size = data_size;
  in.encryption_scheme = EncryptionScheme::kCenc;
  in.key_id = key_id; in.key_id_size = key_id_size;
  in.iv = iv; in.iv_size = iv_size;
  in.subsamples = subsamples.empty() ? nullptr : subsamples.data();
  in.num_subsamples = num_subs;

  // DecryptedBlock + a Buffer come from the CDM/host; the CDM fills them.
  class Block : public DecryptedBlock {
   public:
    Buffer* buf = nullptr; int64_t ts = 0;
    ~Block() override { if (buf) buf->Destroy(); }
    void SetDecryptedBuffer(Buffer* b) override { buf = b; }
    Buffer* DecryptedBuffer() override { return buf; }
    void SetTimestamp(int64_t t) override { ts = t; }
    int64_t Timestamp() const override { return ts; }
  } block;

  Status s = g_session->decrypt(in, &block);
  if (s != Status::kSuccess) return 31 + static_cast<int>(s);
  Buffer* b = block.DecryptedBuffer();
  if (!b) return 40;
  *out_len = b->Size();
  if (*out_len == 0) {
    *out = nullptr;
    return 0;
  }
  *out = static_cast<uint8_t*>(malloc(*out_len));
  memcpy(*out, b->Data(), *out_len);
  return 0;
}

void ch_free(uint8_t* p) { free(p); }

}  // extern "C"
