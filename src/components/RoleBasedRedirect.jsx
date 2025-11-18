import { Navigate } from "react-router";
import { useContext } from "react";
import { UserContext } from "../App";

function RoleBasedRedirect() {
  const { user, citizenLoggedIn, userLoggedIn, userRole } = useContext(UserContext);

  if (citizenLoggedIn) {
    return <Navigate replace to="/map" />;
  }

  if (userLoggedIn) {
    switch (userRole) {
      case "ADMIN":
        return <Navigate replace to="/admin" />;
      case "Public Relations Officer":
        return <Navigate replace to="/pro" />;
      default:
        return <Navigate replace to="/" />;
    }
  }

  return <Navigate replace to="/login" />;
}

export default RoleBasedRedirect;