import { useState, useEffect, useRef, useContext } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
  GeoJSON,
} from "react-leaflet";
import useSupercluster from "use-supercluster";
import L from "leaflet";
import API from "../API/API";
import { Offcanvas, Button } from "react-bootstrap";
import ReportForm from "./ReportForm";
import ReportCard from "./ReportCard";
import ReportMapDescription from "./ReportMapDescription";
import "leaflet-geosearch/dist/geosearch.css";
import "./styles/MapPage.css";
import InvalidLocationModal from "./InvalidLocationModal";
import ReportStatusModal from "./ReportStatusModal";
import pointInPolygon from "point-in-polygon";
import turinGeoJSON from "../data/turin-boundaries.json";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import { getAddressFromCoordinates } from "../utils/geocoding";
import { ChevronLeft } from "lucide-react";
import GetBoundsLogger from "./GetBoundsLogger";
import { MobileContext } from "../App";


// --- LOGICA GEOJSON ---
let turinFeature = null;
let turinPolygons = [];
let inverseMask = null;

try {
  turinFeature = turinGeoJSON.features.find(
    (feature) => feature.properties.comune === "Torino"
  );
  if (turinFeature) {
    const geometry = turinFeature.geometry;
    if (geometry.type === "Polygon") {
      turinPolygons.push(geometry.coordinates[0]);
    } else if (geometry.type === "MultiPolygon") {
      geometry.coordinates.forEach((polygon) => {
        turinPolygons.push(polygon[0]);
      });
    }

    const worldBounds = [
      [90, -180],
      [90, 180],
      [-90, 180],
      [-90, -180],
      [90, -180],
    ];
    let holes = [];
    if (geometry.type === "Polygon") {
      holes = geometry.coordinates;
    } else if (geometry.type === "MultiPolygon") {
      geometry.coordinates.forEach((polygon) => {
        holes.push(...polygon);
      });
    }
    inverseMask = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [worldBounds, ...holes],
      },
    };
  }
} catch (e) {
  console.error("Error loading Turin GeoJSON:", e);
}

// --- COMPONENTI DI SUPPORTO ---

// 1. Gestore Click Mappa
function MapClickHandler({ onMapClick }) {
  const map = useMap();

  useMapEvents({
    click(e) {
      onMapClick(e.latlng, map);
    },
  });
  return null;
}

// 2. Barra di Ricerca
const SearchBar = ({ onLocationSelected }) => {
  const map = useMap();
  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider,
      style: "bar",
      showMarker: false,
      autoClose: true,
      keepResult: false,
    });
    map.addControl(searchControl);
    map.on("geosearch/showlocation", (result) => {
      const { x: lng, y: lat } = result.location;
      onLocationSelected({ lat, lng }, map);
    });
    return () => {
      map.removeControl(searchControl);
      map.off("geosearch/showlocation");
    };
  }, [map, onLocationSelected]);
  return null;
};

// 3. Icone
const createClusterIcon = (count, size) => {
  return L.divIcon({
    html: `<div class="cluster-marker" style="width: ${size}px; height: ${size}px;">
             ${count}
           </div>`,
    className: "leaflet-marker-icon",
    iconSize: [size, size],
  });
};

const pinIcon = L.divIcon({
  html: `<div class="custom-pin-marker">
           <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" 
                   fill="#EE6C4D" stroke="#fff" stroke-width="1.5"/>
             <circle cx="12" cy="9" r="2.5" fill="#fff"/>
           </svg>
         </div>`,
  className: "custom-pin-icon",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// 4. MapUpdater (SPOSTATO FUORI e con PROPS)
// Riceve setBounds, setZoom e mapRef come props per evitare il loop
function MapUpdater({ setBounds, setZoom, mapRef }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Salva il riferimento alla mappa
    if (mapRef) {
      mapRef.current = map;
    }

    const updateMapState = () => {
      const b = map.getBounds();
      setBounds([
        b.getSouthWest().lng,
        b.getSouthWest().lat,
        b.getNorthEast().lng,
        b.getNorthEast().lat,
      ]);
      setZoom(map.getZoom());
    };

    map.on("moveend", updateMapState);
    updateMapState(); // Inizializza subito

    return () => map.off("moveend", updateMapState);
  }, [map, setBounds, setZoom, mapRef]); // Dipendenze corrette

  return null;
}

