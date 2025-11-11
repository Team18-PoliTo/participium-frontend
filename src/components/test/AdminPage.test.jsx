import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminPage from '../AdminPage';
import { NavbarTextContext } from '../../App'; // Dobbiamo mockare il Context

// Funzione helper per renderizzare AdminPage con il Context
const mockSetNavbarText = vi.fn();
const renderAdminPage = () => {
  // Otteniamo e restituiamo "container" per query più precise
  const { container } = render(
    <NavbarTextContext.Provider value={{ navbarText: 'Test', setNavbarText: mockSetNavbarText }}>
      <AdminPage />
    </NavbarTextContext.Provider>
  );
  return { container };
};

describe('Pagina AdminPage (Integrazione)', () => {
  let user;

  // Inizializza userEvent prima di ogni test
  beforeEach(() => {
    user = userEvent.setup();
    mockSetNavbarText.mockClear();
  });

  it('dovrebbe renderizzare tutti gli 8 utenti "dummy" inizialmente', () => {
    renderAdminPage();
    // Cerchiamo le card utente. Un modo è cercare un testo che si ripete in ognuna,
    // come "surname:". (Basato sui dummyUsers nel tuo file)
    expect(screen.getAllByText(/surname:/i)).toHaveLength(8);
  });

  it('dovrebbe filtrare la lista quando si clicca un filtro', async () => {
    // 1. Arrange
    renderAdminPage();
    expect(screen.getAllByText(/surname:/i)).toHaveLength(8); // 8 all'inizio

    // 2. Act
    // Ci sono 3 utenti "pro" nei dummy data
    const proFilterButton = screen.getByRole('button', { name: 'municipal public relations officer' });
    await user.click(proFilterButton);

    // 3. Assert
    expect(screen.getAllByText(/surname:/i)).toHaveLength(3);

    // 2. Act (Deseleziona)
    await user.click(proFilterButton);

    // 3. Assert
    expect(screen.getAllByText(/surname:/i)).toHaveLength(8); // Ritorna a 8
  });

  it('dovrebbe aggiungere un nuovo utente alla lista', async () => {
    // 1. Arrange
    renderAdminPage();
    expect(screen.getAllByText(/surname:/i)).toHaveLength(8);

    // 2. Act (Apri modal)
    const addUserButton = screen.getByRole('button', { name: 'Add a new user' });
    await user.click(addUserButton);

    // 3. Assert (Modal è aperto)
    expect(screen.getByText('Add a new municipality user')).toBeInTheDocument();

    // 2. Act (Compila e invia form)
    await user.type(screen.getByLabelText('Name'), 'Nuovo');
    await user.type(screen.getByLabelText('Surname'), 'Utente');
    await user.type(screen.getByLabelText('Username'), 'newuser');
    await user.type(screen.getByLabelText('Email'), 'new@user.com');
    await user.type(screen.getByLabelText('Password'), 'password');
    await user.click(screen.getByRole('button', { name: 'Create User' }));

    // 3. Assert (Modal è chiuso e la lista è aggiornata)
    expect(screen.queryByText('Add a new municipality user')).not.toBeInTheDocument();
    expect(screen.getAllByText(/surname:/i)).toHaveLength(9);
    expect(screen.getByText('Nuovo')).toBeInTheDocument();
    expect(screen.getByText('Utente')).toBeInTheDocument();
  });

  it('dovrebbe permettere di assegnare un ruolo a un utente "unassigned"', async () => {
    // 1. Arrange
    // Otteniamo il "container" dal nostro helper
    const { container } = renderAdminPage();
    
    // --- ✨ CORREZIONE 1: Selettore più preciso tramite classe CSS ---
    let addRoleButtons = container.querySelectorAll('.user-add-btn');

    // --- ✨ CORREZIONE 2: Il numero atteso è 3 (in base ai dummyUsers) ---
    expect(addRoleButtons).toHaveLength(3);

    // 2. Act (Clicca il primo bottone "+")
    await user.click(addRoleButtons[0]);

    // 3. Assert (Modal di assegnazione ruolo è aperto)
    expect(screen.getByText('Assign Role')).toBeInTheDocument();

    // 2. Act (Assegna il ruolo "admin")
    await user.click(screen.getByText('Municipal Administrator'));

    // 3. Assert (Modal è chiuso e il n° di bottoni "+" è sceso a 2)
    expect(screen.queryByText('Assign Role')).not.toBeInTheDocument();
    
    // Riusiamo il selettore per riverificare
    addRoleButtons = container.querySelectorAll('.user-add-btn');
    expect(addRoleButtons).toHaveLength(2);
  });
});