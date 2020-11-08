import * as React from 'react';

export const Video = ({
  id,
  className,
  stream,
  autoPlay = true,
  playsInline = true,
  controls = false,
  getVideoRef,
}: {
  id?: string;
  className?: string;
  stream: MediaStream | null;
  autoPlay?: boolean;
  playsInline?: boolean;
  controls?: boolean;
  getVideoRef?: (ref: HTMLVideoElement) => void;
}) => {
  const [ref, setRef] = React.useState<HTMLVideoElement | null>(null);

  const getRef = React.useCallback(
    (node) => {
      if (node) {
        if (getVideoRef) getVideoRef(node);
        setRef(node);
      }
    },
    [getVideoRef]
  );

  React.useEffect(() => {
    if (ref !== null) {
      ref.srcObject = stream;
    }
  }, [ref, stream]);

  return (
    <video
      id={id}
      className={className}
      ref={getRef}
      autoPlay={autoPlay}
      playsInline={playsInline}
      controls={controls}
    />
  );
};
