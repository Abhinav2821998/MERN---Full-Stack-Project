import React from "react";
import { NavLink } from "react-router-dom";
import { useContext } from "react";
import "./NavLinks.css";
import { AuthContext } from "../../context/auth-context";
//import { useContext } from "react";
const NavLinks = (props) => {
  //This auth is holding the Context value.
  const auth = useContext(AuthContext);
  return (
    <ul className="nav-links mt-10 md:mt-0">
      <li>
        <NavLink to="/" exact>
          ALL USERS
        </NavLink>
      </li>
      {auth.isLoggedIn && (
        <li>
          <NavLink to={`/${auth.userId}/places`} >MY PLACES</NavLink>
        </li>
      )}
      {auth.isLoggedIn && (
        <li>
          <NavLink to="/places/new">ADD PLACE</NavLink>
        </li>
      )}
      {!auth.isLoggedIn && (
        <li>
          <NavLink to="/auth">AUTHENTICATE</NavLink>
        </li>
      )}
      {auth.isLoggedIn && (
        <li>
          <button onClick={auth.logout}>LOGOUT</button>
        </li>
      )}
    </ul>
  );
};
export default NavLinks;