// --- COMPONENTE PRINCIPALE ---
function MapPage() {

  const {isMobile} = useContext(MobileContext);

  // Stati
  const [showForm, setShowForm] = useState(false);
  const [clickedPosition, setClickedPosition] = useState(null);
  const [showInvalidModal, setShowInvalidModal] = useState(false);
  const [reports, setReports] = useState([]);
  const [bounds, setBounds] = useState(null);
  const [zoom, setZoom] = useState(13);

  // Sidebar destra per i report
  const [showReportsSidebar, setShowReportsSidebar] = useState(!isMobile);
  const [wasSidebarOpen, setWasSidebarOpen] = useState(true);

  // Popup per il pin selezionato
  const [selectedPin, setSelectedPin] = useState(null);

  // Modal per i dettagli del report
  const [showReportDetails, setShowReportDetails] = useState(false);
  const [selectedReportForDetails, setSelectedReportForDetails] =
    useState(null); // Modali di stato
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportModalIsSuccess, setReportModalIsSuccess] = useState(false);
  const [reportModalMessage, setReportModalMessage] = useState("");

  const mapRef = useRef();
  const initialPosition = [45.0703, 7.6869];


  // Preparazione punti per Supercluster
  const points = reports.map((report) => ({
    type: "Feature",
    properties: {
      cluster: false,
      reportId: report.id,
      ...report,
    },
    geometry: {
      type: "Point",
      coordinates: [
        parseFloat(report.location.longitude),
        parseFloat(report.location.latitude),
      ],
    },
  }));

  // Hook Supercluster
  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom,
    options: { radius: 75, maxZoom: 15 },
  });

  // Gestione Click Mappa
  const handleMapClick = async (latlng, mapInstance) => {
    console.log("handleMapClick chiamato con:", latlng);

    // Usa la mappa passata o quella dal ref se disponibile (per searchbar)
    const activeMap = mapInstance || mapRef.current;

    console.log("activeMap disponibile:", !!activeMap);

    if (!turinPolygons || turinPolygons.length === 0) {
      console.warn("Turin boundaries not loaded, validation skipped.");
      setClickedPosition(latlng);
      // Salva lo stato corrente della sidebar prima di aprire il form
      setWasSidebarOpen(showReportsSidebar);
      if (showReportsSidebar) {
        setShowReportsSidebar(false);
      }
      setShowForm(true);
      return;
    }

    const { lat, lng } = latlng;
    const clickedPoint = [lng, lat];
    const isInside = turinPolygons.some((polygon) =>
      pointInPolygon(clickedPoint, polygon)
    );

    console.log("Punto dentro Torino:", isInside);

    if (isInside) {
      // Carica l'indirizzo per il form
      let address = null;
      try {
        address = await getAddressFromCoordinates(lat, lng);
      } catch (error) {
        console.error("Error loading address:", error);
      }

      setClickedPosition({ ...latlng, address });

      // Salva lo stato corrente della sidebar e apri il form
      setWasSidebarOpen(showReportsSidebar);

      // Chiudi la sidebar immediatamente
      if (showReportsSidebar) {
        setShowReportsSidebar(false);
      }

      setShowForm(true);
      console.log("Form aperto, inizio centratura mappa...");

      // Centra la mappa con il punto cliccato visibile a destra dell'offcanvas
      if (activeMap) {
        setTimeout(() => {
          console.log("Imposto zoom e centro mappa");
          // Prima centra sul punto cliccato
          activeMap.setView(latlng, 17, { animate: true });

          // Poi sposta la mappa a sinistra per compensare l'offcanvas
          setTimeout(() => {
            const offcanvasWidth = 500;
            const offsetPixels = offcanvasWidth / 2;

            console.log("Sposto mappa di", offsetPixels, "pixel a sinistra");
            activeMap.panBy([-offsetPixels, 0], {
              animate: true,
              duration: 0.3,
            });
          }, 200);
        }, 350);
      }
    } else {
      console.log("Punto fuori Torino, mostro modal");
      setShowInvalidModal(true);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setClickedPosition(null);
    // Riapri la sidebar se era aperta prima
    if (wasSidebarOpen) {
      setTimeout(() => {
        setShowReportsSidebar(true);
      }, 300); // Attendi che l'offcanvas si chiuda
    }
  };

  const handleReportSubmit = (isSuccess, message) => {
    handleFormClose();
    setTimeout(() => {
      setReportModalIsSuccess(isSuccess);
      setReportModalMessage(message);
      setShowReportModal(true);
    }, 300);
  };

  const handleReportCardClick = async (report) => {
    // Carica l'indirizzo se non presente
    let address = report.address;
    if (!address) {
      try {
        address = await getAddressFromCoordinates(
          report.location.latitude,
          report.location.longitude
        );
      } catch (error) {
        address = `Lat ${report.location.latitude.toFixed(
          4
        )}, Long ${report.location.longitude.toFixed(4)}`;
      }
    }

    // Apri il popup del pin (assicurati di avere reportId)
    setSelectedPin({ ...report, address, reportId: report.id });

    // Centra la mappa sul report selezionato
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.setView(
          [report.location.latitude, report.location.longitude],
          17,
          { animate: true }
        );
      }, 300);
    }
  };

  const toggleReportsSidebar = () => {
    setShowReportsSidebar(!showReportsSidebar);
  };

  const turinStyle = {
    color: "#EE6C4D",
    weight: 5,
    opacity: 0.8,
    fillOpacity: 0,
  };
  const inverseMaskStyle = {
    color: "transparent",
    weight: 0,
    fillColor: "#EE6C4D",
    fillOpacity: 0.25,
  };

  return (
    <>
      <div className="map-page-wrapper">
        <MapContainer
          center={initialPosition}
          zoom={13}
          className="fullpage-leaflet-container"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <SearchBar
            onLocationSelected={(latlng, map) => handleMapClick(latlng, map)}
          />

          {/* Click handler ottiene la mappa dall'interno del contesto */}
          <MapClickHandler
            onMapClick={(latlng, map) => handleMapClick(latlng, map)}
          />

          {/* QUI È LA FIX: Passiamo le funzioni e mapRef come props */}
          <MapUpdater setBounds={setBounds} setZoom={setZoom} mapRef={mapRef} />

          {/* Render Clusters */}
          {clusters.map((cluster) => {
            const [longitude, latitude] = cluster.geometry.coordinates;
            const { cluster: isCluster, point_count: pointCount } =
              cluster.properties;

            if (isCluster) {
              return (
                <Marker
                  key={`cluster-${cluster.id}`}
                  position={[latitude, longitude]}
                  icon={createClusterIcon(
                    pointCount,
                    30 + (pointCount / points.length) * 20
                  )}
                  eventHandlers={{
                    click: () => {
                      const expansionZoom = Math.min(
                        supercluster.getClusterExpansionZoom(cluster.id),
                        20
                      );
                      mapRef.current.setView(
                        [latitude, longitude],
                        expansionZoom,
                        {
                          animate: true,
                        }
                      );
                    },
                  }}
                />
              );
            }

            return (
              <Marker
                key={`report-${cluster.properties.reportId}`}
                position={[latitude, longitude]}
                icon={pinIcon}
                eventHandlers={{
                  click: async (e) => {
                    e.originalEvent.stopPropagation();
                    const report = cluster.properties;

                    // Carica l'indirizzo se non presente
                    let address = report.address;
                    if (!address) {
                      try {
                        address = await getAddressFromCoordinates(
                          report.location.latitude,
                          report.location.longitude
                        );
                      } catch (error) {
                        address = `Lat ${report.location.latitude.toFixed(
                          4
                        )}, Long ${report.location.longitude.toFixed(4)}`;
                      }
                    }

                    // Centra la mappa sul pin cliccato
                    if (mapRef.current) {
                      try {
                        mapRef.current.setView(
                          [report.location.latitude, report.location.longitude],
                          17,
                          { animate: true }
                        );
                      } catch (err) {
                        console.warn("Impossibile centrare la mappa:", err);
                      }
                    }

                    setSelectedPin({ ...report, address });
                  },
                }}
              ></Marker>
            );
          })}

          {selectedPin && (
            <Popup
              position={[
                selectedPin.location.latitude,
                selectedPin.location.longitude,
              ]}
              offset={[0, -40]}
              onClose={() => setSelectedPin(null)}
              className="custom-popup"
            >
              <div className="popup-content">
                <button
                  className="popup-close-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setSelectedPin(null);
                  }}
                  title="Close"
                >
                  ×
                </button>
                <div className="popup-address">{selectedPin.title}</div>
                <button
                  className="popup-add-report-btn"
                  onClick={async (e) => {
                    e.stopPropagation();
                    e.preventDefault();

                    // Salva lo stato della sidebar e chiudila
                    if (showReportsSidebar) {
                      setShowReportsSidebar(false);
                    }

                    // Chiamata API per dettagli report
                    try {
                      const details = await API.getReportMapDetails(selectedPin.reportId);
                      setSelectedReportForDetails(details);
                      setShowReportDetails(true);
                    } catch (error) {
                      // Puoi gestire errori qui, ad esempio mostrare un messaggio
                      setSelectedReportForDetails(selectedPin); // fallback
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
          {inverseMask && (
            <GeoJSON data={inverseMask} style={inverseMaskStyle} />
          )}
          {turinFeature && <GeoJSON data={turinFeature} style={turinStyle} />}
          <GetBoundsLogger onReportsFetched={setReports} />
        </MapContainer>

        {/* Bottone flottante per aprire la sidebar su MOBILE */}
        {isMobile && !showReportsSidebar && (
          <button
            className="reports-fab"
            onClick={toggleReportsSidebar}
            aria-label="Open reports"
          >
            Reports ({reports.length})
          </button>
        )}

        {/* Sidebar Report a Destra - SOLO DESKTOP */}
        {!isMobile && (
          <div
            className={`reports-sidebar ${
              showReportsSidebar ? "open" : "closed"
            }`}
          >
            <div className="reports-sidebar-content">
              <div className="reports-sidebar-header-wrapper">
                <h5 className="reports-sidebar-title">
                  Reports ({reports.length})
                </h5>
                <button
                  className="reports-sidebar-toggle"
                  onClick={toggleReportsSidebar}
                  title="Close sidebar"
                  aria-label="Close sidebar"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className="reports-list">
                {reports.length === 0 ? (
                  <p className="text-muted text-center mt-4">
                    No reports available
                  </p>
                ) : (
                  reports.map((report) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      onClick={handleReportCardClick}
                      showUser={true}
                      showPRO={false}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab laterale per riaprire la sidebar quando è chiusa - SOLO DESKTOP */}
        {!isMobile && !showReportsSidebar && (
          <div className="reports-sidebar-tab" onClick={toggleReportsSidebar}>
            <ChevronLeft size={20} className="reports-sidebar-tab-icon" />
            <span className="reports-sidebar-tab-text">Reports</span>
            <span className="reports-sidebar-tab-count">{reports.length}</span>
          </div>
        )}

        {/* Sidebar Report su MOBILE */}
        {isMobile && showReportsSidebar && (
          <div className="reports-sidebar mobile open">
            <div className="reports-sidebar-content">
              <div className="reports-sidebar-header-wrapper">
                <h5 className="reports-sidebar-title">
                  Reports ({reports.length})
                </h5>
                <button
                  className="reports-sidebar-toggle"
                  onClick={toggleReportsSidebar}
                  title="Close sidebar"
                  aria-label="Close sidebar"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className="reports-list">
                {reports.length === 0 ? (
                  <p className="text-muted text-center mt-4">
                    No reports available
                  </p>
                ) : (
                  reports.map((report) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      onClick={handleReportCardClick}
                      showUser={true}
                      showPRO={false}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Offcanvas per il modulo di report */}
        <Offcanvas
          show={showForm}
          onHide={handleFormClose}
          placement="start"
          className="report-offcanvas"
        >
          <Offcanvas.Header closeButton className="report-offcanvas__header">
            <Offcanvas.Title className="report-offcanvas__title">
              Create New Report
            </Offcanvas.Title>
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

        <InvalidLocationModal
          showInvalidModal={showInvalidModal}
          setShowInvalidModal={setShowInvalidModal}
        />

        <ReportStatusModal
          show={showReportModal}
          onClose={() => setShowReportModal(false)}
          isSuccess={reportModalIsSuccess}
          message={reportModalMessage}
        />

        <ReportMapDescription
          show={showReportDetails}
          onHide={() => {
            setShowReportDetails(false);
            // Riapertura automatica della sidebar
            // if (wasSidebarOpen) {
            //   setTimeout(() => {
            //     setShowReportsSidebar(true);
            //   }, 300);
            // }
          }}
          report={selectedReportForDetails}
        />
      </div>
    </>
  );
}

export default MapPage;
