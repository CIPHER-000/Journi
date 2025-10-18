import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../../../src/components/ui/button'

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>)
    
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    
    await user.click(screen.getByRole('button'))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should not call onClick when disabled', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick} disabled>Click me</Button>)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should apply variant classes', () => {
    const { container } = render(<Button variant="destructive">Delete</Button>)
    
    const button = container.querySelector('button')
    expect(button?.className).toContain('destructive')
  })

  it('should apply size classes', () => {
    const { container } = render(<Button size="lg">Large Button</Button>)
    
    const button = container.querySelector('button')
    // Button should render with different sizing classes based on size prop
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('h-10') // lg size has h-10
    expect(button).toHaveClass('px-6') // lg size has px-6
  })

  it('should render as child component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )
    
    expect(screen.getByRole('link')).toBeInTheDocument()
  })

  it('should accept and apply custom className', () => {
    const { container } = render(<Button className="custom-class">Custom</Button>)
    
    const button = container.querySelector('button')
    expect(button?.className).toContain('custom-class')
  })

  it('should support different button types', () => {
    render(<Button type="submit">Submit</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('should be accessible via keyboard', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Press me</Button>)
    
    const button = screen.getByRole('button')
    button.focus()
    
    await user.keyboard('{Enter}')
    expect(handleClick).toHaveBeenCalled()
  })

  it('should render all variants correctly', () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const
    
    variants.forEach(variant => {
      const { container, unmount } = render(<Button variant={variant}>{variant}</Button>)
      
      const button = container.querySelector('button')
      expect(button).toBeInTheDocument()
      
      unmount()
    })
  })

  it('should render all sizes correctly', () => {
    const sizes = ['default', 'sm', 'lg', 'icon'] as const
    
    sizes.forEach(size => {
      const { container, unmount } = render(<Button size={size}>{size}</Button>)
      
      const button = container.querySelector('button')
      expect(button).toBeInTheDocument()
      
      unmount()
    })
  })
})
