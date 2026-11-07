import React from 'react';

interface ShiningTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'rose' | 'sky' | 'pearl';
}

export const ShiningText: React.FC<ShiningTextProps> = ({
  children,
  className = '',
  variant = 'rose',
}) => {
  const gradientMap = {
    rose: 'from-[#ffffff] via-[#f472b6] to-[#fda4af]',
    sky: 'from-[#ffffff] via-[#38bdf8] to-[#bae6fd]',
    pearl: 'from-white via-[#fce7ee] to-white',
  };

  return (
    <span
      className={`inline-block bg-gradient-to-r ${gradientMap[variant]} bg-[length:250%_100%] bg-clip-text text-transparent animate-shining-text ${className}`}
      style={{
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
    >
      {children}
    </span>
  );
};
