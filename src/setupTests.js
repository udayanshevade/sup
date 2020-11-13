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
// mockDevice.__proto__ = MediaDeviceInfo.prototype;
window.navigator = {
  mediaDevices: {
    enumerateDevices() {
      return new Promise((res) => res([mockDevice]));
    },
  },
};
