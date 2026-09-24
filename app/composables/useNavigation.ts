export default function useNavigation() {
  const router = useRouter();

  function canNavigate(direction: "back" | "forward") {
    if (router.currentRoute.value.path === "/login") return false;

    const target = router.options.history.state[direction];
    return typeof target === "string" && router.resolve(target).path !== "/login";
  }

  const canGoBack = computed(() => canNavigate("back"));
  const canGoForward = computed(() => canNavigate("forward"));

  function goBack() {
    if (canNavigate("back")) router.back();
  }

  function goForward() {
    if (canNavigate("forward")) router.forward();
  }

  function reload() {
    window.location.reload();
  }

  return { goBack, goForward, canGoBack, canGoForward, reload };
}
