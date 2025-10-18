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
        {/* Bold lightning bolt - vertically aligned */}
        <path d="M 50 15
                 L 38 45
                 L 48 45
                 L 42 85
                 L 62 40
                 L 52 40
                 L 58 15
                 Z"
              fill="#0f766e"/>
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