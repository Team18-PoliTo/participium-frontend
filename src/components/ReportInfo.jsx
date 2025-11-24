import { useState, useEffect } from "react";
import { Row, Col, Dropdown } from "react-bootstrap";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { MapPin } from "lucide-react";
import { getCategoryIcon } from "../constants/categoryIcons";
import "leaflet/dist/leaflet.css";
import "./styles/ReportDescription.css";
import API from "../API/API";

function ReportInfo({ report, canEditCategory, selectedCategory, setSelectedCategory }) {
  const [categories, setCategories] = useState([]);

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

  if (!report) return null;

  return (
    <>
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
        {canEditCategory ? (
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
        ) : (
          <div className="d-flex align-items-center gap-2">
            {getCategoryIcon(report.category?.name || "", 18)}
            <span>{report.category?.name || "No category"}</span>
          </div>
        )}
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
    </>
  );
}

export default ReportInfo;