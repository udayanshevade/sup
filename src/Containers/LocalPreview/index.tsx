import * as React from 'react';
import { startMediaStream, stopMediaStream } from '../../lib/stream';
import { Video } from '../../components/Video';
import { CamIconOn, CamIconOff } from '../../components/Icons/Cam';
import './index.scss';

type LocalPreviewStatus =
  | 'disabled'
  | 'starting'
  | 'started'
  | 'stopping'
  | 'stopped';

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
export const LocalPreview = () => {
  const [stream, setStream] = React.useState<MediaStream | null>(null);
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
      setStatus('stopped');
      return;
    }
    setStream(stream);
  };

  const stopStream = async (stream: MediaStream | null) => {
    setStatus('stopping');
    if (stream) stopMediaStream(stream);
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
    <div className="video-container">
      <Video
        id="previewVideo"
        className="preview-video"
        stream={stream}
        getVideoRef={getVideoRef}
      />
      <div className="buttons-tray">
        <button
          className="preview-button"
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
            <CamIconOff />
          ) : status === 'stopped' || status === 'starting' ? (
            <CamIconOn />
          ) : null}
        </button>
      </div>
    </div>
  );
};
