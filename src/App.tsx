import * as React from 'react';
import { getConnectedDevices, listenToMediaDevicesChange } from './lib/devices';
import { getMediaStream } from './lib/stream';
import { Video } from './components/Video';
import './App.css';

const App = () => {
  const [, setDevices] = React.useState<MediaDeviceInfo[]>([]);
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  React.useEffect(() => {
    const handleDevices = (queriedDevices: MediaDeviceInfo[] | null) => {
      if (queriedDevices) {
        setDevices(queriedDevices);
      } else {
        setDevices([]);
      }
    };

    const getDevices = async () => {
      const queriedDevices:
        | MediaDeviceInfo[]
        | null = await getConnectedDevices();
      handleDevices(queriedDevices);
    };
    // initial devices query
    getDevices();
    // set listener for device change
    listenToMediaDevicesChange(handleDevices);

    // init stream
    const initStream = async () => {
      const stream = await getMediaStream({ video: true, audio: true });
      setStream(stream);
    };

    initStream();
  }, []);
  return (
    <div className="app">
      <main className="app-main">
        <h1>Hello</h1>
        <Video id="previewVideo" className="previewVideo" stream={stream} />
      </main>
    </div>
  );
};

export default App;
