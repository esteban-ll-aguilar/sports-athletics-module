import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import DashboardPage from '../../../../../modules/home/ui/dashboard/pages/DashboardPage'

describe('DashboardPage', () => {
    it('renders dashboard overview correctly', () => {
        render(
            <MemoryRouter>
                <DashboardPage />
            </MemoryRouter>
        )
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Total Atletas')).toBeInTheDocument()
        expect(screen.getByText('Competencias')).toBeInTheDocument()
    })

    it('renders recent activity section', () => {
        render(
            <MemoryRouter>
                <DashboardPage />
            </MemoryRouter>
        )
        expect(screen.getByText('Actividad Reciente')).toBeInTheDocument()
        expect(screen.getAllByText('Nuevo registro de atleta completado')).toHaveLength(3)
    })
})
