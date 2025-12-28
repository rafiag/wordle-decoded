import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MetricCard from './MetricCard'

describe('MetricCard', () => {
  it('renders title and value', () => {
    render(<MetricCard title="Test Metric" value="42" />)
    expect(screen.getByText('Test Metric')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(<MetricCard title="Test" value="100" subtitle="per day" />)
    expect(screen.getByText('per day')).toBeInTheDocument()
  })

  it('renders icon when provided', () => {
    render(<MetricCard title="Test" value="100" icon="🎯" />)
    expect(screen.getByText('🎯')).toBeInTheDocument()
  })
})
