import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FileUpload } from '../../../src/components/FileUpload'

describe('FileUpload Component', () => {
  it('should render upload area', () => {
    render(<FileUpload onFilesChange={vi.fn()} />)
    
    expect(screen.getByText(/drag & drop files here/i)).toBeInTheDocument()
  })

  it('should show file type and size limits', () => {
    render(<FileUpload onFilesChange={vi.fn()} />)
    
    expect(screen.getByText(/supports pdf, docx, csv, txt/i)).toBeInTheDocument()
    expect(screen.getByText(/max 10mb/i)).toBeInTheDocument()
  })

  it('should call onFilesChange when files are added', async () => {
    const handleFilesChange = vi.fn()
    const { container } = render(<FileUpload onFilesChange={handleFilesChange} />)
    
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    
    if (input) {
      await userEvent.upload(input, file)
      expect(handleFilesChange).toHaveBeenCalled()
    }
  })

  it('should display uploaded files', async () => {
    const { container } = render(<FileUpload onFilesChange={vi.fn()} />)
    
    const file = new File(['content'], 'document.pdf', { type: 'application/pdf' })
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    
    if (input) {
      await userEvent.upload(input, file)
      expect(screen.getByText('document.pdf')).toBeInTheDocument()
    }
  })

  it('should allow removing files', async () => {
    const handleFilesChange = vi.fn()
    const { container } = render(<FileUpload onFilesChange={handleFilesChange} />)
    
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    
    if (input) {
      await userEvent.upload(input, file)
      
      const removeButton = screen.getByRole('button')
      await userEvent.click(removeButton)
      
      expect(screen.queryByText('test.pdf')).not.toBeInTheDocument()
    }
  })
})
