import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import RoleAssignmentModal from '../RoleAssignmentModal';

describe('Componente RoleAssignmentModal', () => {
  const mockUser = { id: 1, name: 'Test', surname: 'User' };
  const mockOnClose = vi.fn();
  const mockOnAssignRole = vi.fn();

  // Puliamo i mock prima di ogni test
  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnAssignRole.mockClear();
  });

  it('non renderizza nulla se isOpen è false', () => {
    render(
      <RoleAssignmentModal
        isOpen={false}
        user={mockUser}
        onClose={mockOnClose}
        onAssignRole={mockOnAssignRole}
      />
    );
    expect(screen.queryByText('Assign Role')).not.toBeInTheDocument();
  });

  it('renderizza il modal correttamente se isOpen è true', () => {
    render(
      <RoleAssignmentModal
        isOpen={true}
        user={mockUser}
        onClose={mockOnClose}
        onAssignRole={mockOnAssignRole}
      />
    );
    expect(screen.getByText('Assign Role')).toBeInTheDocument();
    expect(screen.getByText('Select a role for Test User')).toBeInTheDocument();
    expect(screen.getByText('Municipal Public Relations Officer')).toBeInTheDocument();
  });

  it('chiama onAssignRole e onClose quando si clicca un ruolo', async () => {
    // 1. Arrange
    const user = userEvent.setup();
    render(
      <RoleAssignmentModal
        isOpen={true}
        user={mockUser}
        onClose={mockOnClose}
        onAssignRole={mockOnAssignRole}
      />
    );

    // 2. Act
    // Clicchiamo sul ruolo "admin"
    const adminRoleButton = screen.getByText('Municipal Administrator');
    await user.click(adminRoleButton);

    // 3. Assert
    expect(mockOnAssignRole).toHaveBeenCalledTimes(1);
    expect(mockOnAssignRole).toHaveBeenCalledWith(1, 'admin'); // Verifica id utente e id ruolo
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('chiama solo onClose quando si clicca il bottone "×"', async () => {
    // 1. Arrange
    const user = userEvent.setup();
    render(
      <RoleAssignmentModal
        isOpen={true}
        user={mockUser}
        onClose={mockOnClose}
        onAssignRole={mockOnAssignRole}
      />
    );

    // 2. Act
    const closeButton = screen.getByText('×');
    await user.click(closeButton);

    // 3. Assert
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnAssignRole).not.toHaveBeenCalled();
  });
});