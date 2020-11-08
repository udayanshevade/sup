export const getMediaStream = async (
  constraints: MediaStreamConstraints
): Promise<MediaStream | null> => {
  try {
    const mediaStream = navigator.mediaDevices.getUserMedia(constraints);
    console.log('getMediaStream', mediaStream);
    return mediaStream;
  } catch (err) {
    console.log('Error getting media stream', err);
    return null;
  }
};
