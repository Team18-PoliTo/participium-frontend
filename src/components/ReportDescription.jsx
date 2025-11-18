import { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Dropdown } from "react-bootstrap";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { 
  Droplets, 
  Accessibility, 
  Waves, 
  Lightbulb, 
  Trash2, 
  TrafficCone,
  Construction,
  Trees,
  Wrench,
  MapPin,
  X,
  Check
} from "lucide-react";
import { getAddressFromCoordinates } from "../utils/geocoding";
import "leaflet/dist/leaflet.css";
import "./styles/ReportDescription.css";

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

function ReportDescription({ show, onHide, report, onApprove, onReject }) {
  const [selectedCategory, setSelectedCategory] = useState(report?.category || "");
  const [explanation, setExplanation] = useState("");
  const [address, setAddress] = useState("Loading address...");

  useEffect(() => {
    if (report) {
      setSelectedCategory(report.category || "");
      
      // Fetch address
      if (report.location) {
        getAddressFromCoordinates(report.location.latitude, report.location.longitude)
          .then(addr => setAddress(addr))
          .catch(() => setAddress("Address not available"));
      }
    }
  }, [report]);

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

  const handleApprove = () => {
    onApprove({ ...report, category: selectedCategory, explanation });
    handleClose();
  };

  const handleReject = () => {
    onReject({ ...report, explanation });
    handleClose();
  };

  const handleClose = () => {
    setExplanation("");
    setSelectedCategory(report?.category || "");
    setAddress("Loading address...");
    onHide();
  };

  if (!report) return null;

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton className="report-desc-modal-header">
        <Modal.Title>Report Details</Modal.Title>
      </Modal.Header>
      <Modal.Body className="report-desc-modal-body">
        {/* Title */}
        <div className="mb-3">
          <label className="report-desc-label fw-bold">Title</label>
          <p className="report-desc-text-display">{report.title}</p>
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="report-desc-label fw-bold">Description</label>
          <p className="report-desc-text-display">{report.description}</p>
        </div>

        {/* Address */}
        <div className="mb-3">
          <label className="report-desc-label fw-bold">Address</label>
          <div className="d-flex align-items-center gap-2 report-desc-text-display">
            <MapPin size={16} color="#3D5A80" />
            <span>{address}</span>
          </div>
        </div>

        {/* Location Map */}
        {report.location && (
          <div className="mb-3">
            <label className="report-desc-label fw-bold">Location</label>
            <div className="report-desc-map-container">
              <MapContainer
                center={[report.location.latitude, report.location.longitude]}
                zoom={16}
                style={{ height: "250px", width: "100%", borderRadius: "8px" }}
                scrollWheelZoom={false}
                dragging={false}
                zoomControl={false}
                doubleClickZoom={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[report.location.latitude, report.location.longitude]} />
              </MapContainer>
            </div>
          </div>
        )}

        {/* Category */}
        <div className="mb-3">
          <label className="report-desc-label fw-bold">Category</label>
          <Dropdown className="report-desc-category-dropdown">
            <Dropdown.Toggle id="report-category-dropdown">
              <div className="d-flex align-items-center gap-2">
                {getCategoryIcon(selectedCategory, 18)}
                <span>{selectedCategory}</span>
              </div>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {categories.map((category) => (
                <Dropdown.Item
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  active={selectedCategory === category}
                >
                  <div className="d-flex align-items-center gap-2">
                    {getCategoryIcon(category, 16)}
                    <span>{category}</span>
                  </div>
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {/* Creation Date */}
        <div className="mb-3">
          <label className="report-desc-label fw-bold">Creation Date</label>
          <p className="report-desc-text-display">
            {new Date(report.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        {/* Photos */}
        <div className="mb-3">
          <label className="report-desc-label fw-bold">Included Photos</label>
          <div className="report-desc-photos-container">
            {report.photos && report.photos.length > 0 ? (
              <Row className="g-2">
                {report.photos.map((photo, index) => (
                  <Col key={index} xs={6} md={4}>
                    <img 
                      src={photo} 
                      alt={`Report photo ${index + 1}`} 
                      className="report-desc-photo"
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              <p className="text-muted">No photos included</p>
            )}
          </div>
        </div>

        {/* Explanation */}
        <div className="mb-3">
          <label className="report-desc-label fw-bold">Explanation</label>
          <Form.Control
            as="textarea"
            rows={4}
            placeholder="Enter your explanation here..."
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            className="report-desc-textarea"
          />
        </div>
      </Modal.Body>
      <Modal.Footer className="report-desc-modal-footer d-flex justify-content-between">
        <Button variant="secondary" onClick={handleClose} className="report-desc-btn-cancel">
          Cancel
        </Button>
        <div className="d-flex gap-2">
          <Button variant="danger" onClick={handleReject} className="report-desc-btn-reject d-flex align-items-center gap-2">
            <X size={18} />
            Reject
          </Button>
          <Button variant="success" onClick={handleApprove} className="report-desc-btn-approve d-flex align-items-center gap-2">
            <Check size={18} />
            Approve
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default ReportDescription;