import * as React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Video } from '../../components/Video';
import { CallEnd } from '../../components/Icons/Call';
import { call, hangup } from '../../lib/peerConnection';
import './index.scss';

type LocalPreviewStatus =
  | 'disabled'
  | 'starting'
  | 'started'
  | 'stopping'
  | 'stopped';

type JoinStatus = 'joining' | 'joined' | 'leaving' | 'out';

export const Call = ({
  stream,
  setJoinStatus,
  joinStatus,
}: {
  stream: MediaStream | null;
  setJoinStatus: (joinStatus: JoinStatus) => void;
  joinStatus: JoinStatus;
}) => {
  const [remoteStreams, setRemoteStreams] = React.useState<MediaStream[]>([]);
  const [, setStatus] = React.useState<LocalPreviewStatus>('stopped');
  const history = useHistory();

  const localVideoRef = React.useRef<HTMLVideoElement | null>(null);
  const onLocalVideoLoadedHandlerRef = React.useRef(() => {
    console.log('video stream has loaded');
    setStatus('started');
  });

  const handleRemoteStream = (newStream: MediaStream) => {
    setRemoteStreams((currentStreams) => {
      return currentStreams.includes(newStream)
        ? currentStreams
        : [...currentStreams, newStream];
    });
  };

  const handleHangup = React.useCallback(() => {
    setJoinStatus('leaving');
    hangup();
    setRemoteStreams([]);
    setJoinStatus('out');
  }, [setJoinStatus]);

  const getLocalVideoRef = (node: HTMLVideoElement) => {
    if (node) {
      // clean up previous ref if exists and hasn't loaded yet
      if (localVideoRef.current) {
        localVideoRef.current.removeEventListener(
          'loadeddata',
          onLocalVideoLoadedHandlerRef.current
        );
      }
      node.addEventListener(
        'canplaythrough',
        onLocalVideoLoadedHandlerRef.current
      );
      localVideoRef.current = node;
    }
  };

  React.useEffect(() => {
    const handleCall = async (stream: MediaStream): Promise<void> => {
      setJoinStatus('joining');
      await call(stream, handleRemoteStream, 2);
      setJoinStatus('joined');
    };

    if (!stream) return;
    handleCall(stream);

    return () => {
      if (stream) handleHangup();
    };
  }, [stream, setJoinStatus, handleHangup]);

  React.useEffect(() => {
    if (!['joining', 'joined', 'leaving'].includes(joinStatus)) {
      handleHangup();
      history.push('/join');
    }
  }, [joinStatus, setJoinStatus, handleHangup, history]);

  return (
    <div className="call-container">
      <div className="call-local-video">
        <Video
          id="previewVideo"
          className="preview-video"
          stream={stream}
          getVideoRef={getLocalVideoRef}
        />
      </div>
      <div className="videos-container">
        {remoteStreams.map((remoteStream, i) => (
          <div key={`remoteStream${i}`} className="video-container">
            <Video
              id={`remoteStream${i}`}
              className="remote-video"
              stream={remoteStream}
            />
          </div>
        ))}
      </div>
      <div className="buttons-tray">
        <Link to="/join">
          <button className="exit-button" disabled={joinStatus !== 'joined'}>
            <CallEnd className="action-icon" />
          </button>
        </Link>
      </div>
    </div>
  );
};
