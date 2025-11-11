import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, GeoJSON } from 'react-leaflet';
import { Offcanvas } from 'react-bootstrap';
import ReportForm from './ReportForm'; 
import './styles/MapPage.css'; 
import InvalidLocationModal from './InvalidLocationModal';
import pointInPolygon from 'point-in-polygon';
import turinGeoJSON from '../data/turin-boundaries.json'; 

// Extract the Turin feature from GeoJSON data for rendering the polygon on the map
let turinFeature = null;
try {
  turinFeature = turinGeoJSON.features.find(
    (feature) => feature.properties.comune === "Torino"
  );
  if (!turinFeature) {
    throw new Error("Unable to find 'Torino' in the GeoJSON file");
  }
} catch (e) {
  console.error("Error finding Turin feature:", e);
}

// Extract polygon coordinates from the Turin feature for click validation
let turinPolygons = []; 
try {
  if (turinFeature) {
    const geometry = turinFeature.geometry;
    
    // Handle both Polygon and MultiPolygon geometries
    if (geometry.type === "Polygon") {
      turinPolygons.push(geometry.coordinates[0]);
    } else if (geometry.type === "MultiPolygon") {
      geometry.coordinates.forEach(polygon => {
        turinPolygons.push(polygon[0]); 
      });
    }
  } else {
    throw new Error("Turin feature not found, unable to extract polygons.");
  }
} catch (e) {
  console.error("Error extracting Turin polygons:", e);
  turinPolygons = null; 
}

// Component to handle map click events
function MapClickHandler({ onMapClick }) {
  const map = useMapEvents({
    click(e) {
      onMapClick(e.latlng, map);
    },
  });
  return null;
}

function MapPage() {
  const [showForm, setShowForm] = useState(false);
  const [clickedPosition, setClickedPosition] = useState(null); 
  const [showInvalidModal, setShowInvalidModal] = useState(false);
  
  // Initial map center position (Turin coordinates)
  const initialPosition = [45.0703, 7.6869];

  // Handle map clicks and validate if the clicked position is within Turin boundaries
  const handleMapClick = (latlng, map) => {
    // Skip validation if Turin boundaries are not loaded
    if (!turinPolygons) { 
      console.warn("Turin boundaries not loaded, validation skipped.");
      setClickedPosition(latlng);
      setShowForm(true);
      return;
    }

    const { lat, lng } = latlng;
    const clickedPoint = [lng, lat]; 

    // Check if the clicked point is inside any of the Turin polygons
    const isInside = turinPolygons.some(polygon => 
      pointInPolygon(clickedPoint, polygon)
    );

    if (isInside) {
      setClickedPosition(latlng);
      setShowForm(true);
      
      // Wait for the Offcanvas to open, then center the map
      setTimeout(() => {
        const mapSize = map.getSize();
        const offcanvasWidth = 600; // Offcanvas width in pixels

        // Project the clicked position to pixel coordinates at zoom level 17
        const projected = map.project(latlng, 17);

        // Calculate offset to center the marker in the visible right portion of the map
        const visibleWidth = mapSize.x - offcanvasWidth;
        const offsetX = offcanvasWidth + (visibleWidth / 2) - (mapSize.x / 2);
        
        // Apply the offset to the projected coordinates
        const offsetProjected = projected.subtract([offsetX, 0]);

        // Convert back to geographic coordinates
        const targetLatLng = map.unproject(offsetProjected, 17);

        // Center the map on the calculated position with zoom level 17
        map.setView(targetLatLng, 17, { animate: true });
      }, 300); // Wait for Offcanvas animation to complete
    } else {
      // Show modal if the clicked position is outside Turin boundaries
      setShowInvalidModal(true);
    }
  };

  // Close the form and reset the clicked position
  const handleFormClose = () => {
    setShowForm(false);
    setClickedPosition(null); 
  };

  // Style configuration for the Turin boundary polygon
  const turinStyle = {
    color: "#EE6C4D",
    weight: 5,
    opacity: 0.8,
    fillOpacity: 0.1
  };

  return (
    <>
      <div className="map-page-wrapper">
        <MapContainer 
          center={initialPosition} 
          zoom={13} 
          className="fullpage-leaflet-container"
        >
          {/* OpenStreetMap tile layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Custom component to handle map click events */}
          <MapClickHandler onMapClick={handleMapClick} />
          
          {/* Show marker at clicked position when form is open */}
          {clickedPosition && showForm && <Marker position={clickedPosition} />}

          {/* Render Turin boundary polygon if feature data is available */}
          {turinFeature && (
            <GeoJSON 
              data={turinFeature}
              style={turinStyle}
            />
          )}
        </MapContainer>
      </div>

      {/* Offcanvas panel for the report form */}
      <Offcanvas show={showForm} onHide={handleFormClose} placement="start" className="report-offcanvas">
        <Offcanvas.Header closeButton className="report-offcanvas__header">
          <Offcanvas.Title className="report-offcanvas__title">Create New Report</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="report-offcanvas__body">
          <ReportForm 
            position={clickedPosition} 
            onFormSubmit={handleFormClose} 
          />
        </Offcanvas.Body>
      </Offcanvas>
      
      {/* Modal shown when user clicks outside Turin boundaries */}
      <InvalidLocationModal 
        showInvalidModal={showInvalidModal} 
        setShowInvalidModal={setShowInvalidModal} 
      />
    </>
  );
}

export default MapPage;