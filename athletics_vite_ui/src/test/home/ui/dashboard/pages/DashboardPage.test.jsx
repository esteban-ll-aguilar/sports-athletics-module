import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import DashboardPage from '../../../../../modules/home/ui/dashboard/pages/DashboardPage'

describe('DashboardPage', () => {
    it('renders dashboard overview correctly', () => {
        render(<DashboardPage />)

        expect(screen.getByText('Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Total Atletas')).toBeInTheDocument()
        expect(screen.getByText('Competencias Activas')).toBeInTheDocument()
    })

    it('renders recent activity section', () => {
        render(<DashboardPage />)

        expect(screen.getByText('Actividad Reciente')).toBeInTheDocument()
        // Check for mocked list items
        expect(screen.getAllByText('Nuevo registro de atleta')).toHaveLength(3)
    })
})
