import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'icon' | 'full'
  className?: string
}

const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'full',
  className = ''
}) => {
  const sizeMap = {
    sm: { width: 24, height: 24, fontSize: 'text-lg' },
    md: { width: 40, height: 40, fontSize: 'text-xl' },
    lg: { width: 48, height: 48, fontSize: 'text-2xl' },
    xl: { width: 64, height: 64, fontSize: 'text-3xl' }
  }

  const { width, height, fontSize } = sizeMap[size]

  return (
    <div className={`flex items-center ${className}`}>
      <svg width={width} height={height} viewBox="0 0 100 100" className="flex-shrink-0">
        {/* Lightning bolt shaped as 'J' with smooth curves */}
        <path d="M 45 20
                 L 45 55
                 Q 45 70, 35 75
                 C 25 80, 25 85, 35 85
                 Q 45 85, 50 80
                 L 55 75
                 Q 60 70, 55 65
                 C 50 60, 45 60, 45 65
                 L 45 75
                 L 50 75
                 Q 55 75, 55 70
                 L 55 25
                 Q 55 20, 50 18
                 C 48 17, 46 17, 45 20"
              fill="#28a745"
              stroke="none"
              strokeLinejoin="round"
              strokeLinecap="round"/>

        {/* Subtle motion trail for energy */}
        <path d="M 42 18 Q 40 30, 42 42"
              fill="none"
              stroke="#28a745"
              strokeWidth="2"
              opacity="0.3"
              strokeLinecap="round"/>
      </svg>

      {variant === 'full' && (
        <span className={`ml-2 font-bold text-gray-900 dark:text-white ${fontSize}`}>
          Journi
        </span>
      )}
    </div>
  )
}

export default Logo