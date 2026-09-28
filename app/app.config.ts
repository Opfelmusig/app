export default defineAppConfig({
  ui: {
    colors: {
      neutral: "neutral",
      secondary: "purple",
    },
    button: {
      slots: {
        base: "select-none",
      },
    },
    slider: {
      slots: {
        thumb: "size-0! opacity-0",
        range: "rounded-none",
        track: "bg-inverted/10",
      },
      defaultVariants: {
        color: "neutral",
      },
    },
  },
});
