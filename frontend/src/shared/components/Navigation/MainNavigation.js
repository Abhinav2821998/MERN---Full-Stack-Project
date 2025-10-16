import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import MainHeader from "./MainHeader";
import "./MainNavigation.css";
import NavLinks from "./NavLinks";
import SideDrawer from "./SideDrawer";
import Backdrop from "../UIElements/Backdrop";
const MainNavigation = (props) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const ondrawerOpen = () => {
    setDrawerOpen(true);
  };
  const ondrawerClose = () => {
    setDrawerOpen(false);
  };
  return (
    <>
      {drawerOpen && <Backdrop onClick={ondrawerClose} />}

      <SideDrawer show={drawerOpen} onClick={ondrawerClose}>
        <nav className="main-navigation_drawer-nav">
          <NavLinks />
        </nav>
      </SideDrawer>

      <MainHeader>
        <button className="main-navigation__menu-btn" onClick={ondrawerOpen}>
          <span />
          <span />
          <span />
        </button>
        <h1 className="main-navigation__title">
          <Link to="/">YourPlaces</Link>
        </h1>
        <nav className="main-navigation__header-nav">
          <NavLinks />
        </nav>
      </MainHeader>
    </>
  );
};

export default MainNavigation;
