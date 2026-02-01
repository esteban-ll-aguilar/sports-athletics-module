import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import DashboardPage from '../../../../../modules/home/ui/dashboard/pages/DashboardPage'

describe('DashboardPage', () => {
    it('renders dashboard overview correctly', () => {
        render(<DashboardPage />)

        expect(screen.getByText('Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Total Atletas')).toBeInTheDocument()
        // Note: The component uses "Competencias", NOT "Competencias Activas" in the card titled "Competencias".
        // Let's verify what the component actually renders.
        // Card 2: title is "Competencias".
        // Card 3: title is "Próximos Eventos".
        // The test originally expected 'Competencias Activas'. Let's check if that was the failure cause too.
        // Component line 41: <p ...>Competencias</p>
        expect(screen.getByText('Competencias')).toBeInTheDocument()
    })

    it('renders recent activity section', () => {
        render(<DashboardPage />)

        expect(screen.getByText('Actividad Reciente')).toBeInTheDocument()
        // Check for mocked list items
        expect(screen.getAllByText('Nuevo registro de atleta completado')).toHaveLength(3)
    })
})
