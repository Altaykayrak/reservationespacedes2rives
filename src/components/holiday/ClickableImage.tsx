import React, { useState } from 'react';
import { ImageViewer } from '@/components/ui/image-viewer';

interface ClickableImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const ClickableImage: React.FC<ClickableImageProps> = ({ src, alt, className }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <img 
        src={src}
        alt={alt}
        className={`${className} cursor-pointer hover:opacity-90 transition-opacity`}
        onClick={() => setIsOpen(true)}
      />
      <ImageViewer 
        src={src}
        alt={alt}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};
