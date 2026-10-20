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
      variants: {
        size: {
          md: {
            item: "px-2.5",
            label: "px-2.5",
          },
        },
      },
    },
    contextMenu: {
      slots: {
        content: "w-48 rounded-xl",
      },
      variants: {
        size: {
          md: {
            item: "px-2.5",
            label: "px-2.5",
          },
        },
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
