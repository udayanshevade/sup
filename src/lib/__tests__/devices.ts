import { getConnectedDevices, listenToMediaDevicesChange } from '../devices';

describe('devices handlers', () => {
  it('should get devices', async () => {
    const devices = await getConnectedDevices();
    expect(devices).toEqual([
      {
        deviceId: 'default',
        kind: 'audiooutput',
        label: '',
        groupId: 'default',
      },
    ]);
  });

  it('should assign a devicechange handler', async () => {
    const handler = jest.fn();
    listenToMediaDevicesChange(handler);
    const event = new Event('devicechange');
    await navigator.mediaDevices.dispatchEvent(event);
    expect(handler).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          deviceId: 'default',
          kind: 'audiooutput',
          label: '',
          groupId: 'default',
        }),
      ])
    );
  });
});
