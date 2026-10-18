export const useSidebar = createSharedComposable(() => {
  const {
    el,
    size: width,
    isCollapsed,
    isDragging,
    onMouseDown,
    onTouchStart,
    onDoubleClick: reset,
  } = useResizable("opfelmusig:sidebar", {
    side: "left",
    unit: "px",
    minSize: 200,
    maxSize: 320,
    defaultSize: 260,
    collapsible: true,
    collapsedSize: 56,
    storage: "local",
  });

  function toggle() {
    isCollapsed.value = !isCollapsed.value;
  }

  return { el, width, isCollapsed, isDragging, onMouseDown, onTouchStart, toggle, reset };
});
