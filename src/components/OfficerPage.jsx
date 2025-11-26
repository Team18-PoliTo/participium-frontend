import { useState, useEffect, useContext } from "react";
import { Container, Stack, Alert, Row, Col, Dropdown } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ReportCard from "./ReportCard";
import ReportDescriptionModal from "./ReportDescriptionModal";
import LoadingSpinner from "./LoadingSpinner";
import "./styles/OfficerPage.css";
import { getRoleIcon } from "../constants/roleIcons";
import { UserContext } from "../App";

// MOCK DATA
const mockReports = [
  {
    id: 1,
    title: "Broken streetlight on Via Roma",
    description: "The streetlight has been out for 3 days.",
    createdAt: "2025-11-20T10:30:00Z",
    status: "Assigned",
    address: "Via Roma, Torino",
    location: {
      latitude: 45.0703,
      longitude: 7.6869,
    },
    category: {
      id: 2,
      name: "Public Lighting",
    },
    photos: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca"
    ],
  },
  {
    id: 2,
    title: "Overflowing trash bin",
    description: "Trash bin near Piazza Castello is full.",
    createdAt: "2025-11-22T14:15:00Z",
    status: "Assigned",
    address: "Piazza Castello, Torino",
    location: {
      latitude: 45.0705,
      longitude: 7.6867,
    },
    category: {
      id: 4,
      name: "Waste Management",
    },
    photos: [
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308"
    ],
  },
  {
    id: 3,
    title: "Pothole on Corso Francia",
    description: "Large pothole causing traffic issues.",
    createdAt: "2025-11-21T09:00:00Z",
    status: "Assigned",
    address: "Corso Francia, Torino",
    location: {
      latitude: 45.0720,
      longitude: 7.6850,
    },
    category: {
      id: 1,
      name: "Street Maintenance",
    },
    photos: [],
  },
];

function OfficerPage() {

  const { userRole } = useContext(UserContext);

  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filtri
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc"); // "asc" o "desc"
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    // Simula caricamento dati mock da sostituire con API reale
    setLoading(true);
    setTimeout(() => {
      setReports(mockReports);
      setLoading(false);
      setError(null);
    }, 700);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reports, startDate, endDate, sortOrder, statusFilter]);

  const applyFilters = () => {
    let filtered = [...reports];

    // Filtro per status
    if (statusFilter !== "All") {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    // Filtro per data inizio
    if (startDate) {
      filtered = filtered.filter(report => 
        new Date(report.createdAt) >= startDate
      );
    }

    // Filtro per data fine
    if (endDate) {
      const endDateCopy = new Date(endDate);
      endDateCopy.setHours(23, 59, 59, 999);
      filtered = filtered.filter(report => 
        new Date(report.createdAt) <= endDateCopy
      );
    }

    // Ordinamento per data
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    setFilteredReports(filtered);
  };

  const handleResetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSortOrder("desc");
    setStatusFilter("All");
  };

  const handleReportClick = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const handleReportUpdated = (reportId) => {
    setReports(prevReports => prevReports.filter(r => r.id !== reportId));
    setShowModal(false);
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
    <div className="officer-page">
      <Container className="pt-4 pb-4">
        {/* Titolo */}
        <div className="officer-role-header mb-4 d-flex align-items-center gap-3">
          <div className="officer-role-icon-circle">
            {getRoleIcon(userRole, 48, "#fff")}
          </div>
          <span className="officer-role-name">{userRole}</span>
        </div>

        {/* Sezione Filtri */}
        <div className="filters-section">
          <Row className="g-3 align-items-end">
            <Col md={3}>
              <label className="filter-label">Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="Select Date"
                className="custom-date-picker-input"
                wrapperClassName="w-100"
              />
            </Col>
            <Col md={3}>
              <label className="filter-label">End Date</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="Select Date"
                className="custom-date-picker-input"
                wrapperClassName="w-100"
              />
            </Col>
            <Col md={3}>
              <label className="filter-label">Sort by Date</label>
              <Dropdown className="custom-category-dropdown">
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
            </Col>
            <Col md={2}>
              <label className="filter-label">Status</label>
              <Dropdown className="custom-category-dropdown w-100">
                <Dropdown.Toggle id="status-dropdown" className="w-100">
                  <span>{statusFilter}</span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setStatusFilter("All")} active={statusFilter === "All"}>
                    All
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setStatusFilter("Assigned")} active={statusFilter === "Assigned"}>
                    Assigned
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setStatusFilter("Rejected")} active={statusFilter === "Rejected"}>
                    Rejected
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setStatusFilter("Resolved")} active={statusFilter === "Resolved"}>
                    Resolved
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
            <Col md={1} className="d-flex justify-content-end">
              <button
                className="reset-filters-btn"
                onClick={handleResetFilters}
              >
                Reset
              </button>
            </Col>
          </Row>
        </div>

        {/* Counter */}
        <div className="results-counter">
          Showing {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''} assigned to you
        </div>

        {/* Lista Reports */}
        <Stack gap={3}>
          {filteredReports.length > 0 ? (
            filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onClick={handleReportClick}
              />
            ))
          ) : (
            <Alert variant="info">No reports found matching the selected filters.</Alert>
          )}
        </Stack>

        {/* Modal per Report Description */}
        <ReportDescriptionModal
          show={showModal}
          onHide={() => setShowModal(false)}
          report={selectedReport}
          onReportUpdated={handleReportUpdated}
          isOfficerView={true}
        />
      </Container>
    </div>
  );
}

export default OfficerPage;