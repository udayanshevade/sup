import { render, screen } from '@testing-library/react';
import { Video } from '../';

describe('Video', () => {
  it('should render', () => {
    const defaultProps = {
      id: 'foo',
      className: 'foo',
      stream: {},
      autoPlay: true,
      playsInline: true,
      controls: false,
      getVideoRef: jest.fn(),
    };
    render(<Video {...defaultProps} />);
    expect(screen.getByTestId('video-element')).toBeInTheDocument();
  });
});
