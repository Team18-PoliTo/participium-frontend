import { useState, useEffect, useContext, useCallback } from "react";
import { Container, Alert, Dropdown, Card, Badge, Stack } from "react-bootstrap";
import { useNavigate } from "react-router";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import API from "../../API/API";
import ReportCard from "../Report/ReportCard";
import LoadingSpinner from "../LoadingSpinner";
import "../styles/MaintainerPage.css";
import { UserContext } from "../../App";
import useReportFilters from "../../utils/useReportFilters";
import { Briefcase } from "lucide-react";

function MaintainerPage() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    filteredReports, startDate, setStartDate, endDate, setEndDate,
    sortOrder, setSortOrder, statusFilter, setStatusFilter, resetFilters,
  } = useReportFilters(reports, { statusFilter: "All" });

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const data = await API.getReportsAssignedToMe();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load maintenance tasks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleReportClick = (report) => {
    navigate(`/reports/${report.id}`);
  };

  if (loading) return <LoadingSpinner message="Loading maintenance tasks..." />;

  return (
    <div className="maintainer-board">
      <Container fluid className="maintainer-content-wrapper">
        <header className="maintainer-headline">
          <div className="maintainer-headline-text">
            <Badge className="maintainer-eyebrow">External Maintenance</Badge>
            <h1 className="maintainer-title">Work Orders</h1>
            {user?.companyName && (
              <div className="d-flex align-items-center gap-2 mt-2 text-muted">
                <Briefcase size={18} />
                <span className="fw-bold">{user.companyName}</span>
              </div>
            )}
          </div>
        </header>

        <div className="maintainer-layout">
          <aside className="maintainer-sidebar">
            <Card className="maintainer-filter-card shadow-sm">
              <Card.Body>
                <span className="maintainer-filter-title">FILTERS</span>
                <div className="maintainer-filter-group">
                  <div className="mb-3">
                    <label className="maintainer-filter-label">Status</label>
                    <Dropdown className="maintainer-custom-dropdown">
                      <Dropdown.Toggle>{statusFilter || "All"}</Dropdown.Toggle>
                      <Dropdown.Menu>
                        {["All", "Delegated", "Assigned", "In Progress", "Suspended", "Resolved"].map(s => (
                          <Dropdown.Item key={s} onClick={() => setStatusFilter(s)}>{s}</Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>

                  <div className="mb-3">
                    <label className="maintainer-filter-label">Start Date</label>
                    <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} dateFormat="dd/MM/yyyy" className="maintainer-date-picker-input w-100" />
                  </div>

                  <div className="mb-3">
                    <label className="maintainer-filter-label">End Date</label>
                    <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} dateFormat="dd/MM/yyyy" className="maintainer-date-picker-input w-100" />
                  </div>

                  <button className="maintainer-reset-btn w-100 mt-3" onClick={resetFilters}>Reset</button>
                </div>
              </Card.Body>
            </Card>
          </aside>

          <section className="maintainer-main">
            <Card className="maintainer-reports-card border-0">
              <Card.Body>
                <h2 className="maintainer-reports-title mb-4">Tasks ({filteredReports.length})</h2>
                <Stack gap={3}>
                  {filteredReports.length === 0 ? (
                    <div className="maintainer-empty-state py-5 text-center">
                      <p className="maintainer-empty-message">No tasks found</p>
                    </div>
                  ) : (
                    filteredReports.map((report) => (
                      <ReportCard key={report.id} report={report} onClick={handleReportClick} />
                    ))
                  )}
                </Stack>
              </Card.Body>
            </Card>
          </section>
        </div>
      </Container>
    </div>
  );
}

export default MaintainerPage;