import { useState, useEffect } from "react";
import { Row, Col, Dropdown, Modal } from "react-bootstrap";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { MapPin } from "lucide-react";
import { getCategoryIcon } from "../constants/categoryIcons";
import "leaflet/dist/leaflet.css";
import "./styles/ReportDescription.css";
import API from "../API/API";
import { getAddressFromCoordinates } from "../utils/geocoding";

function ReportInfo({ report, canEditCategory, selectedCategory, setSelectedCategory }) {
  const [categories, setCategories] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [address, setAddress] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await API.getAllCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

   useEffect(() => {
    if (report) {
      setAddress(null);
      if (report.location && !report.address) {
        getAddressFromCoordinates(
          report.location.latitude,
          report.location.longitude
        )
          .then((addr) => setAddress(addr))
          .catch((error) => {
            setAddress(
              `${report.location.latitude.toFixed(4)}, ${report.location.longitude.toFixed(4)}`
            );
          });
      } else if (report.address) {
        setAddress(report.address);
      }
    }
  }, [report]);

  if (!report) return null;

  return (
    <>
      {/* Citizen Details */}
      <div className="mb-4">
        <label className="report-desc-label">Reported By</label>
        <div className="report-desc-text-display d-flex gap-3">
            <div className="flex-fill">
                <small className="text-muted d-block text-uppercase" style={{fontSize:'0.7rem', fontWeight:'700'}}>First Name</small>
                <span className="fw-bold">{report.citizenName || "N/A"}</span>
            </div>
            <div className="border-start mx-2"></div>
            <div className="flex-fill">
                <small className="text-muted d-block text-uppercase" style={{fontSize:'0.7rem', fontWeight:'700'}}>Last Name</small>
                <span className="fw-bold">{report.citizenSurname || "N/A"}</span>
            </div>
        </div>
      </div>
          
      {/* Title */}
      <div className="mb-4">
        <label className="report-desc-label">Title</label>
        <div className="report-desc-text-display fs-5 fw-bold text-dark">
            {report.title}
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="report-desc-label">Description</label>
        <div className="report-desc-text-display" style={{minHeight: '80px'}}>
            {report.description}
        </div>
      </div>

      {/* Address */}
      <div className="mb-4">
        <label className="report-desc-label">Address</label>
        <div className="report-desc-text-display d-flex align-items-center gap-2">
          <MapPin size={20} color="#EE6C4D" />
          <span className="fw-medium">{address || "Address not available"}</span>
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

      {/* Category */}
      <div className="mb-4">
        <label className="report-desc-label">Category</label>
        {canEditCategory ? (
          <Dropdown className="report-desc-category-dropdown">
            <Dropdown.Toggle id="report-category-dropdown">
              <div className="d-flex align-items-center gap-2">
                {getCategoryIcon(
                  categories.find((c) => c.id === selectedCategory)?.name || "",
                  20
                )}
                <span className="fw-medium">
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
      </div>

      {/* Photos */}
      <div className="mb-4">
        <label className="report-desc-label">Photos</label>
        <div className="report-desc-photos-container">
          {report.photos && report.photos.length > 0 ? (
            <Row className="g-3">
              {report.photos.map((photo, index) => (
                <Col key={index} xs={4}>
                  <img
                    src={photo}
                    alt={`Report photo ${index + 1}`}
                    className="report-desc-photo"
                    onClick={() => setSelectedPhoto(photo)}
                  />
                </Col>
              ))}
            </Row>
          ) : (
            <div className="text-center text-muted py-3">
                <i className="bi bi-image" style={{fontSize: '2rem', opacity: 0.5}}></i>
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

export default ReportInfo;