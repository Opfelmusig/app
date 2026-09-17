import { AppleMusicError } from "@opfelmusig/lib";

export default function (ex: unknown) {
  return ex instanceof AppleMusicError && ex.status === 403;
}
