/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
    ChartTooltip,
    GuessDistributionTooltip,
    SentimentTooltip,
    TrapTooltip
} from '@/components/charts/ChartTooltip'

// Type for basic payload entry in tests
interface TestPayloadEntry {
    name: string
    value: number
    color?: string
    payload?: Record<string, unknown>
}

describe('ChartTooltip', () => {
    describe('Base ChartTooltip', () => {
        it('returns null when not active', () => {
            const { container } = render(
                <ChartTooltip
                    active={false}
                    payload={[{ name: 'Test', value: 100 }]}
                    renderRow={(entry: TestPayloadEntry, idx: number) => <div key={idx}>{entry.name}</div>}
                />
            )
            expect(container.firstChild).toBeNull()
        })

        it('returns null when payload is empty', () => {
            const { container } = render(
                <ChartTooltip
                    active={true}
                    payload={[]}
                    renderRow={(entry: TestPayloadEntry, idx: number) => <div key={idx}>{entry.name}</div>}
                />
            )
            expect(container.firstChild).toBeNull()
        })

        it('renders with title', () => {
            render(
                <ChartTooltip
                    active={true}
                    payload={[{ name: 'Test', value: 100 }]}
                    title="Custom Title"
                    renderRow={(entry: TestPayloadEntry, idx: number) => <div key={idx}>{entry.name}</div>}
                />
            )
            expect(screen.getByText('Custom Title')).toBeInTheDocument()
        })

        it('renders with label when no title', () => {
            render(
                <ChartTooltip
                    active={true}
                    payload={[{ name: 'Test', value: 100 }]}
                    label="2024-01-01"
                    renderRow={(entry: TestPayloadEntry, idx: number) => <div key={idx}>{entry.name}</div>}
                />
            )
            expect(screen.getByText('2024-01-01')).toBeInTheDocument()
        })

        it('calls renderRow for each payload entry', () => {
            const payload = [
                { name: 'Entry1', value: 10 },
                { name: 'Entry2', value: 20 },
                { name: 'Entry3', value: 30 },
            ]

            render(
                <ChartTooltip
                    active={true}
                    payload={payload}
                    renderRow={(entry: TestPayloadEntry, idx: number) => (
                        <div key={idx} data-testid={`row-${idx}`}>{entry.name}</div>
                    )}
                />
            )

            expect(screen.getByTestId('row-0')).toHaveTextContent('Entry1')
            expect(screen.getByTestId('row-1')).toHaveTextContent('Entry2')
            expect(screen.getByTestId('row-2')).toHaveTextContent('Entry3')
        })

        it('renders custom header when provided', () => {
            render(
                <ChartTooltip
                    active={true}
                    payload={[{ name: 'Test', value: 100 }]}
                    renderHeader={() => <div data-testid="custom-header">Header Content</div>}
                    renderRow={(entry: TestPayloadEntry, idx: number) => <div key={idx}>{entry.name}</div>}
                />
            )
            expect(screen.getByTestId('custom-header')).toHaveTextContent('Header Content')
        })

        it('applies custom className', () => {
            const { container } = render(
                <ChartTooltip
                    active={true}
                    payload={[{ name: 'Test', value: 100 }]}
                    className="custom-tooltip-class"
                    renderRow={(entry: TestPayloadEntry, idx: number) => <div key={idx}>{entry.name}</div>}
                />
            )
            expect(container.firstChild).toHaveClass('custom-tooltip-class')
        })
    })

    describe('GuessDistributionTooltip', () => {
        const mockPayload = [
            { name: '1/6', value: 10, color: '#00D9FF', payload: { word_solution: 'CRANE' } },
            { name: '2/6', value: 25, color: '#AAFF00', payload: { word_solution: 'CRANE' } },
            { name: '3/6', value: 35, color: '#33B277', payload: { word_solution: 'CRANE' } },
        ]

        it('returns null when not active', () => {
            const { container } = render(
                <GuessDistributionTooltip active={false} payload={mockPayload} />
            )
            expect(container.firstChild).toBeNull()
        })

        it('displays solution word from payload', () => {
            render(
                <GuessDistributionTooltip active={true} payload={mockPayload} />
            )
            expect(screen.getByText('CRANE')).toBeInTheDocument()
        })

        it('displays total data count', () => {
            render(
                <GuessDistributionTooltip active={true} payload={mockPayload} />
            )
            expect(screen.getByText('70')).toBeInTheDocument() // 10 + 25 + 35
        })

        it('displays percentages for each category', () => {
            render(
                <GuessDistributionTooltip active={true} payload={mockPayload} />
            )
            expect(screen.getByText('14.3%')).toBeInTheDocument() // 10/70
            expect(screen.getByText('35.7%')).toBeInTheDocument() // 25/70
            expect(screen.getByText('50.0%')).toBeInTheDocument() // 35/70
        })
    })

    describe('SentimentTooltip', () => {
        const mockPayload = [
            { name: 'Very Pos', value: 100, color: '#00D9FF', payload: { date: '2024-01-01', total_tweets: 500 } },
            { name: 'Positive', value: 200, color: '#AAFF00', payload: { date: '2024-01-01', total_tweets: 500 } },
        ]

        it('returns null when not active', () => {
            const { container } = render(
                <SentimentTooltip active={false} payload={mockPayload} />
            )
            expect(container.firstChild).toBeNull()
        })

        it('displays total tweets count', () => {
            render(
                <SentimentTooltip active={true} payload={mockPayload} />
            )
            expect(screen.getByText('500')).toBeInTheDocument()
        })

        it('displays sentiment categories with values', () => {
            render(
                <SentimentTooltip active={true} payload={mockPayload} />
            )
            expect(screen.getByText('Very Pos')).toBeInTheDocument()
            expect(screen.getByText('Positive')).toBeInTheDocument()
            expect(screen.getByText('100')).toBeInTheDocument()
            expect(screen.getByText('200')).toBeInTheDocument()
        })
    })

    describe('TrapTooltip', () => {
        const mockPayload = [
            {
                name: 'trap_score',
                value: 15.5,
                color: '#FF6B9D',
                payload: { word: 'LIVER', trap_score: 15.5, neighbor_count: 23 }
            }
        ]

        it('returns null when not active', () => {
            const { container } = render(
                <TrapTooltip active={false} payload={mockPayload} />
            )
            expect(container.firstChild).toBeNull()
        })

        it('displays word in uppercase', () => {
            render(
                <TrapTooltip active={true} payload={mockPayload} />
            )
            expect(screen.getByText('LIVER')).toBeInTheDocument()
        })

        it('displays trap score', () => {
            render(
                <TrapTooltip active={true} payload={mockPayload} />
            )
            expect(screen.getByText('15.5')).toBeInTheDocument()
        })

        it('displays neighbor count', () => {
            render(
                <TrapTooltip active={true} payload={mockPayload} />
            )
            expect(screen.getByText('23')).toBeInTheDocument()
        })

        it('handles missing neighbor count gracefully', () => {
            const payloadWithoutNeighbors = [
                {
                    name: 'trap_score',
                    value: 10.0,
                    color: '#FF6B9D',
                    payload: { word: 'TEST', trap_score: 10.0 }
                }
            ]

            render(
                <TrapTooltip active={true} payload={payloadWithoutNeighbors} />
            )

            expect(screen.getByText('TEST')).toBeInTheDocument()
            expect(screen.getByText('10.0')).toBeInTheDocument()
            expect(screen.queryByText('Neighbors:')).not.toBeInTheDocument()
        })
    })
})
