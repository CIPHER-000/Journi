import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PrimaryButton } from '../../../src/components/ui/PrimaryButton'

describe('PrimaryButton Component', () => {
  it('should render button with text', () => {
    render(<PrimaryButton>Click me</PrimaryButton>)
    
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<PrimaryButton onClick={handleClick}>Click</PrimaryButton>)
    
    await user.click(screen.getByRole('button'))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should not call onClick when disabled', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<PrimaryButton onClick={handleClick} disabled>Click</PrimaryButton>)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(handleClick).not.toHaveBeenCalled()
    expect(button).toBeDisabled()
  })

  it('should not call onClick when loading', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<PrimaryButton onClick={handleClick} loading>Click</PrimaryButton>)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(handleClick).not.toHaveBeenCalled()
    expect(button).toBeDisabled()
  })

  it('should display loading spinner when loading', () => {
    const { container } = render(<PrimaryButton loading>Loading</PrimaryButton>)
    
    // Check for loader icon (Loader2 from lucide-react renders as svg)
    const loader = container.querySelector('svg.animate-spin')
    expect(loader).toBeInTheDocument()
  })

  it('should apply small size classes', () => {
    const { container } = render(<PrimaryButton size="sm">Small</PrimaryButton>)
    
    const button = container.querySelector('button')
    expect(button?.className).toContain('px-3')
    expect(button?.className).toContain('py-1.5')
  })

  it('should apply medium size classes (default)', () => {
    const { container } = render(<PrimaryButton>Medium</PrimaryButton>)
    
    const button = container.querySelector('button')
    expect(button?.className).toContain('px-4')
    expect(button?.className).toContain('py-2')
  })

  it('should apply large size classes', () => {
    const { container } = render(<PrimaryButton size="lg">Large</PrimaryButton>)
    
    const button = container.querySelector('button')
    expect(button?.className).toContain('px-6')
    expect(button?.className).toContain('py-3')
  })

  it('should apply primary variant (default)', () => {
    const { container } = render(<PrimaryButton>Primary</PrimaryButton>)
    
    const button = container.querySelector('button')
    expect(button?.className).toContain('primary')
  })

  it('should apply secondary variant styling', () => {
    const { container } = render(<PrimaryButton variant="secondary">Secondary</PrimaryButton>)
    
    const button = container.querySelector('button')
    // Check for secondary-specific styles (white background, border)
    expect(button?.className).toContain('bg-white')
    expect(button?.className).toContain('border')
  })

  it('should apply accent variant', () => {
    const { container } = render(<PrimaryButton variant="accent">Accent</PrimaryButton>)
    
    const button = container.querySelector('button')
    expect(button?.className).toContain('accent')
  })

  it('should apply custom className', () => {
    const { container } = render(<PrimaryButton className="custom-class">Custom</PrimaryButton>)
    
    const button = container.querySelector('button')
    expect(button?.className).toContain('custom-class')
  })

  it('should render different content types', () => {
    const { rerender } = render(<PrimaryButton>Text</PrimaryButton>)
    expect(screen.getByText('Text')).toBeInTheDocument()
    
    rerender(<PrimaryButton><span>Nested</span></PrimaryButton>)
    expect(screen.getByText('Nested')).toBeInTheDocument()
  })

  it('should be accessible via keyboard', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<PrimaryButton onClick={handleClick}>Press me</PrimaryButton>)
    
    const button = screen.getByRole('button')
    button.focus()
    
    await user.keyboard('{Enter}')
    expect(handleClick).toHaveBeenCalled()
  })
})
