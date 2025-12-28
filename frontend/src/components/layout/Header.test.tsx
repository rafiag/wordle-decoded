import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Header from './Header'

describe('Header', () => {
  const renderHeader = () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    )
  }

  it('renders navigation links', () => {
    renderHeader()
    expect(screen.getAllByText('Home').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Difficulty').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Distribution').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Patterns').length).toBeGreaterThan(0)
    expect(screen.getAllByText('NYT Effect').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Outliers').length).toBeGreaterThan(0)
  })

  it('renders Wordle Data Explorer title on desktop', () => {
    renderHeader()
    expect(screen.getByText('Wordle Data Explorer')).toBeInTheDocument()
  })
})
