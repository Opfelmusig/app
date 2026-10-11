export interface ScrollingTextMember {
  getTravelDuration: () => number;
  isHovered: () => boolean;
  createAnimations: (travelDuration: number) => Animation[];
}

export const scrollingTextGroupKey: InjectionKey<ReturnType<typeof createScrollingTextGroup>> =
  Symbol("scrolling-text-group");

export function createScrollingTextGroup() {
  const members = new Set<ScrollingTextMember>();
  let animations: Animation[] = [];
  let frame: number | undefined;

  function cancelAnimations() {
    animations.forEach((animation) => animation.cancel());
    animations = [];
  }

  function syncPlayback() {
    const paused = [...members].some((member) => member.isHovered());

    animations.forEach((animation) => {
      if (paused) animation.pause();
      else animation.play();
    });
  }

  function restart() {
    if (frame !== undefined) return;

    frame = requestAnimationFrame(() => {
      frame = undefined;
      cancelAnimations();

      const travelDuration = Math.max(
        0,
        ...[...members].map((member) => member.getTravelDuration()),
      );
      animations = [...members].flatMap((member) =>
        member.getTravelDuration() > 0 ? member.createAnimations(travelDuration) : [],
      );
      syncPlayback();
    });
  }

  function register(member: ScrollingTextMember) {
    members.add(member);
    restart();

    return () => {
      members.delete(member);

      if (members.size) {
        restart();
      } else {
        if (frame !== undefined) cancelAnimationFrame(frame);
        frame = undefined;
        cancelAnimations();
      }
    };
  }

  return { register, restart, syncPlayback };
}
