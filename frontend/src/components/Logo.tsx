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
        {/* Lightning bolt that forms a J shape */}
        <path d="M 50 15
                 L 35 45
                 L 45 45
                 L 40 70
                 Q 38 75, 35 78
                 C 32 80, 32 82, 35 83
                 Q 38 84, 42 82
                 L 48 78
                 Q 52 75, 48 72
                 L 50 65
                 L 40 65
                 L 45 40
                 L 35 40
                 L 50 15"
              fill="#28a745"
              stroke="none"
              strokeLinejoin="round"
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