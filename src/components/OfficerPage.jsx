import { useState, useEffect, useContext } from "react";
import { Container, Alert, Dropdown, Card, Badge } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ReportCard from "./ReportCard";
import ReportDescriptionModal from "./ReportDescriptionModal";
import DelegationActions from "./DelegationActions";
import LoadingSpinner from "./LoadingSpinner";
import "./styles/OfficerPage.css";
import { UserContext } from "../App";
import API from "../API/API";
import useReportFilters from "../utils/useReportFilters";



const renderDelegationActions = (props) => <DelegationActions {...props} />;

function OfficerPage() {

  const { userRole } = useContext(UserContext);

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Uso del custom hook per i filtri
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
    resetFilters
  } = useReportFilters(reports, { statusFilter: "All" });

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const reports = await API.getReportsAssignedToMe();
        const normalize = (r) => {
          if (!r) return [];
          if (Array.isArray(r)) return r;
          return [];
        };
        setReports(normalize(reports));
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError(
          "Failed to load your assigned reports. Please try again later."
        );
        setReports([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleReportClick = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const handleReportUpdated = (reportId) => {
    setReports(prevReports => prevReports.filter(r => r.id !== reportId));
    // setShowModal(false); // Removed to allow modal to show success message
  };

  if (loading) {
    return <LoadingSpinner message="Loading reports..." />;
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <div className="officer-board">
      <Container fluid className="officer-content-wrapper">
        {/* Header Section */}
        <header className="officer-headline">
          <div className="officer-headline-text">
            <Badge className="officer-eyebrow">{userRole}</Badge>
            <h1 className="officer-title">My Assigned Reports</h1>
            <p className="officer-subtitle">Manage and track reports assigned to you</p>
          </div>
        </header>

        <div className="officer-layout">
          {/* Filter Sidebar */}
          <aside className="officer-sidebar">
            <Card className="officer-filter-card">
              <Card.Body>
                <span className="officer-filter-title">FILTER OPTIONS</span>
                <div className="officer-filter-group">
                  <div className="mb-3">
                    <label className="officer-filter-label" htmlFor="start-date-picker">Start Date</label>
                    <DatePicker
                      id="start-date-picker"
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Select Date"
                      className="officer-date-picker-input"
                      wrapperClassName="w-100"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="officer-filter-label" htmlFor="end-date-picker">End Date</label>
                    <DatePicker
                      id="end-date-picker"
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Select Date"
                      className="officer-date-picker-input"
                      wrapperClassName="w-100"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="officer-filter-label" htmlFor="sort-dropdown">Sort by Date</label>
                    <Dropdown className="officer-custom-dropdown">
                      <Dropdown.Toggle id="sort-dropdown">
                        <span>{sortOrder === "desc" ? "Newest First" : "Oldest First"}</span>
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item
                          onClick={() => setSortOrder("desc")}
                          active={sortOrder === "desc"}
                        >
                          Newest First
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => setSortOrder("asc")}
                          active={sortOrder === "asc"}
                        >
                          Oldest First
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>

                  <div className="mb-3">
                    <label className="officer-filter-label" htmlFor="status-dropdown">Status</label>
                    <Dropdown className="officer-custom-dropdown">
                      <Dropdown.Toggle id="status-dropdown">
                        <span>{statusFilter}</span>
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => setStatusFilter("All")} active={statusFilter === "All"}>
                          All
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => setStatusFilter("Assigned")} active={statusFilter === "Assigned"}>
                          Assigned
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => setStatusFilter("In Progress")} active={statusFilter === "In Progress"}>
                          In Progress
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => setStatusFilter("Suspended")} active={statusFilter === "Suspended"}>
                          Suspended
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => setStatusFilter("Resolved")} active={statusFilter === "Resolved"}>
                          Resolved
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>

                  <button
                    className="officer-reset-btn w-100"
                    onClick={resetFilters}
                  >
                    <i className="bi bi-arrow-counterclockwise me-2"></i>{' '}
                    Reset Filters
                  </button>
                </div>
              </Card.Body>
            </Card>
          </aside>

          {/* Main Content */}
          <section className="officer-main">
            <Card className="officer-reports-card">
              <Card.Body>
                <div className="officer-reports-header">
                  <div>
                    <h2 className="officer-reports-title">Assigned Reports</h2>
                    <p className="officer-reports-count">
                      Showing <Badge bg="secondary" className="officer-count-badge">{filteredReports.length}</Badge> report{filteredReports.length === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>

                {filteredReports.length === 0 ? (
                  <div className="officer-empty-state">
                    <i className="bi bi-inbox officer-empty-icon"></i>
                    <p className="officer-empty-message">No reports found</p>
                    <p className="officer-empty-hint">Try adjusting your filters or check back later.</p>
                  </div>
                ) : (
                  <div className="officer-reports-list">
                    {filteredReports.map((report) => (
                      <ReportCard
                        key={report.id}
                        report={report}
                        onClick={handleReportClick}
                      />
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </section>
        </div>
      </Container>

      {/* Modal for Report Description */}
      <ReportDescriptionModal
        show={showModal}
        onHide={() => setShowModal(false)}
        report={selectedReport}
        onReportUpdated={handleReportUpdated}
        actionsRenderer={renderDelegationActions}
      />
    </div>
  );
}

export default OfficerPage;