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

export const NavbarTextContext = createContext();
export const UserContext = createContext();


function App() {
  const [navbarText, setNavbarText] = useState("PARTICIPIUM");
  const [loggedIn, setLoggedIn] = useState(false);
  const [citizenLoggedIn, setCitizenLoggedIn] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); 

  const checkAuth = async () => {
    try {
      const user = await API.getUserInfo(); 
      setUser(user);
      if (user.kind !== 'citizen') {
        setUserRole(user.profile.role);
        setUserLoggedIn(true);
      } else {
        setCitizenLoggedIn(true);
      }
    } catch (err) {
      setLoggedIn(false);
      setUser(null);
    } finally {
      setIsCheckingAuth(false); // Auth check completato
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Inter, sans-serif' 
      }}>
        Loading...
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ user, setUser, citizenLoggedIn, setCitizenLoggedIn, userLoggedIn, setUserLoggedIn, userRole, setUserRole }}>
      <NavbarTextContext.Provider value={{ navbarText, setNavbarText }}>
        <Routes>
          <Route element={<DefaultLayout />}>
            <Route path="/" element={(citizenLoggedIn ? <Navigate replace to='/map'/> : <Navigate replace to='/login' />)} />
            <Route path="/register" element={<Registration />} />
            <Route path="/login" element={<Login/>} /> 
            <Route path="/admin" element={((userLoggedIn && (userRole === 'ADMIN') ) ? <AdminPage /> : <NotAuthorized/>)} />
            <Route path="/map" element={(citizenLoggedIn ? <MapPage /> : <Navigate replace to='/'/>)} />
            <Route path="*" element={<Navigate replace to='/'/>} />
          </Route>
        </Routes>
      </NavbarTextContext.Provider>
    </UserContext.Provider>
  );
}

export default App
