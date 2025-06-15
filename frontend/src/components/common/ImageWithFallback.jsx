// Enhanced ImageWithFallback Component with Size Handling
import React, { useState } from 'react';

const ImageWithFallback = ({ 
  src, 
  alt, 
  className, 
  fallbackClass,
  width, // Optional explicit width
  height, // Optional explicit height
  objectFit = "cover" // Control how the image fits into its container
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Style for maintaining aspect ratio and controlling image fit
  const imgStyle = {
    objectFit: objectFit,
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : '100%',
    // Only show the image once it's loaded to prevent layout shifts
    opacity: isLoaded ? 1 : 0,
    transition: 'opacity 0.3s ease'
  };
  
  // Calculate aspect ratio for the container if both dimensions are provided
  const containerStyle = (width && height) ? {
    paddingBottom: `${(height / width) * 100}%`,
    position: 'relative'
  } : {};
  
  return (
    <div style={containerStyle} className={fallbackClass || "bg-gradient-to-r from-orange-600 to-orange-900"}>
      {!hasError && src && (
        <img 
          src={src} 
          alt={alt}
          className={className}
          style={imgStyle}
          onError={() => {
            console.log(`Image failed to load: ${src}`);
            setHasError(true);
          }}
          onLoad={() => {
            setIsLoaded(true);
          }}
        />
      )}
    </div>
  );
};

export default ImageWithFallback;
