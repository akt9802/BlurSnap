interface LogoProps {
  size?: number;
  showText?: boolean;
}

export default function Logo({ size = 32, showText = true }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background */}
        <rect width="32" height="32" rx="6" fill="url(#gradient)" />
        
        {/* Blur effect representation - overlapping squares */}
        <rect x="8" y="8" width="10" height="10" rx="2" fill="white" opacity="0.4" />
        <rect x="10" y="10" width="10" height="10" rx="2" fill="white" opacity="0.6" />
        <rect x="12" y="12" width="10" height="10" rx="2" fill="white" opacity="0.9" />
        
        {/* Gradient */}
        <defs>
          <linearGradient
            id="gradient"
            x1="0"
            y1="0"
            x2="32"
            y2="32"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#3B82F6" />
            <stop offset="1" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      </svg>
      
      {showText && (
        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          BlurSnap
        </span>
      )}
    </div>
  );
}
