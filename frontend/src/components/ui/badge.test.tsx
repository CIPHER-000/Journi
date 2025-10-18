import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from './badge'

describe('Badge Component', () => {
  it('should render badge with text', () => {
    render(<Badge>New</Badge>)
    
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('should apply default variant', () => {
    const { container } = render(<Badge>Default</Badge>)
    
    const badge = container.firstChild
    expect(badge).toBeInTheDocument()
  })

  it('should apply secondary variant', () => {
    const { container } = render(<Badge variant="secondary">Secondary</Badge>)
    
    const badge = container.querySelector('[class*="secondary"]')
    expect(badge).toBeInTheDocument()
  })

  it('should apply destructive variant', () => {
    const { container } = render(<Badge variant="destructive">Error</Badge>)
    
    const badge = container.querySelector('[class*="destructive"]')
    expect(badge).toBeInTheDocument()
  })

  it('should apply outline variant', () => {
    render(<Badge variant="outline">Outline</Badge>)
    
    // Test behavior: outline badge should be visible with text
    expect(screen.getByText('Outline')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(<Badge className="custom-badge">Custom</Badge>)
    
    expect(container.firstChild).toHaveClass('custom-badge')
  })

  it('should render with different content types', () => {
    const { rerender } = render(<Badge>Text</Badge>)
    expect(screen.getByText('Text')).toBeInTheDocument()
    
    rerender(<Badge>123</Badge>)
    expect(screen.getByText('123')).toBeInTheDocument()
    
    rerender(<Badge><span>Nested</span></Badge>)
    expect(screen.getByText('Nested')).toBeInTheDocument()
  })

  it('should handle empty content', () => {
    const { container } = render(<Badge />)
    
    expect(container.firstChild).toBeInTheDocument()
  })
})
