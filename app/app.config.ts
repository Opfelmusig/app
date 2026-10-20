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
    modal: {
      slots: {
        footer: "justify-end",
      },
      variants: {
        fullscreen: {
          false: {
            content: "max-w-md rounded-xl",
          },
        },
      },
    },
    dropdownMenu: {
      slots: {
        content: "w-48 rounded-xl",
      },
    },
    contextMenu: {
      slots: {
        content: "w-48 rounded-xl",
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
