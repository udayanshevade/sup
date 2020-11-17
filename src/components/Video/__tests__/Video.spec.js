import { render, screen, waitFor } from '@testing-library/react';
import { Video } from '../';

describe('Video', () => {
  const defaultProps = {
    id: 'foo',
    className: 'foo',
    stream: {},
    autoPlay: true,
    playsInline: true,
    controls: true,
    getVideoRef: jest.fn(),
  };

  it('should render', () => {
    render(<Video {...defaultProps} />);
    const video = screen.getByTestId('video-element');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('id', defaultProps.id);
    expect(video).toHaveClass(defaultProps.className);
    expect(video).toHaveAttribute('autoPlay');
    expect(video).toHaveAttribute('playsInline');
    expect(video).toHaveAttribute('controls');
  });

  it('should set the srcObject', async () => {
    render(<Video {...defaultProps} />);
    const video = screen.getByTestId('video-element');
    await waitFor(() =>
      expect(video).toHaveProperty('srcObject', defaultProps.stream)
    );
  });

  it('expect passed down video ref callback to be called', () => {
    render(<Video {...defaultProps} />);
    expect(defaultProps.getVideoRef).toHaveBeenCalled();
  });
});
