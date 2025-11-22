import { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Dropdown,
  Alert,
} from "react-bootstrap";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { MapPin, X, Check } from "lucide-react";
import { getAddressFromCoordinates } from "../utils/geocoding";
import { getCategoryIcon } from "../constants/categoryIcons";
import "leaflet/dist/leaflet.css";
import "./styles/ReportDescription.css";
import API from "../API/API";

function ReportDescription({ show, onHide, report, onReportUpdated }) {
  const [selectedCategory, setSelectedCategory] = useState(
    report?.category?.id || ""
  );
  const [explanation, setExplanation] = useState("");
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    if (report) {
      setSelectedCategory(report.category?.id || "");
      setError(null);
      setIsRejecting(false);
      setExplanation("");
    }
  }, [report]);

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

  const handleConfirm = async () => {
    try {
      setError(null);
      const status = isRejecting ? "Rejected" : "Assigned";
      const explanationText = isRejecting ? explanation : "No explanation required";
      const updatedReport = await API.judgeReport(
        report.id,
        status,
        selectedCategory,
        explanationText
      );
      
      if (onReportUpdated) {
        onReportUpdated(report.id);
      }
      
      handleClose();
    } catch (error) {
      setError(
        error.message || `Failed to ${isRejecting ? 'reject' : 'approve'} the report. Please try again.`
      );
    }
  };

  const handleClose = () => {
    setExplanation("");
    setSelectedCategory(report?.category?.id || "");
    setError(null);
    setIsRejecting(false);
    onHide();
  };

  if (!report) return null;

  return (
    <>
      <Modal
        show={show}
        onHide={handleClose}
        size="lg"
        centered
        fullscreen="md-down"
      >
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
              <span>{report.address || "Address not available"}</span>
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
                  <Marker
                    position={[
                      report.location.latitude,
                      report.location.longitude,
                    ]}
                  />
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
                  {getCategoryIcon(
                    categories.find((c) => c.id === selectedCategory)?.name || "",
                    18
                  )}
                  <span>
                    {categories.find((c) => c.id === selectedCategory)?.name ||
                      "Select a category"}
                  </span>
                </div>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {categories.map((category) => (
                  <Dropdown.Item
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    active={selectedCategory === category.id}
                  >
                    <div className="d-flex align-items-center gap-2">
                      {getCategoryIcon(category.name, 16)}
                      <span>{category.name}</span>
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
              {new Date(report.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {/* Photos */}
          <div className="mb-3">
            <label className="report-desc-label fw-bold">Included Photos</label>
            <div className="report-desc-photos-container">
              {report.photos && report.photos.length > 0 ? (
                <Row className="g-3">
                  {report.photos.map((photo, index) => (
                    <Col key={index} xs={12} md={4}>
                      <img
                        src={photo}
                        alt={`Report photo ${index + 1}`}
                        className="report-desc-photo"
                        onClick={() => setSelectedPhoto(photo)}
                        style={{ cursor: 'pointer' }}
                      />
                    </Col>
                  ))}
                </Row>
              ) : (
                <p className="text-muted">No photos included</p>
              )}
            </div>
          </div>

          {/* Action Toggle */}
          <div className="mb-3">
            <label className="report-desc-label fw-bold">Action</label>
            <div className={`report-desc-action-toggle ${isRejecting ? 'reject-active' : ''}`}>
              <Button
                className={`report-desc-toggle-btn ${!isRejecting ? 'active' : ''}`}
                variant="link"
                onClick={() => setIsRejecting(false)}
              >
                Approve
              </Button>
              <Button
                className={`report-desc-toggle-btn ${isRejecting ? 'active' : ''}`}
                variant="link"
                onClick={() => setIsRejecting(true)}
              >
                Reject
              </Button>
            </div>
          </div>

          {/* Explanation - always shown */}
          <div className="mb-3">
            <label className="report-desc-label fw-bold">Explanation</label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder={isRejecting ? "Enter your explanation here..." : "No explanation required"}
              value={isRejecting ? explanation : ""}
              onChange={(e) => setExplanation(e.target.value)}
              className="report-desc-textarea"
              disabled={!isRejecting}
              required={isRejecting}
            />
          </div>

          {/* Error Alert */}
          {error && (
            <Alert
              variant="danger"
              dismissible
              onClose={() => setError(null)}
              className="mb-0"
            >
              {error}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer className="report-desc-modal-footer d-flex justify-content-between">
          <Button
            variant="secondary"
            onClick={handleClose}
            className="report-desc-btn-cancel"
          >
            Cancel
          </Button>
          <Button
            variant={isRejecting ? "danger" : "success"}
            onClick={handleConfirm}
            className={`d-flex align-items-center gap-2 ${isRejecting ? 'report-desc-btn-reject' : 'report-desc-btn-approve'}`}
          >
            {isRejecting ? <X size={18} /> : <Check size={18} />}
            {isRejecting ? "Reject Report" : "Approve Report"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Photo Viewer Modal */}
      <Modal
        show={!!selectedPhoto}
        onHide={() => setSelectedPhoto(null)}
        size="lg"
        centered
        className="photo-preview-modal"
      >
        <Modal.Header closeButton className="report-desc-modal-header">
          <Modal.Title>Photo Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 bg-dark">
          <img
            src={selectedPhoto}
            alt="Full size preview"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </Modal.Body>
      </Modal>
    </>
  );
}

export default ReportDescription;
