import { useState, useEffect, useRef } from "react";
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

// --- MOCK DATA ---
const mockReports = [
  // --- CLUSTER CENTRO (Piazza Castello / Via Roma) ---
  {
    id: 101,
    title: "Lampione rotto",
    description: "Il lampione non si accende la sera.",
    category: { id: 4, name: "Public Lighting" },
    location: { latitude: 45.071, longitude: 7.686 },
    createdAt: "2023-11-01T10:00:00Z",
    status: "Pending",
    citizen: { firstName: "Mario", lastName: "Rossi" },
  },
  {
    id: 102,
    title: "Panchina danneggiata",
    description: "Asse di legno rotto sulla panchina.",
    category: { id: 7, name: "Roads and Urban Furnishings" },
    location: { latitude: 45.0712, longitude: 7.6862 },
    createdAt: "2023-11-02T11:30:00Z",
    status: "Pending",
    citizen: { firstName: "Luigi", lastName: "Verdi" },
  },
  {
    id: 103,
    title: "Rifiuti abbandonati",
    description: "Sacchi della spazzatura fuori dai cestini.",
    category: { id: 5, name: "Waste" },
    location: { latitude: 45.0708, longitude: 7.6858 },
    createdAt: "2023-11-03T09:15:00Z",
    status: "Pending",
    citizen: { firstName: "Anna", lastName: "Bianchi" },
  },
  {
    id: 104,
    title: "Pavimentazione sconnessa",
    description: "Sanpietrini saltati in via Roma.",
    category: { id: 7, name: "Roads and Urban Furnishings" },
    location: { latitude: 45.0705, longitude: 7.6855 },
    createdAt: "2023-11-04T14:00:00Z",
    status: "Pending",
    citizen: { firstName: "Giulia", lastName: "Neri" },
  },
  {
    id: 105,
    title: "Graffiti su monumento",
    description: "Imbrattamento alla base della statua.",
    category: { id: 9, name: "Other" },
    location: { latitude: 45.0715, longitude: 7.6865 },
    createdAt: "2023-11-05T16:20:00Z",
    status: "Pending",
    citizen: { firstName: "Marco", lastName: "Ferrari" },
  },
  {
    id: 106,
    title: "Cartello caduto",
    description: "Segnale di divieto a terra.",
    category: { id: 6, name: "Road Signs and Traffic Lights" },
    location: { latitude: 45.0702, longitude: 7.6868 },
    createdAt: "2023-11-06T09:45:00Z",
    status: "Pending",
    citizen: { firstName: "Paolo", lastName: "Romano" },
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
    citizen: { firstName: "Elena", lastName: "Costa" },
  },
  {
    id: 202,
    title: "Segnale stradale storto",
    description: "Il cartello di stop è stato urtato.",
    category: { id: 6, name: "Road Signs and Traffic Lights" },
    location: { latitude: 45.0625, longitude: 7.679 },
    createdAt: "2023-11-06T16:45:00Z",
    status: "Pending",
    citizen: { firstName: "Davide", lastName: "Greco" },
  },
  {
    id: 203,
    title: "Vetro rotto a terra",
    description: "Bottiglie rotte sul marciapiede.",
    category: { id: 5, name: "Waste" },
    location: { latitude: 45.0615, longitude: 7.6795 },
    createdAt: "2023-11-07T08:30:00Z",
    status: "Pending",
    citizen: { firstName: "Francesca", lastName: "Bruno" },
  },
  {
    id: 204,
    title: "Schiamazzi notturni",
    description: "Disturbo della quiete pubblica.",
    category: { id: 9, name: "Other" },
    location: { latitude: 45.0605, longitude: 7.678 },
    createdAt: "2023-11-08T23:15:00Z",
    status: "Pending",
    citizen: { firstName: "Alessandro", lastName: "Gallo" },
  },
  {
    id: 205,
    title: "Tombino intasato",
    description: "L'acqua non defluisce.",
    category: { id: 3, name: "Sewer System" },
    location: { latitude: 45.063, longitude: 7.68 },
    createdAt: "2023-11-09T10:10:00Z",
    status: "Pending",
    citizen: { firstName: "Sara", lastName: "Conti" },
  },

  // --- CLUSTER POLITECNICO / CROCETTA ---
  {
    id: 301,
    title: "Perdita d'acqua",
    description: "Tubo rotto che perde acqua sul marciapiede.",
    category: { id: 1, name: "Water Supply – Drinking Water" },
    location: { latitude: 45.062, longitude: 7.66 },
    createdAt: "2023-11-10T08:00:00Z",
    status: "Pending",
    citizen: { firstName: "Roberto", lastName: "Esposito" },
  },
  {
    id: 302,
    title: "Rastrelliera bici piena",
    description: "Servono più posti per le bici.",
    category: { id: 7, name: "Roads and Urban Furnishings" },
    location: { latitude: 45.0625, longitude: 7.661 },
    createdAt: "2023-11-11T09:20:00Z",
    status: "Pending",
    citizen: { firstName: "Chiara", lastName: "Rizzo" },
  },
  {
    id: 303,
    title: "Semaforo pedonale guasto",
    description: "Non diventa mai verde.",
    category: { id: 6, name: "Road Signs and Traffic Lights" },
    location: { latitude: 45.0618, longitude: 7.6595 },
    createdAt: "2023-11-12T12:45:00Z",
    status: "Pending",
    citizen: { firstName: "Michele", lastName: "De Luca" },
  },
  {
    id: 304,
    title: "Gradino rotto ingresso",
    description: "Pericoloso per gli studenti.",
    category: { id: 2, name: "Architectural Barriers" },
    location: { latitude: 45.063, longitude: 7.6605 },
    createdAt: "2023-11-13T15:30:00Z",
    status: "Pending",
    citizen: { firstName: "Laura", lastName: "Mancini" },
  },

  // --- CLUSTER PARCO DEL VALENTINO ---
  {
    id: 401,
    title: "Albero pericolante",
    description: "Grosso ramo spezzato dopo il temporale.",
    category: { id: 8, name: "Public Green Areas and Playgrounds" },
    location: { latitude: 45.055, longitude: 7.685 },
    createdAt: "2023-11-14T11:00:00Z",
    status: "Pending",
    citizen: { firstName: "Antonio", lastName: "Ricci" },
  },
  {
    id: 402,
    title: "Giochi bimbi rotti",
    description: "Altalena mancante.",
    category: { id: 8, name: "Public Green Areas and Playgrounds" },
    location: { latitude: 45.056, longitude: 7.686 },
    createdAt: "2023-11-15T16:00:00Z",
    status: "Pending",
    citizen: { firstName: "Silvia", lastName: "Marino" },
  },
  {
    id: 403,
    title: "Fontanella guasta",
    description: "Non esce acqua.",
    category: { id: 1, name: "Water Supply – Drinking Water" },
    location: { latitude: 45.054, longitude: 7.684 },
    createdAt: "2023-11-16T10:30:00Z",
    status: "Pending",
    citizen: { firstName: "Giorgio", lastName: "Barbieri" },
  },
  {
    id: 404,
    title: "Cestini stracolmi",
    description: "Rifiuti ovunque nel prato.",
    category: { id: 5, name: "Waste" },
    location: { latitude: 45.0555, longitude: 7.6855 },
    createdAt: "2023-11-17T18:20:00Z",
    status: "Pending",
    citizen: { firstName: "Lucia", lastName: "Moretti" },
  },

  // --- CLUSTER LINGOTTO / MILLEFONTI ---
  {
    id: 501,
    title: "Marciapiede dissestato",
    description: "Radici degli alberi hanno alzato l'asfalto.",
    category: { id: 2, name: "Architectural Barriers" },
    location: { latitude: 45.03, longitude: 7.665 },
    createdAt: "2023-11-18T09:00:00Z",
    status: "Pending",
    citizen: { firstName: "Federico", lastName: "Lombardi" },
  },
  {
    id: 502,
    title: "Luci sottopasso spente",
    description: "Buio totale nel sottopassaggio.",
    category: { id: 4, name: "Public Lighting" },
    location: { latitude: 45.031, longitude: 7.666 },
    createdAt: "2023-11-19T20:00:00Z",
    status: "Pending",
    citizen: { firstName: "Valentina", lastName: "Giordano" },
  },
  {
    id: 503,
    title: "Parcheggio selvaggio",
    description: "Auto sulle strisce pedonali.",
    category: { id: 6, name: "Road Signs and Traffic Lights" },
    location: { latitude: 45.029, longitude: 7.664 },
    createdAt: "2023-11-20T13:15:00Z",
    status: "Pending",
    citizen: { firstName: "Matteo", lastName: "Russo" },
  },

  // --- CLUSTER BARRIERA DI MILANO / NORD ---
  {
    id: 601,
    title: "Discarica abusiva",
    description: "Mobili abbandonati all'angolo.",
    category: { id: 5, name: "Waste" },
    location: { latitude: 45.09, longitude: 7.69 },
    createdAt: "2023-11-21T07:45:00Z",
    status: "Pending",
    citizen: { firstName: "Stefano", lastName: "Colombo" },
  },
  {
    id: 602,
    title: "Buca profonda",
    description: "Rischio per motociclisti.",
    category: { id: 7, name: "Roads and Urban Furnishings" },
    location: { latitude: 45.091, longitude: 7.691 },
    createdAt: "2023-11-22T15:50:00Z",
    status: "Pending",
    citizen: { firstName: "Simona", lastName: "Santoro" },
  },
  {
    id: 603,
    title: "Segnaletica sbiadita",
    description: "Strisce pedonali non visibili.",
    category: { id: 6, name: "Road Signs and Traffic Lights" },
    location: { latitude: 45.089, longitude: 7.689 },
    createdAt: "2023-11-23T11:10:00Z",
    status: "Pending",
    citizen: { firstName: "Giovanni", lastName: "Amato" },
  },

  // --- PUNTI SPARSI (Singoli) ---
  {
    id: 701,
    title: "Lampione Piazza Vittorio",
    description: "Lampada intermittente.",
    category: { id: 4, name: "Public Lighting" },
    location: { latitude: 45.065, longitude: 7.693 },
    createdAt: "2023-11-24T19:30:00Z",
    status: "Pending",
    citizen: { firstName: "Alice", lastName: "Pellegrini" },
  },
  {
    id: 702,
    title: "Panchina rotta lungo Po",
    description: "Schienale mancante.",
    category: { id: 7, name: "Roads and Urban Furnishings" },
    location: { latitude: 45.06, longitude: 7.7 },
    createdAt: "2023-11-25T14:45:00Z",
    status: "Pending",
    citizen: { firstName: "Daniele", lastName: "Ruggiero" },
  },
  {
    id: 703,
    title: "Mancanza acqua fontana",
    description: "Piazza Statuto.",
    category: { id: 1, name: "Water Supply – Drinking Water" },
    location: { latitude: 45.076, longitude: 7.67 },
    createdAt: "2023-11-26T10:20:00Z",
    status: "Pending",
    citizen: { firstName: "Martina", lastName: "Gatti" },
  },
  {
    id: 704,
    title: "Rami pericolanti",
    description: "Giardini Reali.",
    category: { id: 8, name: "Public Green Areas and Playgrounds" },
    location: { latitude: 45.073, longitude: 7.688 },
    createdAt: "2023-11-27T16:10:00Z",
    status: "Pending",
    citizen: { firstName: "Fabio", lastName: "Monti" },
  },
  {
    id: 705,
    title: "Tombino rumoroso",
    description: "Ogni volta che passa un'auto fa rumore.",
    category: { id: 7, name: "Roads and Urban Furnishings" },
    location: { latitude: 45.05, longitude: 7.65 }, // Zona San Paolo
    createdAt: "2023-11-28T08:55:00Z",
    status: "Pending",
    citizen: { firstName: "Cristina", lastName: "Villa" },
  },
  {
    id: 706,
    title: "Graffiti su muro scuola",
    description: "Scritte offensive.",
    category: { id: 9, name: "Other" },
    location: { latitude: 45.04, longitude: 7.66 }, // Zona Santa Rita
    createdAt: "2023-11-29T12:30:00Z",
    status: "Pending",
    citizen: { firstName: "Enrico", lastName: "Palmieri" },
  },
  {
    id: 707,
    title: "Semaforo spento",
    description: "Incrocio pericoloso.",
    category: { id: 6, name: "Road Signs and Traffic Lights" },
    location: { latitude: 45.08, longitude: 7.64 }, // Zona Parella
    createdAt: "2023-11-30T17:40:00Z",
    status: "Pending",
    citizen: { firstName: "Monica", lastName: "Bernardi" },
  },
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
  // Stati
  const [showForm, setShowForm] = useState(false);
  const [clickedPosition, setClickedPosition] = useState(null);
  const [showInvalidModal, setShowInvalidModal] = useState(false);
  const [reports, setReports] = useState([]);
  const [bounds, setBounds] = useState(null);
  const [zoom, setZoom] = useState(13);

  // Sidebar destra per i report
  const [showReportsSidebar, setShowReportsSidebar] = useState(true);
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
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();

                    // Salva lo stato della sidebar e chiudila
                    if (showReportsSidebar) {
                      setShowReportsSidebar(false);
                    }

                    setSelectedReportForDetails(selectedPin);
                    setShowReportDetails(true);
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
        </MapContainer>

        {/* Sidebar Report a Destra */}
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
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Tab laterale per riaprire la sidebar quando è chiusa */}
        {!showReportsSidebar && (
          <div className="reports-sidebar-tab" onClick={toggleReportsSidebar}>
            <ChevronLeft size={20} className="reports-sidebar-tab-icon" />
            <span className="reports-sidebar-tab-text">Reports</span>
            <span className="reports-sidebar-tab-count">{reports.length}</span>
          </div>
        )}
      </div>

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
          // Riapri la sidebar se era aperta prima
          if (wasSidebarOpen) {
            setTimeout(() => {
              setShowReportsSidebar(true);
            }, 300);
          }
        }}
        report={selectedReportForDetails}
      />
    </>
  );
}

export default MapPage;
