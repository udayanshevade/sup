import * as React from 'react';
import { Link } from 'react-router-dom';
import { startMediaStream, stopMediaStream } from '../../lib/stream';
import { Video } from '../../components/Video';
import { CamIconOn, CamIconOff } from '../../components/Icons/Cam';
import { CallStart } from '../../components/Icons/Call';
import './index.scss';

type LocalPreviewStatus =
  | 'disabled'
  | 'starting'
  | 'started'
  | 'stopping'
  | 'stopped';

type JoinStatus = 'joining' | 'joined' | 'leaving' | 'out';

/**
 * Local A/V preview
 * if loading stream, show loading indicator
 * if loaded stream, show video
 * if turned off, show black screen
 *
 * always show start/stop button
 * there is an async delay in the stream handling
 * need to handle inconsistent states
 *
 * debounce button action
 */
export const LocalPreview = ({
  stream,
  setStream,
  joinStatus,
  setJoinStatus,
}: {
  stream: MediaStream | null;
  setStream: (stream: MediaStream | null) => void;
  joinStatus: JoinStatus;
  setJoinStatus: (joinStatus: JoinStatus) => void;
}) => {
  const [status, setStatus] = React.useState<LocalPreviewStatus>('stopped');

  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const onVideoLoadedHandlerRef = React.useRef(() => {
    console.log('video stream has loaded');
    setStatus('started');
  });

  const startStream = async () => {
    setStatus('starting');
    const stream = await startMediaStream({ video: true, audio: true });
    if (!stream) {
      console.error('Something went wrong while starting the stream');
      setStatus('stopped');
      return;
    }
    setStream(stream);
  };

  const stopStream = async (stream: MediaStream | null) => {
    setStatus('stopping');
    if (stream) {
      stopMediaStream(stream);
      setStream(null);
    }
    setStatus('stopped');
  };

  const getVideoRef = (node: HTMLVideoElement) => {
    if (node) {
      // clean up previous ref if exists and hasn't loaded yet
      if (videoRef.current) {
        videoRef.current.removeEventListener(
          'loadeddata',
          onVideoLoadedHandlerRef.current
        );
      }
      node.addEventListener('canplaythrough', onVideoLoadedHandlerRef.current);
      videoRef.current = node;
    }
  };

  return (
    <div className="container">
      <div className="local-preview-container">
        <div className="video-container">
          <Video
            id="previewVideo"
            className="preview-video"
            stream={stream}
            getVideoRef={getVideoRef}
          />
          <div className="buttons-tray">
            <button
              className="action-button preview-button"
              disabled={status === 'starting' || status === 'stopping'}
              onClick={
                status === 'started'
                  ? () => stopStream(stream)
                  : status === 'stopped'
                  ? () => startStream()
                  : undefined
              }
            >
              {status === 'started' || status === 'stopping' ? (
                <CamIconOff className="action-icon" />
              ) : status === 'stopped' || status === 'starting' ? (
                <CamIconOn className="action-icon" />
              ) : null}
            </button>
            {joinStatus === 'out' && Boolean(stream) && (
              <button
                className="action-button join-button"
                onClick={() => setJoinStatus('joining')}
              >
                <Link to="/call">
                  <CallStart className="action-icon" />
                </Link>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
