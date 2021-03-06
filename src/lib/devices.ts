export const getConnectedDevices = async (
  kind?: string
): Promise<MediaDeviceInfo[] | null> => {
  try {
    console.log(navigator);
    let devices: MediaDeviceInfo[] = await navigator.mediaDevices.enumerateDevices();
    if (kind) {
      devices = devices.filter(
        ({ kind: deviceKind }: MediaDeviceInfo): boolean => deviceKind === kind
      );
    }
    console.log('getConnectedDevices', devices);
    return devices;
  } catch (err) {
    console.log('Failed to query media devices', err);
    return null;
  }
};

export const listenToMediaDevicesChange = (
  handleDevices: (devices: MediaDeviceInfo[] | null) => void
) => {
  navigator.mediaDevices.addEventListener(
    'devicechange',
    async (event: Event) => {
      const devices: MediaDeviceInfo[] | null = await getConnectedDevices();
      console.log('Devices changed', devices);
      handleDevices(devices);
    }
  );
};
