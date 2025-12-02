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

// --- GESTIONE COLORI ---
export const getStatusColor = (status) => {
  switch (status) {
    case "Resolved": return "#4CAF50"; // Verde
    case "Rejected": return "#D90429"; // Rosso rubino
    case "In Progress": return "#3D5A80"; // Blu scuro
    case "Suspended": return "#FFC107"; // Giallo ambra
    case "Assigned": return "#98C1D9"; // Azzurro
    default: return "#EE6C4D"; // Arancione (Pending/Default)
  }
};

// --- CREAZIONE ICONE ---
export const createPinIcon = (status) => {
  const color = getStatusColor(status);
  
  return L.divIcon({
    html: `
      <div class="custom-pin-marker">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="pin-svg">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" 
                fill="${color}" stroke="#fff" stroke-width="1.5"/>
          <circle cx="12" cy="9" r="2.5" fill="#fff"/>
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
    html: `<div class="custom-cluster-icon-marker">
             <span>${cluster.getChildCount()}</span>
           </div>`,
    className: 'custom-cluster-icon',
    iconSize: L.point(35, 35, true),
  });
};