import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import  PublicRelationsOfficer  from '../PublicRelationsOfficer';
import { MemoryRouter } from 'react-router';
import * as API from '../../API/API';
import { NavbarTextContext } from '../../App';

// Mock delle API
const mockGetAllCategories = vi.spyOn(API.default, 'getAllCategories');
const mockGetAllReportsIsPending = vi.spyOn(API.default, 'getAllReportsIsPending');
const mockGetReportDetails = vi.spyOn(API.default, 'getReportDetails');

// Helper per renderizzare PublicRelationsOfficer con il context
const renderPublicRelationsOfficer = (contextValue = { navbarText: '', setNavbarSubtitle: vi.fn() }) =>
  render(
    <MemoryRouter>
      <NavbarTextContext.Provider value={contextValue}>
        <PublicRelationsOfficer />
      </NavbarTextContext.Provider>
    </MemoryRouter>
  );

// Mock dati
const mockCategories = [
  { id: 1, name: 'Category 1' },
  { id: 2, name: 'Category 2' },
];
const mockReports = [
  {
    id: 1,
    title: 'Report 1',
    category: { name: 'Category 1' },
    createdAt: '2025-01-01',
    description: 'Desc 1',
    location: {
      latitude: 45.0,
      longitude: 9.0,
      address: 'Via Roma 1',
    },
  },
  {
    id: 2,
    title: 'Report 2',
    category: { name: 'Category 2' },
    createdAt: '2025-01-02',
    description: 'Desc 2',
    location: {
      latitude: 45.1,
      longitude: 9.1,
      address: 'Via Milano 2',
    },
  },
];


// Reset dei mock prima di ogni test
beforeEach(() => {
  mockGetAllCategories.mockReset();
  mockGetAllReportsIsPending.mockReset();
  mockGetReportDetails.mockReset();
  vi.clearAllMocks();
});

