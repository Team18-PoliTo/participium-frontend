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
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

 const checkAuth = async () => {
    try {
      const user = await API.getUserInfo(); 
      setLoggedIn(true);
      setUser(user);
      if (user.kind !== 'citizen') {
        setUserRole(user.profile.role);
      } 
    } catch (err) {
      setLoggedIn(false);
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loggedIn, setLoggedIn, userRole, setUserRole }}>
      <NavbarTextContext.Provider value={{ navbarText, setNavbarText }}>
        <Routes>
          <Route element={<DefaultLayout />}>
            <Route path="/" element={(loggedIn ? <Navigate replace to='/map'/> : <Navigate replace to='/login' />)} />
            <Route path="/register" element={<Registration />} />
            <Route path="/login" element={(loggedIn ? <Navigate replace to='/map'/> : <Login />)} /> 
            <Route path="/login_internal_user" element={<Login />} /> 
            <Route path="/admin" element={((loggedIn && (userRole === 'ADMIN') ) ? <AdminPage /> : <NotAuthorized/>)} />
            <Route path="/map" element={(loggedIn ? <MapPage /> : <Navigate replace to='/'/>)} />
            <Route path="*" element={<Navigate replace to='/'/>} />
          </Route>
        </Routes>
      </NavbarTextContext.Provider>
    </UserContext.Provider>
  );
}

export default App
