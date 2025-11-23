import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
  GeoJSON,
} from "react-leaflet";
import useSupercluster from "use-supercluster";
import L from "leaflet";
import API from "../API/API";
import { Offcanvas } from "react-bootstrap";
import ReportForm from "./ReportForm";
import "leaflet-geosearch/dist/geosearch.css";
import "./styles/MapPage.css";
import InvalidLocationModal from "./InvalidLocationModal";
import ReportStatusModal from "./ReportStatusModal";
import pointInPolygon from "point-in-polygon";
import turinGeoJSON from "../data/turin-boundaries.json";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import { getAddressFromCoordinates } from "../utils/geocoding";

// --- MOCK DATA ---
const mockReports = [
  // --- CLUSTER CENTRO (Piazza Castello / Via Roma) ---
  {
    id: 101,
    title: "Lampione rotto",
    description: "Il lampione non si accende la sera.",
    category: { id: 4, name: "Public Lighting" },
    location: { latitude: 45.0710, longitude: 7.6860 },
    createdAt: "2023-11-01T10:00:00Z",
    status: "Pending",
  },
  {
    id: 102,
    title: "Panchina danneggiata",
    description: "Asse di legno rotto sulla panchina.",
    category: { id: 7, name: "Roads and Urban Furnishings" },
    location: { latitude: 45.0712, longitude: 7.6862 },
    createdAt: "2023-11-02T11:30:00Z",
    status: "Pending",
  },
  {
    id: 103,
    title: "Rifiuti abbandonati",
    description: "Sacchi della spazzatura fuori dai cestini.",
    category: { id: 5, name: "Waste" },
    location: { latitude: 45.0708, longitude: 7.6858 },
    createdAt: "2023-11-03T09:15:00Z",
    status: "Pending",
  },
  {
    id: 104,
    title: "Pavimentazione sconnessa",
    description: "Sanpietrini saltati in via Roma.",
    category: { id: 7, name: "Roads and Urban Furnishings" },
    location: { latitude: 45.0705, longitude: 7.6855 },
    createdAt: "2023-11-04T14:00:00Z",
    status: "Pending",
  },
  {
    id: 105,
    title: "Graffiti su monumento",
    description: "Imbrattamento alla base della statua.",
    category: { id: 9, name: "Other" },
    location: { latitude: 45.0715, longitude: 7.6865 },
    createdAt: "2023-11-05T16:20:00Z",
    status: "Pending",
  },
  {
    id: 106,
    title: "Cartello caduto",
    description: "Segnale di divieto a terra.",
    category: { id: 6, name: "Road Signs and Traffic Lights" },
    location: { latitude: 45.0702, longitude: 7.6868 },
    createdAt: "2023-11-06T09:45:00Z",
    status: "Pending",
  },

  // --- CLUSTER PORTA NUOVA / SAN SALVARIO ---
  {
    id: 201,
    title: "Buche stradali",
    description: "Asfalto rovinato vicino all'incrocio.",
    category: { id: 7, name: "Roads and Urban Furnishings" },
    location: { latitude: 45.0621, longitude: 7.6785 },
    createdAt: "2023-11-05T14:20:00Z",
    status: "Pending",
  },
  {
    id: 202,
    title: "Segnale stradale storto",
    description: "Il cartello di stop è stato urtato.",
    category: { id: 6, name: "Road Signs and Traffic Lights" },
    location: { latitude: 45.0625, longitude: 7.6790 },
    createdAt: "2023-11-06T16:45:00Z",
    status: "Pending",
  },
  {
    id: 203,
    title: "Vetro rotto a terra",
    description: "Bottiglie rotte sul marciapiede.",
    category: { id: 5, name: "Waste" },
    location: { latitude: 45.0615, longitude: 7.6795 },
    createdAt: "2023-11-07T08:30:00Z",
    status: "Pending",
  },
  {
    id: 204,
    title: "Schiamazzi notturni",
    description: "Disturbo della quiete pubblica.",
    category: { id: 9, name: "Other" },
    location: { latitude: 45.0605, longitude: 7.6780 },
    createdAt: "2023-11-08T23:15:00Z",
    status: "Pending",
  },
  {
    id: 205,
    title: "Tombino intasato",
    description: "L'acqua non defluisce.",
    category: { id: 3, name: "Sewer System" },
    location: { latitude: 45.0630, longitude: 7.6800 },
    createdAt: "2023-11-09T10:10:00Z",
    status: "Pending",
  },

  // --- CLUSTER POLITECNICO / CROCETTA ---
  {
    id: 301,
    title: "Perdita d'acqua",
    description: "Tubo rotto che perde acqua sul marciapiede.",
    category: { id: 1, name: "Water Supply – Drinking Water" },
    location: { latitude: 45.0620, longitude: 7.6600 },
    createdAt: "2023-11-10T08:00:00Z",
    status: "Pending",
  },
  {
    id: 302,
    title: "Rastrelliera bici piena",
    description: "Servono più posti per le bici.",
    category: { id: 7, name: "Roads and Urban Furnishings" },
    location: { latitude: 45.0625, longitude: 7.6610 },
    createdAt: "2023-11-11T09:20:00Z",
    status: "Pending",
  },
  {
    id: 303,
    title: "Semaforo pedonale guasto",
    description: "Non diventa mai verde.",
    category: { id: 6, name: "Road Signs and Traffic Lights" },
    location: { latitude: 45.0618, longitude: 7.6595 },
    createdAt: "2023-11-12T12:45:00Z",
    status: "Pending",
  },
  {
    id: 304,
    title: "Gradino rotto ingresso",
    description: "Pericoloso per gli studenti.",
    category: { id: 2, name: "Architectural Barriers" },
    location: { latitude: 45.0630, longitude: 7.6605 },
    createdAt: "2023-11-13T15:30:00Z",
    status: "Pending",
  },

  // --- CLUSTER PARCO DEL VALENTINO ---
  {
    id: 401,
    title: "Albero pericolante",
    description: "Grosso ramo spezzato dopo il temporale.",
    category: { id: 8, name: "Public Green Areas and Playgrounds" },
    location: { latitude: 45.0550, longitude: 7.6850 },
    createdAt: "2023-11-14T11:00:00Z",
    status: "Pending",
  },
  {
    id: 402,
    title: "Giochi bimbi rotti",
    description: "Altalena mancante.",
    category: { id: 8, name: "Public Green Areas and Playgrounds" },
    location: { latitude: 45.0560, longitude: 7.6860 },
    createdAt: "2023-11-15T16:00:00Z",
    status: "Pending",
  },
  {
    id: 403,
    title: "Fontanella guasta",
    description: "Non esce acqua.",
    category: { id: 1, name: "Water Supply – Drinking Water" },
    location: { latitude: 45.0540, longitude: 7.6840 },
    createdAt: "2023-11-16T10:30:00Z",
    status: "Pending",
  },
  {
    id: 404,
    title: "Cestini stracolmi",
    description: "Rifiuti ovunque nel prato.",
    category: { id: 5, name: "Waste" },
    location: { latitude: 45.0555, longitude: 7.6855 },
    createdAt: "2023-11-17T18:20:00Z",
    status: "Pending",
  },

  // --- CLUSTER LINGOTTO / MILLEFONTI ---
  {
    id: 501,
    title: "Marciapiede dissestato",
    description: "Radici degli alberi hanno alzato l'asfalto.",
    category: { id: 2, name: "Architectural Barriers" },
    location: { latitude: 45.0300, longitude: 7.6650 },
    createdAt: "2023-11-18T09:00:00Z",
    status: "Pending",
  },
  {
    id: 502,
    title: "Luci sottopasso spente",
    description: "Buio totale nel sottopassaggio.",
    category: { id: 4, name: "Public Lighting" },
    location: { latitude: 45.0310, longitude: 7.6660 },
    createdAt: "2023-11-19T20:00:00Z",
    status: "Pending",
  },
  {
    id: 503,
    title: "Parcheggio selvaggio",
    description: "Auto sulle strisce pedonali.",
    category: { id: 6, name: "Road Signs and Traffic Lights" },
    location: { latitude: 45.0290, longitude: 7.6640 },
    createdAt: "2023-11-20T13:15:00Z",
    status: "Pending",
  },

  // --- CLUSTER BARRIERA DI MILANO / NORD ---
  {
    id: 601,
    title: "Discarica abusiva",
    description: "Mobili abbandonati all'angolo.",
    category: { id: 5, name: "Waste" },
    location: { latitude: 45.0900, longitude: 7.6900 },
    createdAt: "2023-11-21T07:45:00Z",
    status: "Pending",
  },
  {
    id: 602,
    title: "Buca profonda",
    description: "Rischio per motociclisti.",
    category: { id: 7, name: "Roads and Urban Furnishings" },
    location: { latitude: 45.0910, longitude: 7.6910 },
    createdAt: "2023-11-22T15:50:00Z",
    status: "Pending",
  },
  {
    id: 603,
    title: "Segnaletica sbiadita",
    description: "Strisce pedonali non visibili.",
    category: { id: 6, name: "Road Signs and Traffic Lights" },
    location: { latitude: 45.0890, longitude: 7.6890 },
    createdAt: "2023-11-23T11:10:00Z",
    status: "Pending",
  },

  // --- PUNTI SPARSI (Singoli) ---
  {
    id: 701,
    title: "Lampione Piazza Vittorio",
    description: "Lampada intermittente.",
    category: { id: 4, name: "Public Lighting" },
    location: { latitude: 45.0650, longitude: 7.6930 },
    createdAt: "2023-11-24T19:30:00Z",
    status: "Pending",
  },
  {
    id: 702,
    title: "Panchina rotta lungo Po",
    description: "Schienale mancante.",
    category: { id: 7, name: "Roads and Urban Furnishings" },
    location: { latitude: 45.0600, longitude: 7.7000 },
    createdAt: "2023-11-25T14:45:00Z",
    status: "Pending",
  },
  {
    id: 703,
    title: "Mancanza acqua fontana",
    description: "Piazza Statuto.",
    category: { id: 1, name: "Water Supply – Drinking Water" },
    location: { latitude: 45.0760, longitude: 7.6700 },
    createdAt: "2023-11-26T10:20:00Z",
    status: "Pending",
  },
  {
    id: 704,
    title: "Rami pericolanti",
    description: "Giardini Reali.",
    category: { id: 8, name: "Public Green Areas and Playgrounds" },
    location: { latitude: 45.0730, longitude: 7.6880 },
    createdAt: "2023-11-27T16:10:00Z",
    status: "Pending",
  },
  {
    id: 705,
    title: "Tombino rumoroso",
    description: "Ogni volta che passa un'auto fa rumore.",
    category: { id: 7, name: "Roads and Urban Furnishings" },
    location: { latitude: 45.0500, longitude: 7.6500 }, // Zona San Paolo
    createdAt: "2023-11-28T08:55:00Z",
    status: "Pending",
  },
  {
    id: 706,
    title: "Graffiti su muro scuola",
    description: "Scritte offensive.",
    category: { id: 9, name: "Other" },
    location: { latitude: 45.0400, longitude: 7.6600 }, // Zona Santa Rita
    createdAt: "2023-11-29T12:30:00Z",
    status: "Pending",
  },
  {
    id: 707,
    title: "Semaforo spento",
    description: "Incrocio pericoloso.",
    category: { id: 6, name: "Road Signs and Traffic Lights" },
    location: { latitude: 45.0800, longitude: 7.6400 }, // Zona Parella
    createdAt: "2023-11-30T17:40:00Z",
    status: "Pending",
  }
];

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
      [90, -180], [90, 180], [-90, 180], [-90, -180], [90, -180],
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
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
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

const pinIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// 4. MapUpdater (SPOSTATO FUORI e con PROPS)
// Riceve setBounds e setZoom come props per evitare il loop
function MapUpdater({ setBounds, setZoom }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

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
  }, [map, setBounds, setZoom]); // Dipendenze corrette

  return null;
}

// --- COMPONENTE PRINCIPALE ---
function MapPage() {
  // Stati
  const [showForm, setShowForm] = useState(false);
  const [clickedPosition, setClickedPosition] = useState(null);
  const [showInvalidModal, setShowInvalidModal] = useState(false);
  const [reports, setReports] = useState([]);
  const [bounds, setBounds] = useState(null);
  const [zoom, setZoom] = useState(13);
  
  // Modali di stato
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportModalIsSuccess, setReportModalIsSuccess] = useState(false);
  const [reportModalMessage, setReportModalMessage] = useState("");

  const mapRef = useRef();
  const initialPosition = [45.0703, 7.6869];

  // Caricamento dati
  useEffect(() => {
    const fetchReports = async () => {
      try {
        console.log("Caricamento dati mock...");
        setReports(mockReports);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };
    fetchReports();
  }, []);

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
    // Usa la mappa passata o quella dal ref se disponibile (per searchbar)
    const activeMap = mapInstance || mapRef.current;

    if (!turinPolygons || turinPolygons.length === 0) {
      console.warn("Turin boundaries not loaded, validation skipped.");
      setClickedPosition(latlng);
      setShowForm(true);
      return;
    }

    const { lat, lng } = latlng;
    const clickedPoint = [lng, lat];
    const isInside = turinPolygons.some((polygon) =>
      pointInPolygon(clickedPoint, polygon)
    );

    if (isInside) {
      try {
        const address = await getAddressFromCoordinates(lat, lng);
        setClickedPosition({ ...latlng, address });
      } catch (error) {
        setClickedPosition({ ...latlng, address: "Unable to retrieve address" });
      }

      setShowForm(true);

      // Centra la mappa tenendo conto dell'offcanvas
      if (activeMap) {
        setTimeout(() => {
          const mapSize = activeMap.getSize();
          const offcanvasWidth = 600;
          const projected = activeMap.project(latlng, 17);
          const visibleWidth = mapSize.x - offcanvasWidth;
          const offsetX = offcanvasWidth + visibleWidth / 2 - mapSize.x / 2;
          const offsetProjected = projected.subtract([offsetX, 0]);
          const targetLatLng = activeMap.unproject(offsetProjected, 17);
          activeMap.setView(targetLatLng, 17, { animate: true });
        }, 300);
      }
    } else {
      setShowInvalidModal(true);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setClickedPosition(null);
  };

  const handleReportSubmit = (isSuccess, message) => {
    handleFormClose();
    setTimeout(() => {
      setReportModalIsSuccess(isSuccess);
      setReportModalMessage(message);
      setShowReportModal(true);
    }, 300);
  };

  const turinStyle = { color: "#EE6C4D", weight: 5, opacity: 0.8, fillOpacity: 0 };
  const inverseMaskStyle = { color: "transparent", weight: 0, fillColor: "#EE6C4D", fillOpacity: 0.25 };

  return (
    <>
      <div className="map-page-wrapper">
        <MapContainer
          center={initialPosition}
          zoom={13}
          className="fullpage-leaflet-container"
          whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <SearchBar onLocationSelected={(latlng, map) => handleMapClick(latlng, map)} />
          
          {/* Passiamo mapRef.current se map non è disponibile nel contesto diretto, ma qui MapClickHandler usa useMapEvents interno */}
          <MapClickHandler onMapClick={(latlng) => handleMapClick(latlng, mapRef.current)} />

          {/* QUI È LA FIX: Passiamo le funzioni come props */}
          <MapUpdater setBounds={setBounds} setZoom={setZoom} />

          {/* Render Clusters */}
          {clusters.map((cluster) => {
            const [longitude, latitude] = cluster.geometry.coordinates;
            const { cluster: isCluster, point_count: pointCount } = cluster.properties;

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
                      mapRef.current.setView([latitude, longitude], expansionZoom, {
                        animate: true,
                      });
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
                  click: (e) => {
                    e.originalEvent.stopPropagation();
                    console.log("Report cliccato:", cluster.properties);
                  },
                }}
              />
            );
          })}

          {clickedPosition && showForm && <Marker position={clickedPosition} />}
          {inverseMask && <GeoJSON data={inverseMask} style={inverseMaskStyle} />}
          {turinFeature && <GeoJSON data={turinFeature} style={turinStyle} />}
        </MapContainer>
      </div>

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
      
      <ReportStatusModal
        show={showReportModal}
        onClose={() => setShowReportModal(false)}
        isSuccess={reportModalIsSuccess}
        message={reportModalMessage}
      />
    </>
  );
}

export default MapPage;