import * as React from 'react';
import { getConnectedDevices } from './lib/devices';
import { LocalPreview } from './Containers/LocalPreview';

const App = () => {
  const [, setDevices] = React.useState<MediaDeviceInfo[]>([]);
  React.useEffect(() => {
    const getDevices = async () => {
      const devices: MediaDeviceInfo[] | null = await getConnectedDevices();
      if (devices) setDevices(devices);
    };
    getDevices();
  }, [setDevices]);

  return (
    <div className="app">
      <main className="app-main">
        <LocalPreview />
      </main>
    </div>
  );
};

export default App;