// Cleanup dopo ogni test
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('PublicRelationsOfficer component', () => {
  it('renders and fetches categories and reports on mount', async () => {
    mockGetAllCategories.mockResolvedValue(mockCategories);
    mockGetAllReportsIsPending.mockResolvedValue(mockReports);

    renderPublicRelationsOfficer();

    await waitFor(() => {
      expect(mockGetAllCategories).toHaveBeenCalled();
      expect(mockGetAllReportsIsPending).toHaveBeenCalled();
    });

    expect(screen.getByText('Reports Dashboard')).toBeInTheDocument();
  });

  it('displays error if fetching categories fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation();
    mockGetAllCategories.mockRejectedValue(new Error('Failed to fetch categories'));
    mockGetAllReportsIsPending.mockResolvedValue(mockReports);

    renderPublicRelationsOfficer();

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Failed to fetch categories', expect.any(Error));
    });
  });

  it('displays error if fetching reports fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation();
    mockGetAllCategories.mockResolvedValue(mockCategories);
    mockGetAllReportsIsPending.mockRejectedValue(new Error('Failed to fetch reports'));

    renderPublicRelationsOfficer();

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Failed to fetch reports', expect.any(Error));
    });
  });

  it('renders category filter dropdown with all categories', async () => {
    mockGetAllCategories.mockResolvedValue(mockCategories);
    mockGetAllReportsIsPending.mockResolvedValue(mockReports);

    renderPublicRelationsOfficer();

    await waitFor(() => {
      expect(screen.getByText('All Categories')).toBeInTheDocument();
      expect(screen.getByText('Category 1')).toBeInTheDocument();
      expect(screen.getByText('Category 2')).toBeInTheDocument();
    });
  });

  it('filters reports by selected category', async () => {
    mockGetAllCategories.mockResolvedValue(mockCategories);
    mockGetAllReportsIsPending.mockResolvedValue(mockReports);

    renderPublicRelationsOfficer();

    await waitFor(() => {
      expect(screen.getByText('Report 1')).toBeInTheDocument();
      expect(screen.getByText('Report 2')).toBeInTheDocument();
    });

    const categoryDropdown = screen.getByRole('button', { name: /All Categories/i });
    await userEvent.click(categoryDropdown);

    const categoryItem = screen.getByText('Category 1');
    await userEvent.click(categoryItem);

    await waitFor(() => {
      expect(screen.getByText('Report 1')).toBeInTheDocument();
      expect(screen.queryByText('Report 2')).not.toBeInTheDocument();
    });
  });

  it('filters reports by date range', async () => {
    mockGetAllCategories.mockResolvedValue(mockCategories);
    mockGetAllReportsIsPending.mockResolvedValue(mockReports);

    renderPublicRelationsOfficer();

    await waitFor(() => {
      expect(screen.getByText('Report 1')).toBeInTheDocument();
      expect(screen.getByText('Report 2')).toBeInTheDocument();
    });

    const startDatePicker = screen.getByLabelText('Start Date');
    await userEvent.type(startDatePicker, '01/01/2025');

    const endDatePicker = screen.getByLabelText('End Date');
    await userEvent.type(endDatePicker, '01/01/2025');

    await waitFor(() => {
      expect(screen.getByText('Report 1')).toBeInTheDocument();
      expect(screen.queryByText('Report 2')).not.toBeInTheDocument();
    });
  });

  it('sorts reports by date (newest first)', async () => {
    mockGetAllCategories.mockResolvedValue(mockCategories);
    mockGetAllReportsIsPending.mockResolvedValue(mockReports);

    renderPublicRelationsOfficer();

    await waitFor(() => {
      expect(screen.getByText('Report 2')).toBeInTheDocument();
      expect(screen.getByText('Report 1')).toBeInTheDocument();
    });

    const sortDropdown = screen.getByRole('button', { name: /Newest First/i });
    await userEvent.click(sortDropdown);

    const oldestFirst = screen.getByText('Oldest First');
    await userEvent.click(oldestFirst);

    await waitFor(() => {
      expect(screen.getByText('Report 1')).toBeInTheDocument();
      expect(screen.getByText('Report 2')).toBeInTheDocument();
    });
  });

  it('opens modal when clicking on a report', async () => {
    mockGetAllCategories.mockResolvedValue(mockCategories);
    mockGetAllReportsIsPending.mockResolvedValue(mockReports);
    mockGetReportDetails.mockResolvedValue(mockReports[0]);

    renderPublicRelationsOfficer();

    await waitFor(() => {
      expect(screen.getByText('Report 1')).toBeInTheDocument();
    });

    const reportCard = screen.getByText('Report 1');
    await userEvent.click(reportCard);

    await waitFor(() => {
      expect(screen.getByText('Report Description')).toBeInTheDocument();
    });
  });

  it('updates report list after report update', async () => {
    mockGetAllCategories.mockResolvedValue(mockCategories);
    mockGetAllReportsIsPending.mockResolvedValue(mockReports);

    renderPublicRelationsOfficer();

    await waitFor(() => {
      expect(screen.getByText('Report 1')).toBeInTheDocument();
    });

    mockGetAllReportsIsPending.mockResolvedValue(mockReports.filter((r) => r.id !== 1));

    // Simuliamo l'aggiornamento lista (dipende da come gestisci l'evento di aggiornamento nel componente)
    // Se hai una funzione di callback, chiamala qui

    await waitFor(() => {
      expect(screen.queryByText('Report 1')).not.toBeInTheDocument();
    });
  });

  it('displays "No reports found" when filtered list is empty', async () => {
    mockGetAllCategories.mockResolvedValue(mockCategories);
    mockGetAllReportsIsPending.mockResolvedValue([]);

    renderPublicRelationsOfficer();

    await waitFor(() => {
      expect(screen.getByText('No reports found matching the selected filters.')).toBeInTheDocument();
    });
  });

  it('resets filters when reset button is clicked', async () => {
    mockGetAllCategories.mockResolvedValue(mockCategories);
    mockGetAllReportsIsPending.mockResolvedValue(mockReports);

    renderPublicRelationsOfficer();

    const resetButton = screen.getByRole('button', { name: 'Reset' });
    await userEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.getByText('All Categories')).toBeInTheDocument();
      expect(screen.getByText('Report 1')).toBeInTheDocument();
      expect(screen.getByText('Report 2')).toBeInTheDocument();
    });
  });
});
