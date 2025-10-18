import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './input'

describe('Input Component', () => {
  it('should render input element', () => {
    render(<Input />)
    
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('should accept and display value', async () => {
    const user = userEvent.setup()
    
    render(<Input />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'test value')
    
    expect(input).toHaveValue('test value')
  })

  it('should handle onChange event', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    
    render(<Input onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'a')
    
    expect(handleChange).toHaveBeenCalled()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('should apply custom className', () => {
    const { container } = render(<Input className="custom-class" />)
    
    const input = container.querySelector('input')
    expect(input?.className).toContain('custom-class')
  })

  it('should support different input types', () => {
    const { container, rerender } = render(<Input type="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
    
    rerender(<Input type="password" />)
    // Password inputs don't have the textbox role
    const passwordInput = container.querySelector('input[type="password"]')
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('should support placeholder', () => {
    render(<Input placeholder="Enter text" />)
    
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('should support required attribute', () => {
    render(<Input required />)
    
    expect(screen.getByRole('textbox')).toBeRequired()
  })

  it('should support readonly attribute', () => {
    render(<Input readOnly value="readonly value" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('readonly')
    expect(input).toHaveValue('readonly value')
  })

  it('should handle focus', async () => {
    const user = userEvent.setup()
    
    render(<Input />)
    
    const input = screen.getByRole('textbox')
    await user.click(input)
    
    expect(input).toHaveFocus()
  })
})
