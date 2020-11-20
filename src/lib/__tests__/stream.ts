import { isExportDeclaration } from 'typescript';
import * as streamMethods from '../stream';

describe('Stream methods', () => {
  it('startMediaStream', async () => {
    jest.spyOn(navigator.mediaDevices, 'getUserMedia');
    const constraints = { audio: true, video: true };
    const res = await streamMethods.startMediaStream(constraints);
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
    expect(res).toEqual(expect.objectContaining(constraints));
    jest.restoreAllMocks();
  });

  it('stopMediaStream', () => {
    const mediaStream = new MediaStream();
    streamMethods.stopMediaStream(mediaStream);
    const tracks = mediaStream.getTracks();
    expect(tracks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ enabled: false, readyState: 'ended' }),
      ])
    );
  });

  it('getMediaStreamTracks', () => {
    const tracks = streamMethods.getMediaStreamTracks(new MediaStream());
    expect(tracks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'audio' || 'video' }),
      ])
    );
  });
});
