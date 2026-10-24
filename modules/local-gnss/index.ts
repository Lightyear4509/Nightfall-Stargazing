import { requireNativeModule } from 'expo-modules-core';

export type DeviceCoordinates = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

type LocalGnssNative = {
  start(): Promise<void>;
  stop(): Promise<void>;
  addListener(eventName: 'onLocation', listener: (location: DeviceCoordinates) => void): { remove(): void };
};

export function useLocalGnss() {
  const nativeModule = requireNativeModule<LocalGnssNative>('LocalGnss');
  return {
    start: () => nativeModule.start(),
    stop: () => nativeModule.stop(),
    addListener: (listener: (location: DeviceCoordinates) => void) => nativeModule.addListener('onLocation', listener),
  };
}
