import * as React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { getConnectedDevices } from './lib/devices';
import { LocalPreview } from './Containers/LocalPreview';
import { Call } from './Containers/Call';
import './App.scss';

type JoinStatus = 'joining' | 'joined' | 'leaving' | 'out';

const App = () => {
  const [, setDevices] = React.useState<MediaDeviceInfo[]>([]);
  React.useEffect(() => {
    const getDevices = async () => {
      const devices: MediaDeviceInfo[] | null = await getConnectedDevices();
      if (devices) setDevices(devices);
    };
    getDevices();
  }, [setDevices]);

  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [joinStatus, setJoinStatus] = React.useState<JoinStatus>('out');

  return (
    <BrowserRouter>
      <div className="app">
        <main className="app-main">
          <Switch>
            <Route
              path="/join"
              exact
              render={(routeProps) => (
                <LocalPreview
                  {...routeProps}
                  stream={stream}
                  setStream={setStream}
                  joinStatus={joinStatus}
                  setJoinStatus={setJoinStatus}
                />
              )}
            />
            <Route
              path="/call"
              exact
              render={(routeProps) => (
                <Call
                  {...routeProps}
                  stream={stream}
                  joinStatus={joinStatus}
                  setJoinStatus={setJoinStatus}
                />
              )}
            />
            <Route path="/" exact>
              <Redirect to="/join" />
            </Route>
          </Switch>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
