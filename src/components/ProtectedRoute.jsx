import { Navigate } from "react-router";
import { useContext } from "react";
import { UserContext } from "../App";

function ProtectedRoute({ children, allowedRoles, requireCitizen = false }) {
  const { user, citizenLoggedIn, userLoggedIn, userRole } = useContext(UserContext);

  // If citizen access is required and user is a citizen
  if (requireCitizen && citizenLoggedIn) {
    return children;
  }

  // If specific role is required and user has that role
  if (allowedRoles && userLoggedIn && allowedRoles.includes(userRole)) {
    return children;
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate replace to="/login" />;
  }

  // If logged in but not authorized, show not authorized page
  return <Navigate replace to="/not-authorized" />;
}

export default ProtectedRoute;