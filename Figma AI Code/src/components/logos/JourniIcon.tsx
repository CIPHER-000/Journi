interface JourniIconProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export function JourniIcon({ className = "", size = "md" }: JourniIconProps) {
  const sizeClasses = {
    xs: "w-4 h-4",
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg 
        viewBox="0 0 32 32" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Background circle */}
        <circle cx="16" cy="16" r="16" fill="currentColor" className="text-green-600" />
        
        {/* Journey path with nodes */}
        <g className="text-white">
          {/* Main journey path */}
          <path
            d="M6 16 Q10 12, 16 16 T26 16"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            opacity="0.9"
          />
          
          {/* Journey nodes/touchpoints */}
          <circle cx="6" cy="16" r="2" fill="currentColor" />
          <circle cx="16" cy="16" r="2.5" fill="currentColor" />
          <circle cx="26" cy="16" r="2" fill="currentColor" />
          
          {/* Secondary paths for mapping concept */}
          <path
            d="M16 10 Q20 12, 22 16"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M16 22 Q20 20, 22 16"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />
          
          {/* Small connecting dots */}
          <circle cx="22" cy="16" r="1" fill="currentColor" opacity="0.8" />
          <circle cx="19" cy="13" r="0.8" fill="currentColor" opacity="0.6" />
          <circle cx="19" cy="19" r="0.8" fill="currentColor" opacity="0.6" />
        </g>
      </svg>
    </div>
  );
}