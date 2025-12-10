import { Navigate } from "react-router";
import { useContext } from "react";
import { UserContext } from "../App";
import { allowedOfficerRoles } from "../constants/allowedOfficerRoles";

function RoleBasedRedirect() {
  const { citizenLoggedIn, userLoggedIn, userRole } = useContext(UserContext);

  if (citizenLoggedIn) {
    return <Navigate replace to="/" />;
  }

  if (userLoggedIn) {
    switch (userRole) {
      case "ADMIN":
        return <Navigate replace to="/admin" />;
      case "Public Relations Officer":
        return <Navigate replace to="/pro" />;
      case "External Maintainer":
        return <Navigate replace to="/maintainer" />;
      default:
        if (allowedOfficerRoles.includes(userRole)) {
          return <Navigate replace to="/officer" />;
        }
        return <Navigate replace to="/" />;
    }
  }

  return <Navigate replace to="/" />;
}

export default RoleBasedRedirect;
