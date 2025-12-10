import { useState, useEffect, useContext } from "react";
import { Container, Alert, Dropdown, Card, Badge, Stack } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import API from "../API/API";
import ReportCard from "./ReportCard";
import MaintainerReportModal from "./MaintainerReportModal";
import LoadingSpinner from "./LoadingSpinner";
import "./styles/MaintainerPage.css";
import { UserContext } from "../App";
import useReportFilters from "../utils/useReportFilters";
import { Briefcase } from "lucide-react";

function MaintainerPage() {
  const { user } = useContext(UserContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Hook per i filtri
  const {
    filteredReports,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    sortOrder,
    setSortOrder,
    statusFilter,
    setStatusFilter,
    resetFilters,
  } = useReportFilters(reports, { statusFilter: "All" }); // Default mostra Assigned

  // Caricamento Report Assegnati all'azienda
  useEffect(() => {
    const fetchCompanyReports = async () => {
      try {
        setLoading(true);
        // Assumiamo che l'utente loggato sia l'External Maintainer e il backend sappia chi è dal token
        const fetchedReports = await API.getReportsAssignedToMe();
        console.log(fetchedReports);

        // Normalizzazione dati se necessario
        const normalize = (r) => {
          if (!r) return [];
          if (Array.isArray(r)) return r;
          if (Array.isArray(r.data)) return r.data;
          return [];
        };

        setReports(normalize(fetchedReports));
        setError(null);
      } catch (err) {
        console.error("Failed to fetch company reports:", err);
        setError("Failed to load maintenance reports. Please try again later.");
        setReports([]); // Pulisce in caso di errore
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyReports();
  }, []);

  const handleReportClick = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const handleReportUpdated = (reportId) => {
    // Ricarichiamo i report per avere lo stato aggiornato, oppure aggiorniamo localmente
    // Qui optiamo per un refresh ottimistico locale se il modale passa l'ID
    // Ma siccome cambiamo lo stato, potrebbe uscire dai filtri correnti (es. se filtro per Assigned e diventa In Progress)

    // Per semplicità, richiamiamo l'API o filtriamo. Se l'API restituisce lo stato aggiornato è meglio.
    // Simuliamo aggiornamento locale o refresh
    window.location.reload(); // Quick fix to ensure consistency, or fetchReports again
  };

  if (loading) {
    return <LoadingSpinner message="Loading maintenance tasks..." />;
  }

  return (
    <div className="maintainer-board">
      <Container fluid className="maintainer-content-wrapper">

        {/* Header */}
        <header className="maintainer-headline">
          <div className="maintainer-headline-text">
            <Badge className="maintainer-eyebrow">External Maintenance</Badge>
            <h1 className="maintainer-title">Work Orders</h1>
            <p className="maintainer-subtitle">
              Manage interventions and update report status for citizens.
            </p>
          </div>
          {/* Opzionale: info azienda */}
          {user?.companyName && (
            <div className="d-flex align-items-center gap-2 text-muted">
              <Briefcase size={20} />
              <span className="fw-bold">{user.companyName}</span>
            </div>
          )}
        </header>

        {error && <Alert variant="danger">{error}</Alert>}

        <div className="maintainer-layout">

          {/* Sidebar Filtri */}
          <aside className="maintainer-sidebar">
            <Card className="maintainer-filter-card">
              <Card.Body>
                <span className="maintainer-filter-title">FILTER OPTIONS</span>
                <div className="maintainer-filter-group">

                  {/* Status Filter */}
                  <div className="mb-3">
                    <div className="maintainer-filter-label">Status</div>
                    <Dropdown className="maintainer-custom-dropdown">
                      <Dropdown.Toggle>
                        <span>{statusFilter || "All Statuses"}</span>
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => setStatusFilter("All")}>All</Dropdown.Item>
                        <Dropdown.Item onClick={() => setStatusFilter("Delegated")}>Delegated</Dropdown.Item>
                        <Dropdown.Item onClick={() => setStatusFilter("Assigned")}>Assigned</Dropdown.Item>
                        <Dropdown.Item onClick={() => setStatusFilter("In Progress")}>In Progress</Dropdown.Item>
                        <Dropdown.Item onClick={() => setStatusFilter("Suspended")}>Suspended</Dropdown.Item>
                        <Dropdown.Item onClick={() => setStatusFilter("Resolved")}>Resolved</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>

                  {/* Date Filters */}
                  <div className="mb-3">
                    <div className="maintainer-filter-label">Start Date</div>
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Select Date"
                      className="maintainer-date-picker-input"
                      wrapperClassName="w-100"
                    />
                  </div>
                  <div className="mb-3">
                    <div className="maintainer-filter-label">End Date</div>
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Select Date"
                      className="maintainer-date-picker-input"
                      wrapperClassName="w-100"
                    />
                  </div>

                  {/* Sort */}
                  <div className="mb-3">
                    <div className="maintainer-filter-label">Sort by Date</div>
                    <Dropdown className="maintainer-custom-dropdown">
                      <Dropdown.Toggle>
                        <span>{sortOrder === "desc" ? "Newest First" : "Oldest First"}</span>
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => setSortOrder("desc")}>Newest First</Dropdown.Item>
                        <Dropdown.Item onClick={() => setSortOrder("asc")}>Oldest First</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>

                  <button className="maintainer-reset-btn" onClick={resetFilters}>
                    <i className="bi bi-arrow-counterclockwise me-2"></i> Reset Filters
                  </button>

                </div>
              </Card.Body>
            </Card>
          </aside>

          {/* Main List */}
          <section className="maintainer-main">
            <Card className="maintainer-reports-card">
              <Card.Body>
                <div className="maintainer-reports-header">
                  <div>
                    <h2 className="maintainer-reports-title">Tasks</h2>
                    <p className="maintainer-reports-count">
                      Showing <Badge bg="secondary" className="maintainer-count-badge">{filteredReports.length}</Badge> tasks
                    </p>
                  </div>
                </div>

                {filteredReports.length === 0 ? (
                  <div className="maintainer-empty-state">
                    <i className="bi bi-clipboard-check maintainer-empty-icon"></i>
                    <p className="maintainer-empty-message">No tasks found</p>
                    <p className="maintainer-empty-hint">Check back later or adjust filters.</p>
                  </div>
                ) : (
                  <div className="maintainer-reports-list">
                    <Stack gap={3}>
                      {filteredReports.map((report) => (
                        <ReportCard
                          key={report.id}
                          report={report}
                          onClick={handleReportClick}
                        // showPRO={false} 
                        />
                      ))}
                    </Stack>
                  </div>
                )}
              </Card.Body>
            </Card>
          </section>

        </div>
      </Container>

      {/* Modal Actions */}
      <MaintainerReportModal
        show={showModal}
        onHide={() => setShowModal(false)}
        report={selectedReport}
        onReportUpdated={handleReportUpdated}
      />
    </div>
  );
}

export default MaintainerPage;