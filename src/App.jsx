import "./index.css";
import { useState, createContext, useEffect, useMemo } from "react";
import { Route, Routes, Navigate } from "react-router";
import API from "./API/API";
import DefaultLayout from "./components/Layout/DefaultLayout";
import Login from "./components/Auth/Login";
import Registration from "./components/Auth/Registration";
import AdminPage from "./components/Admin/AdminPage";
import MapPage from "./components/Map/MapPage";
import NotAuthorized from "./components/Routes/NotAuthorized";
import Homepage from "./components/Homepage";
import HowItWorks from "./components/HowItWorks";
import PublicRelationsOfficer from "./components/InternalUsers/PublicRelationsOfficer";
import LoadingSpinner from "./components/LoadingSpinner";
import ProtectedRoute from "./components/Routes/ProtectedRoute";
import RoleBasedRedirect from "./components/Routes/RoleBasedRedirect";
import OfficerPage from "./components/InternalUsers/OfficerPage";
import { allowedOfficerRoles } from "./constants/allowedOfficerRoles";
import UserPage from "./components/Citizen/UserPage";
import MaintainerPage from "./components/InternalUsers/MaintainerPage";
import WebSocketTest from "./components/WebSocketTest";

export const NavbarTextContext = createContext();
export const UserContext = createContext();
export const MobileContext = createContext();

function App() {
  const [navbarText, setNavbarText] = useState("PARTICIPIUM");
  const [citizenLoggedIn, setCitizenLoggedIn] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const checkAuth = async () => {
    try {
      const user = await API.getUserInfo();
      setUser(user);
      if (user.kind === "citizen") {
        setCitizenLoggedIn(true);
      } else {
        setUserRole(user.profile.role);
        setUserLoggedIn(true);
      }
    } catch (err) {
      console.log("Auth check failed:", err);
      setUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const checkIfMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileDevices =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      setIsMobile(mobileDevices.test(userAgent) || window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const userContextValue = useMemo(
    () => ({
      user,
      setUser,
      citizenLoggedIn,
      setCitizenLoggedIn,
      userLoggedIn,
      setUserLoggedIn,
      userRole,
      setUserRole,
    }),
    [user, citizenLoggedIn, userLoggedIn, userRole]
  );

  const navbarContextValue = useMemo(
    () => ({
      navbarText,
      setNavbarText,
    }),
    [navbarText]
  );

  const mobileContextValue = useMemo(
    () => ({
      isMobile,
      setIsMobile,
    }),
    [isMobile]
  );

  if (isCheckingAuth) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  return (
    <UserContext.Provider value={userContextValue}>
      <NavbarTextContext.Provider value={navbarContextValue}>
        <MobileContext.Provider value={mobileContextValue}>
          <Routes>
            <Route element={<DefaultLayout />}>
              <Route path="/" element={<Homepage />} />
              <Route path="/register" element={<Registration />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute requireCitizen>
                    <UserPage />
                  </ProtectedRoute>
                }
              />
              {/* Redirect basato sul ruolo */}
              <Route path="/dashboard" element={<RoleBasedRedirect />} />

              {/* Route per Citizen */}
              <Route
                path="/how-it-works"
                element={
                  <ProtectedRoute requireCitizen>
                    <HowItWorks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/map"
                element={
                  <ProtectedRoute requireCitizen>
                    <MapPage />
                  </ProtectedRoute>
                }
              />

              {/* Route per Admin */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />

              {/* Route per Public Relations Officer */}
              <Route
                path="/pro"
                element={
                  <ProtectedRoute allowedRoles={["Public Relations Officer"]}>
                    <PublicRelationsOfficer />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/officer"
                element={
                  <ProtectedRoute allowedRoles={allowedOfficerRoles}>
                    <OfficerPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/maintainer"
                element={
                  <ProtectedRoute allowedRoles={["External Maintainer"]}>
                    <MaintainerPage />
                  </ProtectedRoute>
                }
              />

              {/* WebSocket Test Page (for development/testing) */}
              <Route path="/ws-test" element={<WebSocketTest />} />

              <Route path="/not-authorized" element={<NotAuthorized />} />
              <Route path="*" element={<Navigate replace to="/" />} />
            </Route>
          </Routes>
        </MobileContext.Provider>
      </NavbarTextContext.Provider>
    </UserContext.Provider>
  );
}

export default App;
