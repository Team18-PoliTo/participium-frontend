import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import SetUpUserModal from '../SetUpUserModal';

describe('Componente SetUpUserModal', () => {
  const mockOnClose = vi.fn();
  const mockOnCreateUser = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnCreateUser.mockClear();
  });

  it('renderizza il form ma solo se isOpen è true', () => {
    // 1. Arrange
    const { rerender } = render(
      <SetUpUserModal isOpen={false} onClose={mockOnClose} onCreateUser={mockOnCreateUser} />
    );
    
    // 3. Assert (non visibile)
    expect(screen.queryByText('Add a new municipality user')).not.toBeInTheDocument();

    // 2. Act
    rerender(
      <SetUpUserModal isOpen={true} onClose={mockOnClose} onCreateUser={mockOnCreateUser} />
    );
    
    // 3. Assert (visibile)
    expect(screen.getByText('Add a new municipality user')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('chiama onCreateUser e onClose al submit del form con i dati corretti', async () => {
    // 1. Arrange
    const user = userEvent.setup();
    render(
      <SetUpUserModal isOpen={true} onClose={mockOnClose} onCreateUser={mockOnCreateUser} />
    );

    const expectedUser = {
      name: 'Mario',
      surname: 'Rossi',
      username: 'mrossi',
      email: 'mario@rossi.com',
      password: 'SuperPassword123',
    };

    // 2. Act
    // Simuliamo la compilazione del form
    await user.type(screen.getByLabelText('Name'), expectedUser.name);
    await user.type(screen.getByLabelText('Surname'), expectedUser.surname);
    await user.type(screen.getByLabelText('Username'), expectedUser.username);
    await user.type(screen.getByLabelText('Email'), expectedUser.email);
    await user.type(screen.getByLabelText('Password'), expectedUser.password);

    // Simuliamo il click sul bottone "Create User"
    const submitButton = screen.getByRole('button', { name: 'Create User' });
    await user.click(submitButton);

    // 3. Assert
    expect(mockOnCreateUser).toHaveBeenCalledTimes(1);
    expect(mockOnCreateUser).toHaveBeenCalledWith(expectedUser);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});