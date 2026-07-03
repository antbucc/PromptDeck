// src/components/ImageOutput/ImageOutput.tsx
import React, { useState } from 'react';

interface ImageOutputProps {
  src: string;
  alt?: string;
}

// Renders a generated image; if it fails to load (e.g. the free image service is
// temporarily busy), shows a graceful message with a retry hint and a link.
const ImageOutput: React.FC<ImageOutputProps> = ({ src, alt }) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div style={{
        fontSize: 12, color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a',
        borderRadius: 8, padding: '10px 12px', lineHeight: 1.4,
      }}>
        ⚠ The image could not be loaded (the free image service is busy). Re-run the card to retry, or{' '}
        <a href={src} target="_blank" rel="noreferrer" style={{ color: '#b45309', fontWeight: 600 }}>open the link</a>.
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || 'Generated image'}
      onError={() => setFailed(true)}
      style={{ maxWidth: '100%', borderRadius: 10, border: '1px solid #e2e8f0' }}
    />
  );
};

export default ImageOutput;
