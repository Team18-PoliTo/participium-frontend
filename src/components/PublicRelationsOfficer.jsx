import { useState, useEffect, useContext } from "react";
import { Container, Stack, Alert, Row, Col, Dropdown } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import API from "../API/API";
import ReportCard from "./ReportCard";
import ReportDescription from "./ReportDescription";
import LoadingSpinner from "./LoadingSpinner";
import "./styles/PublicRelationsOfficer.css";
import { NavbarTextContext } from "../App";
import { getCategoryIcon } from "../constants/categoryIcons";


function PublicRelationsOfficer() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState([]);

  // Filtri
  const [selectedCategory, setSelectedCategory] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc"); // "asc" o "desc"

  const {navbarText, setNavbarSubtitle} = useContext(NavbarTextContext);

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

  useEffect(() => {
    applyFilters();
  }, [reports, selectedCategory, startDate, endDate, sortOrder]);

  const applyFilters = () => {
    let filtered = [...reports];

    // Filtro per categoria
    if (selectedCategory) {
      filtered = filtered.filter(report => report.category.name === selectedCategory);
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
    setSelectedCategory("");
    setStartDate(null);
    setEndDate(null);
    setSortOrder("desc");
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
    <div className="public-relations-officer-page">
      <Container className="pt-4 pb-4">
        {/* Titolo */}
        <h1 className="page-title mb-4">Reports Dashboard</h1>

        {/* Sezione Filtri */}
        <div className="filters-section">
          <Row className="g-3">
            <Col md={3}>
              <label className="filter-label">Category</label>
              <Dropdown className="custom-category-dropdown">
                <Dropdown.Toggle id="category-dropdown">
                  <div className="d-flex align-items-center gap-2">
                    {selectedCategory && getCategoryIcon(selectedCategory, 20)}
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
            </Col>
            <Col md={2}>
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
            <Col md={2}>
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
            <Col md={2} className="d-flex align-items-end">
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
          Showing {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
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
        <ReportDescription
          show={showModal}
          onHide={() => setShowModal(false)}
          report={selectedReport}
          onReportUpdated={handleReportUpdated}
        />
      </Container>
    </div>
  );
}

export default PublicRelationsOfficer;