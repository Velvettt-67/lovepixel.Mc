import React from 'react';

interface LiquidGlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'rose' | 'sky' | 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  cursorText?: string;
}

export const LiquidGlassButton: React.FC<LiquidGlassButtonProps> = ({
  children,
  variant = 'rose',
  size = 'md',
  className = '',
  cursorText,
  ...props
}) => {
  const sizeMap = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-xs sm:text-sm',
    lg: 'px-8 py-4 text-sm sm:text-base',
  };

  const variantMap = {
    rose: 'liquid-glass-rose text-[#fdf2f4] hover:text-white hover:border-[#f472b6]/50 shadow-sm hover:shadow-lg',
    sky: 'liquid-glass-sky text-[#e0f2fe] hover:text-white hover:border-sky-400/50 shadow-sm hover:shadow-lg',
    dark: 'liquid-glass-dark text-white hover:border-white/40 shadow-md hover:shadow-xl',
    light: 'liquid-glass text-[#fdf2f4] hover:text-white hover:border-white/40 shadow-sm hover:shadow-md',
  };

  return (
    <button
      className={`group relative inline-flex items-center justify-center gap-2 rounded-full font-semibold uppercase tracking-wider transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d3738b] select-none ${sizeMap[size]} ${variantMap[variant]} ${className}`}
      data-cursor-text={cursorText}
      {...props}
    >
      {/* Specular Glint Refraction Sheen */}
      <span
        className="pointer-events-none absolute -inset-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden"
        aria-hidden="true"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
      </span>

      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
};
