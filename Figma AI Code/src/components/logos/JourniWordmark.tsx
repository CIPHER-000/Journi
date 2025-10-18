interface JourniWordmarkProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function JourniWordmark({ className = "", size = "md" }: JourniWordmarkProps) {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-12",
    xl: "h-16"
  };

  return (
    <div className={`flex items-center ${className}`}>
      <svg 
        viewBox="0 0 120 32" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClasses[size]} w-auto`}
      >
        {/* Stylized 'J' with flowing path */}
        <path
          d="M8 4 C8 4, 12 4, 12 8 L12 20 C12 24, 8 28, 4 28 C2 28, 0 26, 0 24"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          className="text-green-600"
        />
        <circle cx="2" cy="24" r="1.5" fill="currentColor" className="text-green-600" />
        
        {/* Flowing connection line */}
        <path
          d="M12 16 Q18 14, 24 16 T36 16"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          className="text-green-400 opacity-60"
        />
        
        {/* Text: JOURNI */}
        <g className="text-foreground" fill="currentColor">
          {/* J */}
          <path d="M20 12 C20 12, 22 12, 22 14 L22 20 C22 21.5, 20.5 23, 19 23 C18.2 23, 17.5 22.3, 17.5 21.5" 
                stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          
          {/* O */}
          <circle cx="29" cy="17.5" r="4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          
          {/* U */}
          <path d="M38 12 L38 18 C38 20, 39.5 21.5, 41.5 21.5 C43.5 21.5, 45 20, 45 18 L45 12" 
                stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          
          {/* R */}
          <path d="M50 12 L50 23 M50 12 L54 12 C55.5 12, 56.5 13, 56.5 14.5 C56.5 16, 55.5 17, 54 17 L50 17 M54 17 L57 23" 
                stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          
          {/* N */}
          <path d="M62 12 L62 23 M62 12 L68 23 M68 12 L68 23" 
                stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          
          {/* I */}
          <path d="M73 12 L73 23 M71 12 L75 12 M71 23 L75 23" 
                stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </g>
      </svg>
    </div>
  );
}