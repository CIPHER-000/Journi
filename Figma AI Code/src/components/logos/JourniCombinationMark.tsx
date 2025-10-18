interface JourniCombinationMarkProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  layout?: "horizontal" | "vertical";
}

export function JourniCombinationMark({ 
  className = "", 
  size = "md", 
  layout = "horizontal" 
}: JourniCombinationMarkProps) {
  const sizeClasses = {
    sm: layout === "horizontal" ? "h-6" : "h-12",
    md: layout === "horizontal" ? "h-8" : "h-16", 
    lg: layout === "horizontal" ? "h-12" : "h-24",
    xl: layout === "horizontal" ? "h-16" : "h-32"
  };

  if (layout === "vertical") {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        {/* Icon */}
        <div className={`${sizeClasses[size]} aspect-square`}>
          <svg 
            viewBox="0 0 32 32" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <circle cx="16" cy="16" r="16" fill="currentColor" className="text-green-600" />
            <g className="text-white">
              <path
                d="M6 16 Q10 12, 16 16 T26 16"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                opacity="0.9"
              />
              <circle cx="6" cy="16" r="2" fill="currentColor" />
              <circle cx="16" cy="16" r="2.5" fill="currentColor" />
              <circle cx="26" cy="16" r="2" fill="currentColor" />
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
              <circle cx="22" cy="16" r="1" fill="currentColor" opacity="0.8" />
              <circle cx="19" cy="13" r="0.8" fill="currentColor" opacity="0.6" />
              <circle cx="19" cy="19" r="0.8" fill="currentColor" opacity="0.6" />
            </g>
          </svg>
        </div>
        
        {/* Wordmark */}
        <div className="text-center">
          <span className="font-semibold text-lg text-foreground">Journi</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon */}
      <div className={`${sizeClasses[size]} aspect-square`}>
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
            <path
              d="M6 16 Q10 12, 16 16 T26 16"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              opacity="0.9"
            />
            <circle cx="6" cy="16" r="2" fill="currentColor" />
            <circle cx="16" cy="16" r="2.5" fill="currentColor" />
            <circle cx="26" cy="16" r="2" fill="currentColor" />
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
            <circle cx="22" cy="16" r="1" fill="currentColor" opacity="0.8" />
            <circle cx="19" cy="13" r="0.8" fill="currentColor" opacity="0.6" />
            <circle cx="19" cy="19" r="0.8" fill="currentColor" opacity="0.6" />
          </g>
        </svg>
      </div>
      
      {/* Wordmark */}
      <span className="font-semibold text-xl text-foreground">Journi</span>
    </div>
  );
}