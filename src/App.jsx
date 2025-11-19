import "./index.css";
import { useState, createContext, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router";
import API from "./API/API";
import "./App.css";
import DefaultLayout from "./components/DefaultLayout";
import Login from "./components/Login";
import Registration from "./components/Registration";
import AdminPage from "./components/AdminPage";
import MapPage from "./components/MapPage";
import NotAuthorized from "./components/NotAuthorized";
import Homepage from "./components/Homepage";
import HowItWorks from "./components/HowItWorks";
import PublicRelationsOfficer from "./components/PublicRelationsOfficer";
import LoadingSpinner from "./components/LoadingSpinner";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleBasedRedirect from "./components/RoleBasedRedirect";

export const NavbarTextContext = createContext();
export const UserContext = createContext();
export const MobileContext = createContext();

function App() {
  const [navbarText, setNavbarText] = useState("PARTICIPIUM");
  const [loggedIn, setLoggedIn] = useState(false);
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
      if (user.kind !== "citizen") {
        setUserRole(user.profile.role);
        setUserLoggedIn(true);
      } else {
        setCitizenLoggedIn(true);
      }
    } catch (err) {
      setLoggedIn(false);
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
      const mobileDevices = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      setIsMobile(mobileDevices.test(userAgent) || window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  if (isCheckingAuth) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        citizenLoggedIn,
        setCitizenLoggedIn,
        userLoggedIn,
        setUserLoggedIn,
        userRole,
        setUserRole,
      }}
    >
      <NavbarTextContext.Provider value={{ navbarText, setNavbarText }}>
        <MobileContext.Provider value={{ isMobile, setIsMobile }}>
          <Routes>
            <Route element={<DefaultLayout />}>
              <Route path="/" element={<Homepage />} />
              <Route path="/register" element={<Registration />} />
              <Route path="/login" element={<Login />} />
              
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
