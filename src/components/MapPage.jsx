import { useState, useRef, useContext, useCallback } from "react";
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  GeoJSON, 
  LayersControl, 
  ZoomControl,
  useMapEvents // Assicuriamoci che questo sia importato
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster"; 
import API from "../API/API";
import { Offcanvas } from "react-bootstrap";
import { ChevronLeft } from "lucide-react";
import pointInPolygon from "point-in-polygon";

// Componenti
import ReportForm from "./ReportForm";
import ReportCard from "./ReportCard";
import ReportMapDescription from "./ReportMapDescription";
import InvalidLocationModal from "./InvalidLocationModal";
import ReportStatusModal from "./ReportStatusModal";
import GetBoundsLogger from "./GetBoundsLogger";
import { MapClickHandler, SearchBar, MapResizer } from "./MapLogic";

// Utils & Styles
import { getAddressFromCoordinates } from "../utils/geocoding";
import { MobileContext } from "../App";
import turinGeoJSON from "../data/turin-boundaries.json";
import { 
  turinStyle, 
  inverseMaskStyle, 
  createPinIcon, 
  createClusterCustomIcon, 
  getStatusColor 
} from "../utils/mapUtils";
import "leaflet-geosearch/dist/geosearch.css";
import "./styles/MapPage.css";

import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

// --- LOGICA GEOJSON ---
let turinFeature = null;
let turinPolygons = [];
let inverseMask = null;

try {
  turinFeature = turinGeoJSON.features.find(f => f.properties.comune === "Torino");
  if (turinFeature) {
    const geometry = turinFeature.geometry;
    if (geometry.type === "Polygon") turinPolygons.push(geometry.coordinates[0]);
    else if (geometry.type === "MultiPolygon") geometry.coordinates.forEach(p => turinPolygons.push(p[0]));
    
    const worldBounds = [[90, -180],[90, 180],[-90, 180],[-90, -180],[90, -180]];
    let holes = geometry.type === "Polygon" ? geometry.coordinates : [];
    if (geometry.type === "MultiPolygon") geometry.coordinates.forEach(p => holes.push(...p));
    
    inverseMask = { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [worldBounds, ...holes] } };
  }
} catch (e) { console.error("Error GeoJSON:", e); }

// --- NUOVO COMPONENTE: Gestore Interazioni ---
// Questo componente ascolta quando l'utente muove la mappa e chiude il popup
function MapInteractionHandler({ closePopup }) {
  useMapEvents({
    dragstart: () => closePopup(), // Chiude appena inizi a trascinare
    zoomstart: () => closePopup(), // Chiude appena inizi a zoomare
  });
  return null;
}

