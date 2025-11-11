import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import UserCard from '../UserCard';

// Dati di test
const unassignedUser = {
  id: 1,
  name: 'Jacopo',
  surname: 'Esposito',
  username: 'Jaja',
  role: 'unassigned',
};

const proUser = {
  id: 2,
  name: 'Matteo',
  surname: 'Rosato',
  username: 'Matte',
  role: 'pro',
};

describe('Componente UserCard', () => {
  it('mostra correttamente le informazioni dell\'utente', () => {
    // 1. Arrange
    render(<UserCard user={unassignedUser} />);

    // 3. Assert
    expect(screen.getByText('Jacopo')).toBeInTheDocument();
    expect(screen.getByText('Esposito')).toBeInTheDocument();
    expect(screen.getByText('Jaja')).toBeInTheDocument();
  });

  it('mostra il bottone "+" solo per gli utenti "unassigned"', () => {
    // 1. Arrange
    // Renderizziamo prima l'utente non assegnato
    const { rerender } = render(<UserCard user={unassignedUser} />);

    // 3. Assert
    // Il bottone "+" (identificato dal suo className) dovrebbe esserci
    expect(screen.getByRole('button')).toHaveClass('user-add-btn');

    // 2. Act
    // Ora ri-renderizziamo lo stesso componente con un utente "pro"
    rerender(<UserCard user={proUser} />);

    // 3. Assert
    // Il bottone non dovrebbe esserci
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('apre il RoleAssignmentModal quando si clicca il bottone "+"', async () => {
    // 1. Arrange
    const user = userEvent.setup();
    const mockOnAssignRole = vi.fn();
    render(<UserCard user={unassignedUser} onAssignRole={mockOnAssignRole} />);

    // 3. Assert (Inizialmente il modal è chiuso)
    expect(screen.queryByText('Assign Role')).not.toBeInTheDocument();

    // 2. Act
    const addButton = screen.getByRole('button');
    await user.click(addButton);

    // 3. Assert (Ora il modal è aperto)
    expect(screen.getByText('Assign Role')).toBeInTheDocument();
    expect(screen.getByText('Select a role for Jacopo Esposito')).toBeInTheDocument();
  });
});