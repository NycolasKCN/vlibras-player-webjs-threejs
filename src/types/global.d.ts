export {};

declare global {
  interface UnityPlayerInstance {
    SendMessage(gameObject: string, method: string, param?: string | number): void;
  }

  interface UnityLoaderStatic {
    SystemInfo: { hasWebGL: boolean };
    instantiate(
      containerId: string,
      jsonUrl: string,
      options: {
        compatibilityCheck?: (
          arg: unknown,
          accept: () => void,
          deny: () => void
        ) => void;
      }
    ): UnityPlayerInstance;
  }

  const UnityLoader: UnityLoaderStatic;

  interface Window {
    VLibras?: { Player: typeof import("../Player").default };
    onLoadPlayer?: () => void;
    updateProgress?: (progress: number) => void;
    onPlayingStateChange?: (
      isPlaying: unknown,
      isPaused: unknown,
      isPlayingIntervalAnimation: unknown,
      isLoading: unknown,
      isRepeatable: unknown
    ) => void;
    CounterGloss?: (counter: number, glosaLength: string) => void;
    GetAvatar?: (avatar: string) => void;
    FinishWelcome?: (value: boolean) => void;
  }
}
