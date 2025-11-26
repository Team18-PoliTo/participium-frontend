import { useState, useEffect } from "react";
import { Modal, Button, Row, Col } from "react-bootstrap";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { MapPin } from "lucide-react";
import { getCategoryIcon } from "../constants/categoryIcons";
import "leaflet/dist/leaflet.css";
import "./styles/ReportMapDescription.css";
import { getAddressFromCoordinates } from "../utils/geocoding";

function ReportMapDescription({ show, onHide, report }) {
  const [categories, setCategories] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [address, setAddress] = useState(null);

  useEffect(() => {
    if (report) {
      setAddress(null);

      // Carica l'indirizzo se non è già presente
      if (report.location && !report.address) {
        getAddressFromCoordinates(
          report.location.latitude,
          report.location.longitude
        )
          .then((addr) => setAddress(addr))
          .catch((error) => {
            console.error("Error loading address:", error);
            setAddress(
              `${report.location.latitude.toFixed(
                4
              )}, ${report.location.longitude.toFixed(4)}`
            );
          });
      } else if (report.address) {
        setAddress(report.address);
      }
    }
  }, [report]);

  const handleClose = () => {
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
          {/* Citizen Details */}
          <Row className="mb-3">
            <Col xs={6}>
              <label className="report-desc-label fw-bold">First Name</label>
              <p className="report-desc-text-display">
                {report.citizen?.firstName || "N/A"}
              </p>
            </Col>
            <Col xs={6}>
              <label className="report-desc-label fw-bold">Last Name</label>
              <p className="report-desc-text-display">
                {report.citizen?.lastName || "N/A"}
              </p>
            </Col>
          </Row>
          
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
              <span>
                {address ||
                  (report.location
                    ? `${report.location.latitude.toFixed(
                        4
                      )}, ${report.location.longitude.toFixed(4)}`
                    : "Address not available")}
              </span>
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
                  style={{
                    height: "250px",
                    width: "100%",
                    borderRadius: "8px",
                  }}
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
            <div className="d-flex align-items-center gap-2 report-desc-text-display">
              {getCategoryIcon(report.category?.name || "", 18)}
              <span>{report.category?.name || "No category"}</span>
            </div>
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
                        style={{ cursor: "pointer" }}
                      />
                    </Col>
                  ))}
                </Row>
              ) : (
                <p className="text-muted">No photos included</p>
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="report-desc-modal-footer">
          <Button
            variant="primary"
            onClick={handleClose}
            className="report-desc-btn-cancel"
          >
            Close
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
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </Modal.Body>
      </Modal>
    </>
  );
}

export default ReportMapDescription;
