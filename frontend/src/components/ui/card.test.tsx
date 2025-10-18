import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card'

describe('Card Components', () => {
  describe('Card', () => {
    it('should render card element', () => {
      const { container } = render(<Card>Card content</Card>)
      
      expect(container.firstChild).toBeInTheDocument()
      expect(container.textContent).toBe('Card content')
    })

    it('should apply custom className', () => {
      const { container } = render(<Card className="custom-card">Content</Card>)
      
      expect(container.firstChild).toHaveClass('custom-card')
    })
  })

  describe('CardHeader', () => {
    it('should render header section', () => {
      render(<CardHeader>Header content</CardHeader>)
      
      expect(screen.getByText('Header content')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(<CardHeader className="custom-header">Header</CardHeader>)
      
      expect(container.firstChild).toHaveClass('custom-header')
    })
  })

  describe('CardTitle', () => {
    it('should render title as heading', () => {
      render(<CardTitle>Card Title</CardTitle>)
      
      expect(screen.getByText('Card Title')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(<CardTitle className="custom-title">Title</CardTitle>)
      
      expect(container.firstChild).toHaveClass('custom-title')
    })
  })

  describe('CardDescription', () => {
    it('should render description text', () => {
      render(<CardDescription>Card description text</CardDescription>)
      
      expect(screen.getByText('Card description text')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(<CardDescription className="custom-desc">Desc</CardDescription>)
      
      expect(container.firstChild).toHaveClass('custom-desc')
    })
  })

  describe('CardContent', () => {
    it('should render content section', () => {
      render(<CardContent>Main content</CardContent>)
      
      expect(screen.getByText('Main content')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(<CardContent className="custom-content">Content</CardContent>)
      
      expect(container.firstChild).toHaveClass('custom-content')
    })
  })

  describe('CardFooter', () => {
    it('should render footer section', () => {
      render(<CardFooter>Footer content</CardFooter>)
      
      expect(screen.getByText('Footer content')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(<CardFooter className="custom-footer">Footer</CardFooter>)
      
      expect(container.firstChild).toHaveClass('custom-footer')
    })
  })

  describe('Complete Card', () => {
    it('should render full card with all sections', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
            <CardDescription>This is a test card</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Main content area</p>
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      )
      
      expect(screen.getByText('Test Card')).toBeInTheDocument()
      expect(screen.getByText('This is a test card')).toBeInTheDocument()
      expect(screen.getByText('Main content area')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
    })
  })
})
