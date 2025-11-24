import { Navigate } from "react-router";
import { useContext } from "react";
import { UserContext } from "../App";
import { allowedOfficerRoles } from "../constants/allowedOfficerRoles";

function RoleBasedRedirect() {
  const { user, citizenLoggedIn, userLoggedIn, userRole } = useContext(UserContext);

  if (citizenLoggedIn) {
    return <Navigate replace to="/" />;
  }

  if (userLoggedIn) {
    switch (userRole) {
      case "ADMIN":
        return <Navigate replace to="/admin" />;
      case "Public Relations Officer":
        return <Navigate replace to="/pro" />;
      default:
        if (allowedOfficerRoles.includes(userRole)) {
          return <Navigate replace to="/officer" />;
        }
        return <Navigate replace to="/" />;
    }
  }

  return <Navigate replace to="/login" />;
}

export default RoleBasedRedirect;