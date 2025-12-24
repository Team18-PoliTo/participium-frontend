import { useState, useEffect } from "react";
import { Container, Stack, Alert, Dropdown, Card, Badge } from "react-bootstrap";
import { useNavigate } from "react-router";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import API from "../../API/API";
import ReportCard from "../Report/ReportCard";
import LoadingSpinner from "../LoadingSpinner";
import "../styles/PublicRelationsOfficer.css";
import { getCategoryIcon } from "../../constants/categoryIcons";
import useReportFilters from "../../utils/useReportFilters";

function PublicRelationsOfficer() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  const {
    filteredReports, startDate, setStartDate, endDate, setEndDate,
    sortOrder, setSortOrder, categoryFilter: selectedCategory,
    setCategoryFilter: setSelectedCategory, resetFilters,
  } = useReportFilters(reports, { categoryFilter: "" });

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        setLoading(true);
        const [catData, repData] = await Promise.all([
          API.getAllCategories(),
          API.getAllReportsIsPending()
        ]);
        setCategories(catData);
        setReports(repData);
        setError(null);
      } catch (err) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchInitData();
  }, []);

  const handleReportClick = (report) => {
    navigate(`/reports/${report.id}`);
  };

  if (loading) return <LoadingSpinner message="Loading reports..." />;

  return (
    <div className="pro-board">
      <Container fluid className="pro-content-wrapper">
        <header className="pro-headline">
          <div className="pro-headline-text">
            <Badge className="pro-eyebrow">Public Relations</Badge>
            <h1 className="pro-title">Reports Dashboard</h1>
            <p className="pro-subtitle">Review and manage pending citizen reports</p>
          </div>
        </header>

        {/* Uso dei tag semantici per rispettare la CSS Grid definita in PublicRelationsOfficer.css */}
        <div className="pro-layout">
          <aside className="pro-sidebar">
            <Card className="pro-filter-card shadow-sm">
              <Card.Body>
                <span className="pro-filter-title">FILTER OPTIONS</span>
                <div className="pro-filter-group">
                  <div className="mb-3">
                    <label className="pro-filter-label">Category</label>
                    <Dropdown className="pro-custom-dropdown">
                      <Dropdown.Toggle id="category-dropdown">
                        <div className="d-flex align-items-center gap-2">
                          {selectedCategory && getCategoryIcon(selectedCategory, 20)}
                          <span>{selectedCategory || "All Categories"}</span>
                        </div>
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => setSelectedCategory("")} active={selectedCategory === ""}>
                          All Categories
                        </Dropdown.Item>
                        {categories.map((category) => (
                          <Dropdown.Item key={category.id} onClick={() => setSelectedCategory(category.name)} active={selectedCategory === category.name}>
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
                    <label className="pro-filter-label">Start Date</label>
                    <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} dateFormat="dd/MM/yyyy" placeholderText="Select Date" className="pro-custom-date-picker-input w-100" />
                  </div>

                  {/* Filtro End Date ripristinato */}
                  <div className="mb-3">
                    <label className="pro-filter-label">End Date</label>
                    <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} dateFormat="dd/MM/yyyy" placeholderText="End Date" className="pro-custom-date-picker-input w-100" />
                  </div>

                  <div className="mb-3">
                    <label className="pro-filter-label">Sort Order</label>
                    <Dropdown className="pro-custom-dropdown">
                      <Dropdown.Toggle>
                        {sortOrder === "desc" ? "Newest First" : "Oldest First"}
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => setSortOrder("desc")}>Newest First</Dropdown.Item>
                        <Dropdown.Item onClick={() => setSortOrder("asc")}>Oldest First</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>

                  <button className="pro-reset-filters-btn w-100" onClick={resetFilters}>
                    Reset Filters
                  </button>
                </div>
              </Card.Body>
            </Card>
          </aside>

          <section className="pro-main">
            <Card className="pro-reports-card border-0">
              <Card.Body>
                <h2 className="pro-reports-title mb-4">Pending Reports ({filteredReports.length})</h2>
                {filteredReports.length === 0 ? (
                  <div className="pro-empty-state py-5 text-center">
                    <p className="pro-empty-message">No reports found</p>
                  </div>
                ) : (
                  <Stack gap={3}>
                    {filteredReports.map((report) => (
                      <ReportCard key={report.id} report={report} onClick={handleReportClick} />
                    ))}
                  </Stack>
                )}
              </Card.Body>
            </Card>
          </section>
        </div>
      </Container>
    </div>
  );
}

export default PublicRelationsOfficer;