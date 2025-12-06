import { useMap } from "react-leaflet";
import { useEffect, useRef } from "react";
import API from "../API/API";

function GetBoundsLogger({ onReportsFetched }) {
  const map = useMap();
  // Usiamo useRef per mantenere il riferimento al timer tra i vari render
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    // Funzione che esegue effettivamente la chiamata API
    const fetchReports = async () => {
      const bounds = map.getBounds();
      const corners = [
        {
          latitude: bounds.getSouthWest().lat,
          longitude: bounds.getSouthWest().lng,
        },
        {
          latitude: bounds.getNorthEast().lat,
          longitude: bounds.getNorthEast().lng,
        },
      ];

      try {
        const reports = await API.getReportsByMapArea(corners);
        if (onReportsFetched) {
          onReportsFetched(reports);
        }
      } catch (error) {
        console.error("Errore nel fetch dei report:", error);
      }
    };

    // Handler per l'evento di movimento
    const handleMoveEnd = () => {
      // Se c'è un timer attivo (l'utente si è appena mosso), cancellalo
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Imposta un nuovo timer: esegui fetchReports solo dopo 600ms di inattività
      debounceTimerRef.current = setTimeout(() => {
        fetchReports();
      }, 600); 
    };

    // Caricamento iniziale (senza ritardo)
    fetchReports();

    // Aggiungi listener
    map.on("moveend", handleMoveEnd);
    
    // Aggiungi anche zoomend per sicurezza, anche se spesso moveend copre entrambi
    map.on("zoomend", handleMoveEnd);

    // Cleanup quando il componente viene smontato
    return () => {
      map.off("moveend", handleMoveEnd);
      map.off("zoomend", handleMoveEnd);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [map, onReportsFetched]);

  return null;
}

export default GetBoundsLogger;