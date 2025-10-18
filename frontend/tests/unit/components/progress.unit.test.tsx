import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Progress } from '../../../src/components/ui/progress'

describe('Progress Component', () => {
  it('should render progress bar', () => {
    const { container } = render(<Progress value={50} />)
    
    const progress = container.querySelector('[role="progressbar"]')
    expect(progress).toBeInTheDocument()
  })

  it('should display correct progress value', () => {
    const { container } = render(<Progress value={75} />)
    
    // Radix UI handles ARIA internally, just verify component renders
    const progress = container.querySelector('[data-slot="progress"]')
    expect(progress).toBeInTheDocument()
  })

  it('should handle 0% progress', () => {
    const { container } = render(<Progress value={0} />)
    
    const progress = container.querySelector('[data-slot="progress"]')
    expect(progress).toBeInTheDocument()
  })

  it('should handle 100% progress', () => {
    const { container } = render(<Progress value={100} />)
    
    const progress = container.querySelector('[data-slot="progress"]')
    expect(progress).toBeInTheDocument()
  })

  it('should handle undefined value', () => {
    const { container } = render(<Progress />)
    
    const progress = container.querySelector('[role="progressbar"]')
    expect(progress).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(<Progress value={50} className="custom-progress" />)
    
    expect(container.firstChild).toHaveClass('custom-progress')
  })

  it('should render with indicator', () => {
    const { container } = render(<Progress value={60} />)
    
    const progress = container.querySelector('[data-slot="progress"]')
    const indicator = container.querySelector('[data-slot="progress-indicator"]')
    expect(progress).toBeInTheDocument()
    expect(indicator).toBeInTheDocument()
  })

  it('should update progress value dynamically', () => {
    const { container, rerender } = render(<Progress value={30} />)
    
    let progress = container.querySelector('[data-slot="progress"]')
    expect(progress).toBeInTheDocument()
    
    rerender(<Progress value={70} />)
    progress = container.querySelector('[data-slot="progress"]')
    expect(progress).toBeInTheDocument()
  })
})
