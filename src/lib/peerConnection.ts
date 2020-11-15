import { getMediaStreamTracks } from './stream';

const onAddIceCandidateSuccess = () => {
  console.log('AddIceCandidate success');
};

const onAddIceCandidateError = (error: Error) => {
  console.log(`Failed to add ICE candidate: ${error.toString()}`);
};

const handleCandidate = async (
  candidate: RTCIceCandidate,
  destination: RTCPeerConnection,
  prefix: string,
  type: string
) => {
  try {
    await destination.addIceCandidate(candidate);
    onAddIceCandidateSuccess();
    console.log(
      `${prefix}: New ${type} ICE candidate: ${
        candidate ? candidate.candidate : '(null)'
      }`
    );
  } catch (err) {
    onAddIceCandidateError(err);
  }
};

const iceCallbackLocal = (
  pc: RTCPeerConnection | null,
  prefix: string,
  e: Event
) => {
  const { candidate } = e as RTCPeerConnectionIceEvent;
  if (!pc || !candidate) return;
  handleCandidate(candidate, pc, prefix, 'local');
};

const iceCallbackRemote = (
  pc: RTCPeerConnection | null,
  prefix: string,
  e: Event
) => {
  const { candidate } = e as RTCPeerConnectionIceEvent;
  if (!pc || !candidate) return;
  handleCandidate(candidate, pc, prefix, 'local');
};

const offerOptions: {
  offerToReceiveAudio: boolean;
  offerToReceiveVideo: boolean;
} = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
};

const onCreateSessionDescriptionError = (error: Error) => {
  console.error(`Failed to create session description: ${error.toString()}`);
};

const gotDescriptionRemote = async (
  pcLocal: RTCPeerConnection,
  pcRemote: RTCPeerConnection,
  desc: RTCSessionDescriptionInit
) => {
  pcRemote.setLocalDescription(desc);
  console.log(`Answer from pc1Remote ${desc.sdp}`);
  pcLocal.setRemoteDescription(desc);
};

const gotDescriptionLocal = async (
  pcLocal: RTCPeerConnection | null,
  pcRemote: RTCPeerConnection | null,
  desc: RTCSessionDescriptionInit
) => {
  if (!pcLocal || !pcRemote) return;
  pcLocal.setLocalDescription(desc);
  console.log(`Offer from pc local ${desc.sdp}`);
  pcRemote.setRemoteDescription(desc);
  // Since the 'remote' side has no media stream we need
  // to pass in the right constraints in order for it to
  // accept the incoming offer of audio and video.
  try {
    const answer = await pcRemote.createAnswer();
    gotDescriptionRemote(pcLocal, pcRemote, answer);
  } catch (err) {
    onCreateSessionDescriptionError(err);
  }
};

type ConnectionPair = {
  local: RTCPeerConnection | null;
  remote: RTCPeerConnection | null;
};
let peerConnections: ConnectionPair[] = [];

const checkStreams = (stream: MediaStream) => {
  const audioTracks = getMediaStreamTracks(stream, 'audio');
  const videoTracks = getMediaStreamTracks(stream, 'video');
  if (audioTracks.length > 0) {
    console.log(`Using audio device: ${audioTracks[0].label}`);
  }
  if (videoTracks.length > 0) {
    console.log(`Using video device: ${videoTracks[0].label}`);
  }
};

export const call = (
  localStream: MediaStream,
  handleRemoteStream: (stream: MediaStream) => void,
  numVideos: number | undefined = 2
) => {
  checkStreams(localStream);

  const initLocalAndRemotePair = (
    index: number
  ): { local: RTCPeerConnection; remote: RTCPeerConnection } => {
    // instantiate and store new peer connections
    const local: RTCPeerConnection = new RTCPeerConnection();
    const remote: RTCPeerConnection = new RTCPeerConnection();
    remote.ontrack = (e: Event) => {
      const { streams } = e as RTCTrackEvent;
      handleRemoteStream(streams[0]);
    };
    local.onicecandidate = (e: Event) => {
      iceCallbackLocal(remote, `connection ${index}`, e);
    };
    remote.onicecandidate = (e: Event) => {
      iceCallbackRemote(local, `connection ${index}`, e);
    };

    console.log(
      `connection ${index}: created local and remote peer connection objects`
    );

    return { local, remote };
  };

  new Array(numVideos).fill(0).forEach((_, i) => {
    const { local, remote } = initLocalAndRemotePair(i);
    peerConnections.push({ local, remote });
  });

  const processLocalAndRemotePair = async (
    stream: MediaStream,
    { local, remote }: ConnectionPair,
    i: number
  ) => {
    if (!local || !remote) return;
    const localTracks: MediaStreamTrack[] = getMediaStreamTracks(stream);
    localTracks.forEach((track: MediaStreamTrack) =>
      local!.addTrack(track, stream)
    );
    console.log(`Adding local stream to local peer connection ${i}`);
    try {
      const desc = await local.createOffer(offerOptions);
      gotDescriptionLocal(local, remote, desc);
    } catch (err) {
      onCreateSessionDescriptionError(err);
    }
  };

  peerConnections.forEach(({ local, remote }: ConnectionPair, i: number) => {
    processLocalAndRemotePair(localStream, { local, remote }, i);
  });
};

export const hangup = () => {
  console.log('Ending call');
  peerConnections.forEach((pair: ConnectionPair) => {
    if (pair.local) pair.local.close();
    if (pair.remote) pair.remote.close();
    pair.local = null;
    pair.remote = null;
  });
  peerConnections = [];
};
