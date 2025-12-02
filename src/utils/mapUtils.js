import L from "leaflet";

// --- STILI GEOJSON ---
export const turinStyle = { 
  color: "#EE6C4D", 
  weight: 4, 
  opacity: 0.6, 
  fillOpacity: 0 
};

export const inverseMaskStyle = { 
  color: "transparent", 
  weight: 0, 
  fillColor: "#3D5A80", 
  fillOpacity: 0.15 
};

// --- GESTIONE COLORI (PALETTE UNIFICATA) ---
// Questi colori corrispondono esattamente ai bordi/testo dei badge nelle card
export const getStatusColor = (status) => {
  switch (status) {
    case "Resolved": return "#10B981"; // Verde Smeraldo (Successo)
    case "Rejected": return "#EF4444"; // Rosso (Errore/Rifiuto)
    case "In Progress": return "#F59E0B"; // Ambra/Giallo (Attenzione/Lavori)
    case "Suspended": return "#F97316"; // Arancione (Pausa)
    case "Assigned": return "#3B82F6"; // Blu (Azione)
    case "Pending Approval": return "#64748B"; // Grigio/Slate (In attesa)
    default: return "#3D5A80"; // Blu Brand (Fallback)
  }
};

// --- CREAZIONE ICONE ---
export const createPinIcon = (status) => {
  const color = getStatusColor(status);
  
  return L.divIcon({
    html: `
      <div class="custom-pin-marker">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="pin-svg" style="filter: drop-shadow(0 2px 3px rgba(0,0,0,0.3));">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" 
                fill="${color}" stroke="#ffffff" stroke-width="1.5"/>
          <circle cx="12" cy="9" r="2.5" fill="#ffffff"/>
        </svg>
      </div>`,
    className: "custom-pin-icon",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

export const createClusterCustomIcon = function (cluster) {
  return L.divIcon({
    html: `<div class="custom-cluster-icon-marker" style="
      width: 36px;
      height: 36px;
      background: #3D5A80;
      color: white;
      border: 3px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 13px;
      box-shadow: 0 3px 6px rgba(0,0,0,0.3);
    ">
      <span>${cluster.getChildCount()}</span>
    </div>`,
    className: 'custom-cluster-icon',
    iconSize: L.point(36, 36, true),
  });
};