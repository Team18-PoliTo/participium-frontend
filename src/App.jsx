import "./index.css";
import { useState, createContext } from "react";
import { Route, Routes } from "react-router";
import "./App.css";
import DefaultLayout from "./components/DefaultLayout";
import Login from "./components/Login";
import Registration from "./components/Registration";


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
        </Route>
      </Routes>
    </NavbarTextContext.Provider>
  );
}

export default App
