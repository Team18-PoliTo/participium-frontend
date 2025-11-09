import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, GeoJSON } from 'react-leaflet'; // <-- Importa GeoJSON
import { Offcanvas, Modal, Button } from 'react-bootstrap';
import ReportForm from './ReportForm'; 
import './styles/MapPage.css'; 
import InvalidLocationModal from './InvalidLocationModal';

// --- IMPORT PER CONTROLLO GEOJSON ---
import pointInPolygon from 'point-in-polygon';
import turinGeoJSON from '../data/turin-boundaries.json'; 

// --- NUOVA LOGICA ---
// 1. Trova il "Feature" (l'oggetto completo) di Torino per disegnarlo
let turinFeature = null;
try {
  turinFeature = turinGeoJSON.features.find(
    (feature) => feature.properties.comune === "Torino"
  );
  if (!turinFeature) {
    throw new Error("Impossibile trovare 'Torino' nel file");
  }
} catch (e) {
  console.error("Errore nel trovare il 'feature' di Torino:", e);
  // turinFeature rimarrà null
}

// 2. Estrai i poligoni (le coordinate) per la validazione dei click
let turinPolygons = []; 
try {
  if (turinFeature) { // Riusiamo il feature trovato sopra
    const geometry = turinFeature.geometry;
    
    if (geometry.type === "Polygon") {
      turinPolygons.push(geometry.coordinates[0]);
    } else if (geometry.type === "MultiPolygon") {
      geometry.coordinates.forEach(polygon => {
        turinPolygons.push(polygon[0]); 
      });
    }
  } else {
    throw new Error("Feature di Torino non trovato, impossibile estrarre i poligoni.");
  }
} catch (e) {
  console.error("Errore nell'estrarre i poligoni di Torino:", e);
  turinPolygons = null; 
}
// --- FINE LOGICA POLIGONO ---


// Componente interno per gestire i click sulla mappa
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng); 
    },
  });
  return null;
}

function MapPage() {
  const [showForm, setShowForm] = useState(false);
  const [clickedPosition, setClickedPosition] = useState(null); 
  const [showInvalidModal, setShowInvalidModal] = useState(false);
  
  const initialPosition = [45.0703, 7.6869];

  // La logica di handleMapClick e handleFormClose non cambia
  const handleMapClick = (latlng) => {
    if (!turinPolygons) { 
      console.warn("Confini di Torino non caricati, controllo saltato.");
      setClickedPosition(latlng);
      setShowForm(true);
      return;
    }

    const { lat, lng } = latlng;
    const clickedPoint = [lng, lat]; 

    const isInside = turinPolygons.some(polygon => 
      pointInPolygon(clickedPoint, polygon)
    );

    if (isInside) {
      setClickedPosition(latlng);
      setShowForm(true);
    } else {
      //alert("Per favore, seleziona una posizione all'interno di Torino.");
      setShowInvalidModal(true);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setClickedPosition(null); 
  };

  // Stile per il poligono
  const turinStyle = {
    color: "#EE6C4D", // Colore del bordo (preso dalla tua navbar)
    weight: 5,         // Spessore del bordo
    opacity: 0.8,      // Opacità del bordo
    fillOpacity: 0.1   // Opacità del riempimento (molto leggero)
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
          <MapClickHandler onMapClick={handleMapClick} />
          
          {clickedPosition && showForm && <Marker position={clickedPosition} />}

          {/* --- ECCO L'AGGIUNTA --- */}
          {/* Disegna il poligono sulla mappa se il feature è stato caricato */}
          {turinFeature && (
            <GeoJSON 
              data={turinFeature} // Passa l'intero oggetto "Feature" di Torino
              style={turinStyle}  // Applica lo stile
            />
          )}
          {/* --- FINE AGGIUNTA --- */}

        </MapContainer>
      </div>

      <Offcanvas show={showForm} onHide={handleFormClose} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Crea Nuova Segnalazione</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <ReportForm 
            position={clickedPosition} 
            onFormSubmit={handleFormClose} 
          />
        </Offcanvas.Body>
      </Offcanvas>
      <InvalidLocationModal 
        showInvalidModal={showInvalidModal} 
        setShowInvalidModal={setShowInvalidModal} 
      />
    </>
  );
}

export default MapPage;