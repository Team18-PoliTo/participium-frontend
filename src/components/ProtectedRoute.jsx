import { Navigate } from "react-router";
import { useContext } from "react";
import { UserContext } from "../App";

function ProtectedRoute({ children, allowedRoles, requireCitizen = false }) {
  const { user, citizenLoggedIn, userLoggedIn, userRole } = useContext(UserContext);

  // Se richiede citizen e l'utente è un citizen
  if (requireCitizen && citizenLoggedIn) {
    return children;
  }

  // Se richiede un ruolo specifico e l'utente ha quel ruolo
  if (allowedRoles && userLoggedIn && allowedRoles.includes(userRole)) {
    return children;
  }

  // Se non è loggato, redirect al login
  if (!user) {
    return <Navigate replace to="/login" />;
  }

  // Se è loggato ma non autorizzato, mostra NotAuthorized
  return <Navigate replace to="/not-authorized" />;
}

export default ProtectedRoute;