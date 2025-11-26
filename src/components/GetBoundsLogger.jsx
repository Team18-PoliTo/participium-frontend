import { useMap } from "react-leaflet";
import { useEffect } from "react";
import API from "../API/API";

function GetBoundsLogger({ onReportsFetched }) {
  const map = useMap();

  useEffect(() => {
    async function handleMoveEnd() {
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
        if (onReportsFetched) onReportsFetched(reports);
      } catch (error) {
        console.error("Errore nel fetch dei report:", error);
      }
    }

    map.on("moveend", handleMoveEnd);

    handleMoveEnd();

    return () => {
      map.off("moveend", handleMoveEnd);
    };
  }, [map, onReportsFetched]);

  return null;
}

export default GetBoundsLogger;