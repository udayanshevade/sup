import { getMediaStreamTracks } from './stream';

const handleRemoteStream = (e: Event) => {
  const { streams } = e as RTCTrackEvent;
  // if (video.srcObject !== streams[0]) {
  //   video.srcObject = streams[0];
  //   console.log('video received remote stream');
  // }
  console.log(streams[0]);
};

const onAddIceCandidateSuccess = () => {
  console.log('AddIceCandidate success');
};

const onAddIceCandidateError = (error: Error) => {
  console.log(`Failed to add ICE candidate: ${error.toString()}`);
};

const handleCandidate = (
  candidate: RTCIceCandidate,
  dest: RTCPeerConnection,
  prefix: string,
  type: string
) => {
  dest
    .addIceCandidate(candidate)
    .then(onAddIceCandidateSuccess, onAddIceCandidateError);
  console.log(
    `${prefix}: New ${type} ICE candidate: ${
      candidate ? candidate.candidate : '(null)'
    }`
  );
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
  console.log(`Failed to create session description: ${error.toString()}`);
};

const gotDescriptionRemote = (
  pcLocal: RTCPeerConnection,
  pcRemote: RTCPeerConnection,
  desc: RTCSessionDescriptionInit
) => {
  pcRemote.setLocalDescription(desc);
  console.log(`Answer from pc1Remote ${desc.sdp}`);
  pcLocal.setRemoteDescription(desc);
};

const gotDescriptionLocal = (
  pcLocal: RTCPeerConnection | null,
  pcRemote: RTCPeerConnection | null,
  desc: RTCSessionDescriptionInit
) => {
  if (!pcLocal || !pcRemote) return;
  pcLocal.setLocalDescription(desc);
  console.log(`Offer from pc ${desc.sdp}`);
  pcRemote.setRemoteDescription(desc);
  // Since the 'remote' side has no media stream we need
  // to pass in the right constraints in order for it to
  // accept the incoming offer of audio and video.
  pcRemote
    .createAnswer()
    .then(
      (desc) => gotDescriptionRemote(pcLocal, pcRemote, desc),
      onCreateSessionDescriptionError
    );
};

type ConnectionPair = {
  local: RTCPeerConnection | null;
  remote: RTCPeerConnection | null;
};
let peerConnections: ConnectionPair[] = [];

export const call = (
  localStream: MediaStream,
  numVideos: number | undefined = 2
) => {
  const initLocalAndRemotePair = (
    index: number
  ): { local: RTCPeerConnection; remote: RTCPeerConnection } => {
    // instantiate and store new peer connections
    const local: RTCPeerConnection = new RTCPeerConnection();
    const remote: RTCPeerConnection = new RTCPeerConnection();
    remote.addEventListener('track', (e: Event) => handleRemoteStream(e));
    local.addEventListener('icecandidate', (e: Event) =>
      iceCallbackLocal(local, `connection ${index}`, e)
    );
    remote.addEventListener('icecandidate', (e: Event) =>
      iceCallbackRemote(remote, `connection ${index}`, e)
    );

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
    localStream: MediaStream,
    { local, remote }: ConnectionPair,
    i: number
  ) => {
    if (!local || !remote) return;
    const localTracks: MediaStreamTrack[] = getMediaStreamTracks(localStream);
    localTracks.forEach((track) => local!.addTrack(track, localStream));
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
  console.log('Ending calls');
  peerConnections.forEach((pair: ConnectionPair) => {
    if (pair.local) pair.local.close();
    if (pair.remote) pair.remote.close();
    pair.local = null;
    pair.remote = null;
  });
  peerConnections = [];
};
