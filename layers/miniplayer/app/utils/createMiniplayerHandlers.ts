export default function createMiniplayerHandlers(): MiniplayerFunctions {
  const miniplayerStore = useMiniplayerStore();

  return {
    setLayout: miniplayerStore.setLayout,
    setPlayback: miniplayerStore.setPlayback,
    updatePosition: miniplayerStore.updatePosition,
  };
}