// --- COMPONENTE PRINCIPALE ---
function MapPage() {
  const { isMobile } = useContext(MobileContext);

  // Stati
  const [showForm, setShowForm] = useState(false);
  const [clickedPosition, setClickedPosition] = useState(null);
  const [showInvalidModal, setShowInvalidModal] = useState(false);
  
  // STATI REPORT
  const [reports, setReports] = useState([]); 
  const [visibleReports, setVisibleReports] = useState([]); 
  
  // Sidebar e Modali
  const [showReportsSidebar, setShowReportsSidebar] = useState(!isMobile);
  const [wasSidebarOpen, setWasSidebarOpen] = useState(true);
  const [selectedPin, setSelectedPin] = useState(null);
  const [showReportDetails, setShowReportDetails] = useState(false);
  const [selectedReportForDetails, setSelectedReportForDetails] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportModalIsSuccess, setReportModalIsSuccess] = useState(false);
  const [reportModalMessage, setReportModalMessage] = useState("");

  const mapRef = useRef();
  const initialPosition = [45.0703, 7.6869];

  // Caching Logica
  const handleReportsFetched = useCallback((newReports) => {
    setVisibleReports(newReports || []);
    setReports((prevReports) => {
      if (!newReports || newReports.length === 0) return prevReports;
      const reportsMap = new Map(prevReports.map(r => [r.id, r]));
      newReports.forEach(report => reportsMap.set(report.id, report));
      return Array.from(reportsMap.values());
    });
  }, []);

  // Handlers
  const handleMapClick = async (latlng, mapInstance) => {
    const activeMap = mapInstance || mapRef.current;
    if (!turinPolygons || turinPolygons.length === 0) {
      setClickedPosition(latlng);
      openFormAndCloseSidebar();
      return;
    }

    const { lat, lng } = latlng;
    const isInside = turinPolygons.some((polygon) => pointInPolygon([lng, lat], polygon));

    if (isInside) {
      let address = null;
      try { address = await getAddressFromCoordinates(lat, lng); } catch (e) { console.error(e); }
      setClickedPosition({ ...latlng, address });
      openFormAndCloseSidebar();
      
      if (activeMap) {
        activeMap.flyTo(latlng, 17, { animate: true, duration: 1.0 });
        setTimeout(() => activeMap.panBy([-200, 0], { duration: 0.5 }), 500);
      }
    } else {
      setShowInvalidModal(true);
    }
  };

  const openFormAndCloseSidebar = () => {
    setWasSidebarOpen(showReportsSidebar);
    if (showReportsSidebar) setShowReportsSidebar(false);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setClickedPosition(null);
    if (wasSidebarOpen) setTimeout(() => setShowReportsSidebar(true), 300);
  };

  const handleReportSubmit = (isSuccess, message) => {
    handleFormClose();
    setTimeout(() => {
      setReportModalIsSuccess(isSuccess);
      setReportModalMessage(message);
      setShowReportModal(true);
    }, 300);
  };

  const handleReportSelection = async (report) => {
    let address = report.address;
    if (!address) {
      try { address = await getAddressFromCoordinates(report.location.latitude, report.location.longitude); } catch (e) {}
    }
    if (mapRef.current) {
      mapRef.current.flyTo([report.location.latitude, report.location.longitude], 17, { duration: 1.2 });
    }
    setSelectedPin({ ...report, address, reportId: report.id });
  };

  const toggleReportsSidebar = () => setShowReportsSidebar(!showReportsSidebar);

  return (
    <div className="map-page-wrapper">
      <MapContainer
        ref={mapRef}
        center={initialPosition}
        zoom={13}
        className="fullpage-leaflet-container"
        zoomControl={false}
      >
        <LayersControl position="bottomleft">
          <LayersControl.BaseLayer checked name="Mappa Stradale">
            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer attribution='Tiles &copy; Esri' url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
          </LayersControl.BaseLayer>
        </LayersControl>

        <ZoomControl position="bottomleft" />

        <MapResizer isSidebarOpen={showReportsSidebar} />
        
        {/* Gestore per chiudere il popup al movimento */}
        <MapInteractionHandler closePopup={() => setSelectedPin(null)} />

        <SearchBar onLocationSelected={(latlng, map) => handleMapClick(latlng, map)} />
        <MapClickHandler onMapClick={(latlng) => handleMapClick(latlng)} />

        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterCustomIcon}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          maxClusterRadius={60}
        >
          {reports.map((report) => (
            <Marker
              key={report.id}
              position={[report.location.latitude, report.location.longitude]}
              icon={createPinIcon(report.status)}
              eventHandlers={{
                click: (e) => {
                  e.originalEvent.stopPropagation();
                  handleReportSelection(report);
                },
              }}
            />
          ))}
        </MarkerClusterGroup>

        {selectedPin && (
          <Popup
            position={[selectedPin.location.latitude, selectedPin.location.longitude]}
            offset={[0, -35]}
            onClose={() => setSelectedPin(null)}
            className="custom-popup"
            closeButton={false}
            autoPan={true} // Abilita il movimento automatico se il popup è fuori schermo
            autoPanPadding={[50, 50]} // Padding di sicurezza dai bordi (RISOLVE IL PROBLEMA FUORI SCHERMO)
          >
            <div className="popup-content">
              <button className="popup-close-btn" onClick={(e) => { e.stopPropagation(); setSelectedPin(null); }}>×</button>
              <div className="popup-status-badge" style={{ backgroundColor: getStatusColor(selectedPin.status) }}>
                  {selectedPin.status}
              </div>
              <div className="popup-address">{selectedPin.title}</div>
              <button
                className="popup-add-report-btn"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (showReportsSidebar) setShowReportsSidebar(false);
                  try {
                    const details = await API.getReportMapDetails(selectedPin.reportId);
                    setSelectedReportForDetails(details);
                    setShowReportDetails(true);
                  } catch (error) {
                    setSelectedReportForDetails(selectedPin);
                    setShowReportDetails(true);
                  }
                  setSelectedPin(null);
                }}
              >
                Show Details
              </button>
            </div>
          </Popup>
        )}

        {clickedPosition && showForm && <Marker position={clickedPosition} />}
        {inverseMask && <GeoJSON data={inverseMask} style={inverseMaskStyle} />}
        {turinFeature && <GeoJSON data={turinFeature} style={turinStyle} />}
        
        <GetBoundsLogger onReportsFetched={handleReportsFetched} />
      </MapContainer>

      {/* UI Elements */}
      {isMobile && !showReportsSidebar && (
        <button className="reports-fab" onClick={toggleReportsSidebar}>Reports ({visibleReports.length})</button>
      )}

      <div className={`reports-sidebar ${showReportsSidebar ? "open" : "closed"} ${isMobile ? "mobile" : ""}`}>
          <div className="reports-sidebar-content">
            <div className="reports-sidebar-header-wrapper">
              <h5 className="reports-sidebar-title">Reports ({visibleReports.length})</h5>
              <button className="reports-sidebar-toggle" onClick={toggleReportsSidebar}><span>×</span></button>
            </div>
            <div className="reports-list">
              {visibleReports.length === 0 ? (
                <p className="text-muted text-center mt-4">No reports visible</p>
              ) : (
                visibleReports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onClick={handleReportSelection}
                    showUser={true}
                    showPRO={false}
                  />
                ))
              )}
            </div>
          </div>
      </div>

      {!isMobile && !showReportsSidebar && (
        <div className="reports-sidebar-tab" onClick={toggleReportsSidebar}>
          <ChevronLeft size={20} className="reports-sidebar-tab-icon" />
          <span className="reports-sidebar-tab-text">Reports</span>
          <span className="reports-sidebar-tab-count">{visibleReports.length}</span>
        </div>
      )}

      <Offcanvas show={showForm} onHide={handleFormClose} placement="start" className="report-offcanvas">
        <Offcanvas.Header closeButton className="report-offcanvas__header">
          <Offcanvas.Title className="report-offcanvas__title">Create New Report</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="report-offcanvas__body">
          {showForm && (
            <ReportForm
              position={clickedPosition}
              onFormSubmit={handleFormClose}
              onReportResult={handleReportSubmit}
            />
          )}
        </Offcanvas.Body>
      </Offcanvas>

      <InvalidLocationModal showInvalidModal={showInvalidModal} setShowInvalidModal={setShowInvalidModal} />
      <ReportStatusModal show={showReportModal} onClose={() => setShowReportModal(false)} isSuccess={reportModalIsSuccess} message={reportModalMessage} />
      
      <ReportMapDescription
        show={showReportDetails}
        onHide={() => {
          setShowReportDetails(false);
          if (wasSidebarOpen && !isMobile) setTimeout(() => setShowReportsSidebar(true), 300);
        }}
        report={selectedReportForDetails}
      />
    </div>
  );
}

export default MapPage;