export const startMediaStream = async (
  constraints: MediaStreamConstraints
): Promise<MediaStream | null> => {
  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    console.log('startMediaStream', mediaStream);
    return mediaStream;
  } catch (err) {
    console.log('Error getting media stream', err);
    return null;
  }
};

export const stopMediaStream = (
  stream: MediaStream,
  kind?: 'audio' | 'video'
) => {
  try {
    const tracks = getMediaStreamTracks(stream, kind);
    tracks.forEach((track: MediaStreamTrack) => {
      track.stop();
      track.enabled = false;
    });
    console.log('Stopped media stream tracks');
    return true;
  } catch (err) {
    console.log('Failed to stop media stream', err);
    return false;
  }
};

export const getMediaStreamTracks = (
  stream: MediaStream,
  kind?: 'audio' | 'video'
): MediaStreamTrack[] => {
  if (kind === 'audio') {
    return stream.getAudioTracks();
  } else if (kind === 'video') {
    return stream.getVideoTracks();
  } else {
    return stream.getTracks();
  }
};
