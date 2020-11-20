// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

const mockDevice = {
  deviceId: 'default',
  kind: 'audiooutput',
  label: '',
  groupId: 'default',
};

global.navigator.mediaDevices = {
  events: {},
  async getUserMedia(constraints) {
    return { ...constraints };
  },
  enumerateDevices() {
    return new Promise((res) => res([mockDevice]));
  },
  addEventListener(event, callback) {
    this.events[event] = this.events[event]
      ? [...this.events[event], callback]
      : [callback];
  },
  async dispatchEvent(event) {
    const callbacks = this.events[event.type];
    if (!callbacks) return;
    await Promise.all(callbacks.map((callback) => callback(event)));
  },
};

global.MediaStream = class {
  constructor() {
    this.name = 'MediaStream';
    this.tracks = [
      new MediaStreamTrack({ kind: 'audio' }),
      new MediaStreamTrack({ kind: 'video' }),
    ];
  }
  getAudioTracks() {
    return this.tracks.filter(({ kind }) => kind === 'audio');
  }
  getVideoTracks() {
    return this.tracks.filter(({ kind }) => kind === 'video');
  }
  getTracks() {
    return [...this.getAudioTracks(), ...this.getVideoTracks()];
  }
};

global.MediaStreamTrack = class {
  constructor({ kind }) {
    this.name = 'MediaStreamTrack';
    this.kind = kind;
    this.label = `${kind} device label`;
    this.muted = false;
    this.enabled = true;
    this.readyState = 'live';
  }
  stop() {
    this.readyState = 'ended';
  }
};
