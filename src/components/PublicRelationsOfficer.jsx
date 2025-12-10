import { useState, useEffect } from "react";
import {
  Container,
  Stack,
  Alert,
  Dropdown,
  Card,
  Badge,
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import API from "../API/API";
import ReportCard from "./ReportCard";
import ReportDescriptionModal from "./ReportDescriptionModal";
import LoadingSpinner from "./LoadingSpinner";
import "./styles/PublicRelationsOfficer.css";
import { getCategoryIcon } from "../constants/categoryIcons";
import useReportFilters from "../utils/useReportFilters";
import ReportPROActions from "./ReportPROActions";

function PublicRelationsOfficer() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState([]);

  // Uso del custom hook per i filtri
  const {
    filteredReports,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    sortOrder,
    setSortOrder,
    categoryFilter: selectedCategory,
    setCategoryFilter: setSelectedCategory,
    resetFilters,
  } = useReportFilters(reports, { categoryFilter: "" });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await API.getAllCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchReportsIsPending = async () => {
      try {
        setLoading(true);
        const fetchedReports = await API.getAllReportsIsPending();
        setReports(fetchedReports);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
        setError("Failed to load reports. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchReportsIsPending();
  }, []);

  const handleReportClick = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const handleReportUpdated = (reportId) => {
    setReports((prevReports) => prevReports.filter((r) => r.id !== reportId));
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

  const renderReportActions = (props) => <ReportPROActions {...props} />;

  return (
    <div className="pro-board">
      <Container fluid className="pro-content-wrapper">
        {/* Header Section */}
        <header className="pro-headline">
          <div className="pro-headline-text">
            <Badge className="pro-eyebrow">Public Relations</Badge>
            <h1 className="pro-title">Reports Dashboard</h1>
            <p className="pro-subtitle">
              Review and manage pending citizen reports
            </p>
          </div>
        </header>

        <div className="pro-layout">
          {/* Filters Sidebar */}
          <aside className="pro-sidebar">
            <Card className="pro-filter-card">
              <Card.Body>
                <span className="pro-filter-title">FILTER OPTIONS</span>
                <div className="pro-filter-group">
                  <div className="mb-3">
                    <label
                      className="pro-filter-label"
                      htmlFor="category-dropdown"
                    >
                      Category
                    </label>
                    <Dropdown className="pro-custom-dropdown">
                      <Dropdown.Toggle id="category-dropdown">
                        <div className="d-flex align-items-center gap-2">
                          {selectedCategory &&
                            getCategoryIcon(selectedCategory, 20)}
                          <span>{selectedCategory || "All Categories"}</span>
                        </div>
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item
                          onClick={() => setSelectedCategory("")}
                          active={selectedCategory === ""}
                        >
                          <div className="d-flex align-items-center gap-2">
                            <span>All Categories</span>
                          </div>
                        </Dropdown.Item>
                        {categories.map((category) => (
                          <Dropdown.Item
                            key={category.id}
                            onClick={() => setSelectedCategory(category.name)}
                            active={selectedCategory === category.name}
                          >
                            <div className="d-flex align-items-center gap-2">
                              {getCategoryIcon(category.name, 18)}
                              <span>{category.name}</span>
                            </div>
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>

                  <div className="mb-3">
                    <label
                      className="pro-filter-label"
                      htmlFor="start-date-picker"
                    >
                      Start Date
                    </label>
                    <DatePicker
                      id="start-date-picker"
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Select Date"
                      className="pro-custom-date-picker-input"
                      wrapperClassName="w-100"
                    />
                  </div>

                  <div className="mb-3">
                    <label
                      className="pro-filter-label"
                      htmlFor="end-date-picker"
                    >
                      End Date
                    </label>
                    <DatePicker
                      id="end-date-picker"
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Select Date"
                      className="pro-custom-date-picker-input"
                      wrapperClassName="w-100"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="pro-filter-label" htmlFor="sort-dropdown">
                      Sort by Date
                    </label>
                    <Dropdown className="pro-custom-dropdown">
                      <Dropdown.Toggle id="sort-dropdown">
                        <span>
                          {sortOrder === "desc"
                            ? "Newest First"
                            : "Oldest First"}
                        </span>
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

                  <button
                    className="pro-reset-filters-btn w-100"
                    onClick={resetFilters}
                  >
                    <i className="bi bi-arrow-counterclockwise me-2"></i> Reset
                    Filters
                  </button>
                </div>
              </Card.Body>
            </Card>
          </aside>

          {/* Main Content */}
          <section className="pro-main">
            <Card className="pro-reports-card">
              <Card.Body>
                <div className="pro-reports-header">
                  <div>
                    <h2 className="pro-reports-title">Pending Reports</h2>
                    <p className="pro-reports-count">
                      Showing{" "}
                      <Badge bg="secondary" className="pro-count-badge">
                        {filteredReports.length}
                      </Badge>{" "}
                      report{filteredReports.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                {filteredReports.length === 0 ? (
                  <div className="pro-empty-state">
                    <i className="bi bi-inbox pro-empty-icon"></i>
                    <p className="pro-empty-message">No reports found</p>
                    <p className="pro-empty-hint">
                      Try adjusting your filters or check back later.
                    </p>
                  </div>
                ) : (
                  <div className="pro-reports-list">
                    <Stack gap={3}>
                      {filteredReports.map((report) => (
                        <ReportCard
                          key={report.id}
                          report={report}
                          onClick={handleReportClick}
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

      {/* Modal per Report Description */}
      <ReportDescriptionModal
        show={showModal}
        onHide={() => setShowModal(false)}
        report={selectedReport}
        onReportUpdated={handleReportUpdated}
        actionsRenderer={renderReportActions}
      />
    </div>
  );
}

export default PublicRelationsOfficer;
