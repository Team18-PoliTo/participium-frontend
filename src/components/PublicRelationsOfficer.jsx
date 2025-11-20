import { useState, useEffect, useContext } from "react";
import { Container, Stack, Alert, Row, Col, Dropdown } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { 
  Droplets, 
  Accessibility, 
  Waves, 
  Lightbulb, 
  Trash2, 
  TrafficCone,
  Construction,
  Trees,
  Wrench
} from "lucide-react";
import API from "../API/API";
import ReportCard from "./ReportCard";
import ReportDescription from "./ReportDescription";
import LoadingSpinner from "./LoadingSpinner";
import "./styles/PublicRelationsOfficer.css";
import { NavbarTextContext } from "../App";

// Dati dummy per testing
const dummyReports = [
  {
    id: 1,
    title: "Broken Water Fountain",
    description: "Public water fountain not working in the city center.",
    category: "Water Supply – Drinking Water",
    status: "PENDING",
    createdAt: "2025-11-15T10:30:00",

    location: {
      latitude: 45.0703,
      longitude: 7.6869
    }
  },
  {
    id: 2,
    title: "Missing Wheelchair Ramp",
    description: "No accessibility ramp at the entrance of public building.",
    category: "Architectural Barriers",
    status: "IN_PROGRESS",
    createdAt: "2025-11-14T14:20:00",
    location: {
      latitude: 45.0677,
      longitude: 7.6824
    }
  },
  {
    id: 3,
    title: "Clogged Storm Drain",
    description: "Storm drain is clogged causing water accumulation on the street.",
    category: "Sewer System",
    status: "RESOLVED",
    createdAt: "2025-11-10T08:45:00",
    location: {
      latitude: 45.0705,
      longitude: 7.6868
    }
  },
  {
    id: 4,
    title: "Broken Street Light",
    description: "Street light not working near the park entrance.",
    category: "Public Lighting",
    status: "PENDING",
    createdAt: "2025-11-17T11:00:00",
    location: {
      latitude: 45.0689,
      longitude: 7.6812
    }
  },
  {
    id: 5,
    title: "Overflowing Trash Bin",
    description: "Public trash bin is full and overflowing, creating unsanitary conditions.",
    category: "Waste",
    status: "IN_PROGRESS",
    createdAt: "2025-11-12T15:30:00",
    location: {
      latitude: 45.0538,
      longitude: 7.6853
    }
  },
  {
    id: 6,
    title: "Malfunctioning Traffic Light",
    description: "Traffic light stuck on red causing traffic congestion.",
    category: "Road Signs and Traffic Lights",
    status: "REJECTED",
    createdAt: "2025-11-13T09:15:00",
    location: {
      latitude: 45.0643,
      longitude: 7.6958
    }
  },
  {
    id: 7,
    title: "Large Pothole on Main Road",
    description: "Dangerous pothole causing damage to vehicles.",
    category: "Roads and Urban Furnishings",
    status: "IN_PROGRESS",
    createdAt: "2025-11-16T07:20:00",
    location: {
      latitude: 45.0456,
      longitude: 7.6698
    }
  },
  {
    id: 8,
    title: "Broken Playground Equipment",
    description: "Swing set is broken and unsafe for children.",
    category: "Public Green Areas and Playgrounds",
    status: "PENDING",
    createdAt: "2025-11-18T08:00:00",
    location: {
      latitude: 45.0832,
      longitude: 7.6547
    }
  },
  {
    id: 9,
    title: "Graffiti on Public Wall",
    description: "Vandalism on municipal building wall.",
    category: "Other",
    status: "RESOLVED",
    createdAt: "2025-11-11T16:45:00",
    location: {
      latitude: 45.0625,
      longitude: 7.6721
    }
  }
];

const categories = [
  "Water Supply – Drinking Water",
  "Architectural Barriers",
  "Sewer System",
  "Public Lighting",
  "Waste",
  "Road Signs and Traffic Lights",
  "Roads and Urban Furnishings",
  "Public Green Areas and Playgrounds",
  "Other"
];

function PublicRelationsOfficer() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Filtri
  const [selectedCategory, setSelectedCategory] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc"); // "asc" o "desc"

  const {navbarText, setNavbarSubtitle} = useContext(NavbarTextContext);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reports, selectedCategory, startDate, endDate, sortOrder]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      // Commenta questa riga per usare i dati dummy
      // const data = await API.getReports();
      
      // Simula una chiamata API con un delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const data = dummyReports;
      
      setReports(data);
      setError(null);
    } catch (err) {
      setError("Failed to load reports. Please try again.");
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category, size = 20) => {
    const iconProps = { size, color: "#3D5A80" };
    
    switch (category) {
      case "Water Supply – Drinking Water":
        return <Droplets {...iconProps} />;
      case "Architectural Barriers":
        return <Accessibility {...iconProps} />;
      case "Sewer System":
        return <Waves {...iconProps} />;
      case "Public Lighting":
        return <Lightbulb {...iconProps} />;
      case "Waste":
        return <Trash2 {...iconProps} />;
      case "Road Signs and Traffic Lights":
        return <TrafficCone {...iconProps} />;
      case "Roads and Urban Furnishings":
        return <Construction {...iconProps} />;
      case "Public Green Areas and Playgrounds":
        return <Trees {...iconProps} />;
      case "Other":
        return <Wrench {...iconProps} />;
      default:
        return <Wrench {...iconProps} />;
    }
  };

  const applyFilters = () => {
    let filtered = [...reports];

    // Filtro per categoria
    if (selectedCategory) {
      filtered = filtered.filter(report => report.category === selectedCategory);
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
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      active={selectedCategory === category}
                    >
                      <div className="d-flex align-items-center gap-2">
                        {getCategoryIcon(category, 18)}
                        <span>{category}</span>
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
        />
      </Container>
    </div>
  );
}

export default PublicRelationsOfficer;