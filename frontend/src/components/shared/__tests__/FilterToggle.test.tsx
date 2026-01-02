/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FilterToggle } from '../FilterToggle'

describe('FilterToggle', () => {
    const options = ['Option A', 'Option B', 'Option C'] as const
    type Option = typeof options[number]

    it('renders all options as buttons', () => {
        const onChange = vi.fn()
        render(
            <FilterToggle<Option>
                options={options}
                value="Option A"
                onChange={onChange}
            />
        )

        expect(screen.getByText('Option A')).toBeInTheDocument()
        expect(screen.getByText('Option B')).toBeInTheDocument()
        expect(screen.getByText('Option C')).toBeInTheDocument()
    })

    it('highlights the selected option', () => {
        const onChange = vi.fn()
        render(
            <FilterToggle<Option>
                options={options}
                value="Option B"
                onChange={onChange}
            />
        )

        const selectedButton = screen.getByText('Option B')
        expect(selectedButton).toHaveClass('text-black')
        expect(selectedButton).toHaveStyle({ backgroundColor: 'var(--accent-cyan)' })
    })

    it('calls onChange when an option is clicked', () => {
        const onChange = vi.fn()
        render(
            <FilterToggle<Option>
                options={options}
                value="Option A"
                onChange={onChange}
            />
        )

        fireEvent.click(screen.getByText('Option C'))
        expect(onChange).toHaveBeenCalledTimes(1)
        expect(onChange).toHaveBeenCalledWith('Option C')
    })

    it('uses custom active color when provided', () => {
        const onChange = vi.fn()
        const customColor = 'rgb(255, 0, 0)'

        render(
            <FilterToggle<Option>
                options={options}
                value="Option A"
                onChange={onChange}
                activeColor={customColor}
            />
        )

        const selectedButton = screen.getByText('Option A')
        expect(selectedButton).toHaveStyle({ backgroundColor: customColor })
    })

    it('applies custom className', () => {
        const onChange = vi.fn()
        render(
            <FilterToggle<Option>
                options={options}
                value="Option A"
                onChange={onChange}
                className="custom-class"
            />
        )

        const container = screen.getByText('Option A').parentElement
        expect(container).toHaveClass('custom-class')
    })

    it('unselected options do not have background style', () => {
        const onChange = vi.fn()
        render(
            <FilterToggle<Option>
                options={options}
                value="Option A"
                onChange={onChange}
            />
        )

        const unselectedButton = screen.getByText('Option B')
        expect(unselectedButton).not.toHaveStyle({ backgroundColor: 'var(--accent-cyan)' })
        expect(unselectedButton).toHaveClass('text-[var(--text-secondary)]')
    })
})
