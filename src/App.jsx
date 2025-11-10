import "./index.css";
import { useState, createContext } from "react";
import { Route, Routes } from "react-router";
import "./App.css";
import DefaultLayout from "./components/DefaultLayout";
import Login from "./components/Login";
import Registration from "./components/Registration";
import AdminPage from "./components/AdminPage";
import MapPage from "./components/MapPage";

export const NavbarTextContext = createContext();


function App() {
  const [navbarText, setNavbarText] = useState("PARTICIPIUM");

  return (
    <NavbarTextContext.Provider value={{ navbarText, setNavbarText }}>
      <Routes>
        <Route element={<DefaultLayout />}>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/login" element={<Login />} /> 
          <Route path="/login_internal_user" element={<Login />} /> 
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/map" element={<MapPage />} />
        </Route>
      </Routes>
    </NavbarTextContext.Provider>
  );
}

export default App
