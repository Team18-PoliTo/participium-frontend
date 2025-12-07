import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Row, Col, Dropdown, Modal } from "react-bootstrap";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { MapPin } from "lucide-react";
import { getCategoryIcon } from "../constants/categoryIcons";
import "leaflet/dist/leaflet.css";
import "./styles/ReportDescription.css";
import API from "../API/API";

function ReportInfo({ report, canEditCategory, selectedCategory, setSelectedCategory }) {
  const [categories, setCategories] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await API.getAllCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error(error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  if (!report) return null;

  return (
    <>
      {/* Citizen Details */}
      <div className="mb-4">
        <div className="report-desc-label">Reported By</div>
        <div className="report-desc-text-display d-flex gap-3">
          <div className="flex-fill">
            <small className="text-muted d-block text-uppercase" style={{ fontSize: '0.7rem', fontWeight: '700' }}>First Name</small>
            <span className="fw-bold">{report.citizenName || "N/A"}</span>
          </div>
          <div className="border-start mx-2"></div>
          <div className="flex-fill">
            <small className="text-muted d-block text-uppercase" style={{ fontSize: '0.7rem', fontWeight: '700' }}>Last Name</small>
            <span className="fw-bold">{report.citizenLastName || "N/A"}</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="mb-4">
        <div className="report-desc-label">Title</div>
        <div className="report-desc-text-display fs-5 fw-bold text-dark">
          {report.title}
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <div className="report-desc-label">Description</div>
        <div className="report-desc-text-display" style={{ minHeight: '80px' }}>
          {report.description}
        </div>
      </div>

      {/* Address */}
      <div className="mb-4">
        <div className="report-desc-label">Address</div>
        <div className="report-desc-text-display d-flex align-items-center gap-2">
          <MapPin size={20} color="#EE6C4D" />
          <span className="fw-medium">
            {report.address}
          </span>
        </div>
      </div>

      {/* Location Map */}
      {report.location && (
        <div className="mb-4">
          <div className="report-desc-map-container">
            <MapContainer
              center={[report.location.latitude, report.location.longitude]}
              zoom={16}
              style={{ height: "200px", width: "100%" }}
              scrollWheelZoom={false}
              dragging={false}
              zoomControl={false}
              doubleClickZoom={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
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

      {/* Info Grid (Category, Status) */}
      <Row className="g-3 mb-4">
        <Col md={6}>
          <div className="report-desc-label">Category</div>
          {canEditCategory ? (
            <Dropdown className="report-desc-category-dropdown">
              <Dropdown.Toggle id="report-category-dropdown">
                <div className="d-flex align-items-center gap-2">
                  {getCategoryIcon(
                    categories.find((c) => c.id === selectedCategory?.id)?.name || "",
                    20
                  )}
                  <span className="fw-medium">
                    {categories.find((c) => c.id === selectedCategory?.id)?.name ||
                      "Select a category"}
                  </span>
                </div>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {categories.map((category) => (
                  <Dropdown.Item
                    key={category.id}
                    onClick={() => setSelectedCategory(category)}
                    active={selectedCategory?.id === category.id}
                  >
                    <div className="d-flex align-items-center gap-2">
                      {getCategoryIcon(category.name, 18)}
                      <span>{category.name}</span>
                    </div>
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <div className="report-desc-text-display d-flex align-items-center gap-2">
              {getCategoryIcon(report.category?.name || "", 20)}
              <span className="fw-medium">{report.category?.name || "No category"}</span>
            </div>
          )}
        </Col>
        <Col md={6}>
          <div className="report-desc-label">Status</div>
          <div className="report-desc-text-display">
            <span className="fw-bold text-uppercase" style={{ color: '#3D5A80', letterSpacing: '0.5px' }}>{report.status}</span>
          </div>
        </Col>
      </Row>

      {/* Submitted On */}
      <div className="mb-4">
        <div className="report-desc-label">Submitted On</div>
        <div className="report-desc-text-display text-muted small">
          {new Date(report.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      {/* Photos */}
      <div className="mb-4">
        <div className="report-desc-label">Photos</div>
        <div className="report-desc-photos-container">
          {report.photos && report.photos.length > 0 ? (
            <Row className="g-3">
              {report.photos.map((photo, index) => (
                <Col key={photo} xs={4}>
                  <button
                    type="button"
                    onClick={() => setSelectedPhoto(photo)}
                    className="report-desc-photo-button"
                    aria-label={`View photo ${index + 1}`}
                  >
                    <img
                      src={photo}
                      alt="Report evidence"
                      className="report-desc-photo"
                    />
                  </button>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="text-center text-muted py-3">
              <i className="bi bi-image" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
              <p className="mb-0 mt-2 small">No photos attached</p>
            </div>
          )}
        </div>
      </div>

      {/* Photo Viewer Modal */}
      <Modal
        show={!!selectedPhoto}
        onHide={() => setSelectedPhoto(null)}
        size="lg"
        centered
        className="photo-preview-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Photo Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 bg-dark d-flex justify-content-center">
          <img
            src={selectedPhoto}
            alt="Full size preview"
            style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
          />
        </Modal.Body>
      </Modal>
    </>
  );
}

ReportInfo.propTypes = {
  report: PropTypes.shape({
    citizenName: PropTypes.string,
    citizenLastName: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    address: PropTypes.string,
    location: PropTypes.shape({
      latitude: PropTypes.number,
      longitude: PropTypes.number,
    }),
    category: PropTypes.shape({
      name: PropTypes.string,
    }),
    status: PropTypes.string,
    createdAt: PropTypes.string,
    photos: PropTypes.arrayOf(PropTypes.string),
  }),
  canEditCategory: PropTypes.bool,
  selectedCategory: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
  }),
  setSelectedCategory: PropTypes.func,
};

export default ReportInfo;