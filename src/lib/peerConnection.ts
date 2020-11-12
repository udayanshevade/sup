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

let pc1Local: RTCPeerConnection | null;
let pc1Remote: RTCPeerConnection | null;
let pc2Local: RTCPeerConnection | null;
let pc2Remote: RTCPeerConnection | null;

export const call = (localStream: MediaStream) => {
  // instantiate and store new peer connections
  pc1Local = new RTCPeerConnection();
  pc1Remote = new RTCPeerConnection();

  pc1Remote.addEventListener('track', (e: Event) => handleRemoteStream(e));
  pc1Local.addEventListener('icecandidate', (e: Event) =>
    iceCallbackLocal(pc1Local, 'pc1', e)
  );
  pc1Remote.addEventListener('icecandidate', (e: Event) =>
    iceCallbackRemote(pc1Remote, 'pc1', e)
  );

  console.log('pc1: created local and remote peer connection objects');

  pc2Local = new RTCPeerConnection();
  pc2Remote = new RTCPeerConnection();

  pc2Remote.addEventListener('track', (e: Event) => handleRemoteStream(e));
  pc2Local.addEventListener('icecandidate', (e: Event) =>
    iceCallbackLocal(pc2Local, 'pc2', e)
  );
  pc2Remote.addEventListener('icecandidate', (e: Event) =>
    iceCallbackRemote(pc2Remote, 'pc2', e)
  );

  const localTracks: MediaStreamTrack[] = getMediaStreamTracks(localStream);

  localTracks.forEach((track) => pc1Local!.addTrack(track, localStream));

  console.log('Adding local stream to pc1Local');
  pc1Local
    .createOffer(offerOptions)
    .then(
      (desc) => gotDescriptionLocal(pc1Local, pc1Remote, desc),
      onCreateSessionDescriptionError
    );

  localTracks.forEach((track) => pc2Local!.addTrack(track, localStream));
  console.log('Adding local stream to pc2Local');
  pc2Local
    .createOffer(offerOptions)
    .then(
      (desc) => gotDescriptionLocal(pc2Local, pc2Remote, desc),
      onCreateSessionDescriptionError
    );
};

export const hangup = () => {
  console.log('Ending calls');
  if (pc1Local) pc1Local.close();
  if (pc1Remote) pc1Remote.close();
  if (pc2Local) pc2Local.close();
  if (pc2Remote) pc2Remote.close();
  pc1Local = pc1Remote = null;
  pc2Local = pc2Remote = null;
};
