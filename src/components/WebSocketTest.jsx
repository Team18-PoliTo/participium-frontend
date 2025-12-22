import React, { useState, useEffect } from "react";
import { useWebSocket, socketService } from "../ws";
import "./styles/WebSocketTest.css";

/**
 * WebSocket Test Component
 *
 * Questo componente ti permette di testare la connessione WebSocket.
 *
 * Per usarlo:
 * 1. Importalo in App.jsx o in una route
 * 2. Devi essere loggato come utente interno (employee)
 * 3. Inserisci un reportId valido
 * 4. Osserva gli eventi in tempo reale
 *
 * Esempio in App.jsx:
 * import WebSocketTest from './components/WebSocketTest';
 * <Route path="/ws-test" element={<WebSocketTest />} />
 */
function WebSocketTest() {
  const [token, setToken] = useState("");
  const [reportId, setReportId] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [events, setEvents] = useState([]);
  const [manualToken, setManualToken] = useState("");

  // Carica il token da localStorage al mount
  useEffect(() => {
    try {
      const storedToken = JSON.parse(localStorage.getItem("authToken"));
      if (storedToken) {
        setToken(storedToken);
        setManualToken(storedToken);
      }
    } catch (error) {
      console.error("Error loading token:", error);
    }
  }, []);

  const addEvent = (type, data) => {
    const event = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      type,
      data,
    };
    setEvents((prev) => [event, ...prev].slice(0, 50)); // Keep last 50 events
  };

  const {
    isConnected,
    currentReportId,
    connect,
    disconnect,
    joinReport,
    leaveReport,
  } = useWebSocket({
    token: null, // Non auto-connettiamo
    reportId: null, // Non auto-join
    onCommentCreated: (comment) => {
      addEvent("COMMENT_CREATED", comment);
    },
    onConnect: (data) => {
      addEvent("CONNECTED", data);
      setIsActive(true);
    },
    onDisconnect: (data) => {
      addEvent("DISCONNECTED", data);
      setIsActive(false);
    },
    onError: (error) => {
      addEvent("ERROR", { message: error });
    },
    autoConnect: false,
  });

  const handleConnect = () => {
    if (!token) {
      alert("Token mancante! Fai login come utente interno.");
      return;
    }
    // Connetti direttamente con il servizio
    socketService.connect(token);
  };

  const handleDisconnect = () => {
    socketService.disconnect();
    addEvent("MANUAL_DISCONNECT", { message: "Disconnesso manualmente" });
  };

  const handleJoinReport = () => {
    if (!reportId || isNaN(Number(reportId))) {
      alert("Inserisci un reportId valido (numero)");
      return;
    }
    joinReport(Number(reportId));
    addEvent("JOIN_REPORT", { reportId: Number(reportId) });
  };

  const handleLeaveReport = () => {
    if (!currentReportId) {
      alert("Non sei in nessun report room");
      return;
    }
    leaveReport(currentReportId);
    addEvent("LEAVE_REPORT", { reportId: currentReportId });
  };

  const handleUpdateToken = () => {
    setToken(manualToken);
    addEvent("TOKEN_UPDATED", { message: "Token aggiornato" });
  };

  const clearEvents = () => {
    setEvents([]);
  };

  const getEventTypeStyle = (type) => {
    const styles = {
      CONNECTED: "event-success",
      DISCONNECTED: "event-warning",
      ERROR: "event-error",
      COMMENT_CREATED: "event-info",
      JOIN_REPORT: "event-primary",
      LEAVE_REPORT: "event-secondary",
      MANUAL_DISCONNECT: "event-warning",
      TOKEN_UPDATED: "event-info",
    };
    return styles[type] || "event-default";
  };

  return (
    <div className="websocket-test-container">
      <div className="test-header">
        <h1>🔌 WebSocket Test Panel</h1>
        <div className="status-badge">
          Status:{" "}
          <span
            className={isConnected ? "status-connected" : "status-disconnected"}
          >
            {isConnected ? "🟢 CONNECTED" : "🔴 DISCONNECTED"}
          </span>
        </div>
      </div>

      <div className="test-sections">
        {/* Connection Section */}
        <div className="test-section">
          <h2>🔐 Autenticazione</h2>
          <div className="form-group">
            <label>
              Token JWT:
              <small> (automaticamente da localStorage)</small>
            </label>
            <textarea
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="Inserisci il token manualmente (oppure fai login)"
              rows={3}
              disabled={isActive}
            />
            {!isActive && (
              <button onClick={handleUpdateToken} className="btn-secondary">
                Aggiorna Token
              </button>
            )}
          </div>
          <div className="button-group">
            {!isConnected ? (
              <button
                onClick={handleConnect}
                className="btn-primary"
                disabled={!token}
              >
                🚀 Connetti
              </button>
            ) : (
              <button onClick={handleDisconnect} className="btn-danger">
                ⛔ Disconnetti
              </button>
            )}
          </div>
        </div>

        {/* Report Room Section */}
        <div className="test-section">
          <h2>🏠 Report Room</h2>
          <div className="form-group">
            <label>Report ID:</label>
            <input
              type="number"
              value={reportId}
              onChange={(e) => setReportId(e.target.value)}
              placeholder="es. 123"
              disabled={!isConnected}
            />
          </div>
          <div className="info-row">
            <strong>Current Room:</strong>{" "}
            {currentReportId ? `report:${currentReportId}` : "Nessuno"}
          </div>
          <div className="button-group">
            <button
              onClick={handleJoinReport}
              className="btn-primary"
              disabled={!isConnected || !reportId}
            >
              ➕ Join Report
            </button>
            <button
              onClick={handleLeaveReport}
              className="btn-secondary"
              disabled={!isConnected || !currentReportId}
            >
              ➖ Leave Report
            </button>
          </div>
        </div>

        {/* Events Log Section */}
        <div className="test-section events-section">
          <div className="events-header">
            <h2>📋 Event Log</h2>
            <button onClick={clearEvents} className="btn-small">
              🗑️ Clear
            </button>
          </div>
          <div className="events-list">
            {events.length === 0 ? (
              <div className="no-events">Nessun evento registrato</div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className={`event-item ${getEventTypeStyle(event.type)}`}
                >
                  <div className="event-header">
                    <span className="event-type">{event.type}</span>
                    <span className="event-time">
                      {new Date(event.timestamp).toLocaleTimeString("it-IT")}
                    </span>
                  </div>
                  <pre className="event-data">
                    {JSON.stringify(event.data, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="test-instructions">
        <h3>📖 Istruzioni per il Test</h3>
        <ol>
          <li>
            <strong>Login:</strong> Fai login come utente interno (employee). Il
            token verrà caricato automaticamente.
          </li>
          <li>
            <strong>Connetti:</strong> Clicca "Connetti" per stabilire la
            connessione WebSocket.
          </li>
          <li>
            <strong>Join Report:</strong> Inserisci un reportId valido e clicca
            "Join Report" per entrare nella room.
          </li>
          <li>
            <strong>Test:</strong> Dal backend, crea un commento per quel
            report. Dovresti vedere l'evento COMMENT_CREATED apparire nel log.
          </li>
          <li>
            <strong>Verifica:</strong> Controlla anche la console del browser
            per i log dettagliati [WebSocket].
          </li>
        </ol>

        <h4>🧪 Test con curl (da terminale):</h4>
        <pre className="code-block">
          {`# Esempio: creare un commento (sostituisci con endpoint reale)
curl -X POST http://localhost:3001/api/reports/{reportId}/comments \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"comment": "Test comment"}'`}
        </pre>

        <h4>⚠️ Troubleshooting:</h4>
        <ul>
          <li>
            <strong>401 Unauthorized:</strong> Token non valido o utente non
            interno
          </li>
          <li>
            <strong>Nessun evento:</strong> Verifica di essere nella room
            corretta (reportId giusto)
          </li>
          <li>
            <strong>Connection error:</strong> Verifica che il backend sia in
            esecuzione e che il WebSocket sia inizializzato
          </li>
        </ul>
      </div>
    </div>
  );
}

export default WebSocketTest;
