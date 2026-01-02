/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import InsightCard from '../InsightCard'

describe('InsightCard', () => {
    it('renders with title and lightbulb emoji', () => {
        render(
            <InsightCard title="Key Finding">
                <p>This is an insight.</p>
            </InsightCard>
        )

        expect(screen.getByText(/💡 Key Finding/)).toBeInTheDocument()
    })

    it('renders children content', () => {
        render(
            <InsightCard title="Analysis">
                <p>Important discovery here.</p>
            </InsightCard>
        )

        expect(screen.getByText('Important discovery here.')).toBeInTheDocument()
    })

    it('renders complex children with HTML elements', () => {
        render(
            <InsightCard title="Detailed Insight">
                <ul>
                    <li>Point one</li>
                    <li>Point two</li>
                </ul>
            </InsightCard>
        )

        expect(screen.getByText('Point one')).toBeInTheDocument()
        expect(screen.getByText('Point two')).toBeInTheDocument()
    })

    it('applies custom style prop', () => {
        render(
            <InsightCard title="Styled Card" style={{ marginTop: '20px' }}>
                <p>Content</p>
            </InsightCard>
        )

        const card = screen.getByText(/💡 Styled Card/).parentElement
        expect(card).toHaveStyle({ marginTop: '20px' })
    })

    it('contains insight-card class for styling', () => {
        render(
            <InsightCard title="Test">
                <p>Content</p>
            </InsightCard>
        )

        const card = screen.getByText(/💡 Test/).parentElement
        expect(card).toHaveClass('insight-card')
    })

    it('has insight-badge with correct styling class', () => {
        render(
            <InsightCard title="Badge Test">
                <p>Content</p>
            </InsightCard>
        )

        const badge = screen.getByText(/💡 Badge Test/)
        expect(badge).toHaveClass('insight-badge')
    })

    it('wraps content in insight-content class', () => {
        render(
            <InsightCard title="Content Test">
                <p data-testid="content-p">Test content</p>
            </InsightCard>
        )

        const contentElement = screen.getByTestId('content-p')
        expect(contentElement.parentElement).toHaveClass('insight-content')
    })
})
