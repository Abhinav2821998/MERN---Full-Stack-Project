import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainNavigation from "./shared/components/Navigation/MainNavigation"; // adjust path if needed
// import Users from "./user/pages/Users";
// import NewPlace from "./places/pages/NewPlace";
// import UserPlaces from "./places/pages/UserPlaces";
// import UpdatePlace from "./places/pages/UpdatePlace";
// import Auth from "./user/pages/Auth";
import { AuthContext } from "./shared/context/auth-context";
import { useState,useEffect } from "react";
import { useCallback } from "react";
import React, {Suspense} from "react";
import LoadingSpinner from "./shared/components/UIElements/LoadingSpinner";
const Users = React.lazy(() => import("./user/pages/Users"));
const NewPlace = React.lazy(() => import("./places/pages/NewPlace"));
const UserPlaces = React.lazy(() => import("./places/pages/UserPlaces"));
const UpdatePlace = React.lazy(() => import("./places/pages/UpdatePlace"));
const Auth = React.lazy(() => import("./user/pages/Auth"));
let logoutTimer;
function App() {
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(false);
  const [tokenExpiryDate, setTokenExpiryDate] = useState();
  const [userId, setUserId] = useState(false);
  const login = useCallback((uid,token,expirationDate) => {
    // setIsLoggedIn(true);
    setToken(token);
    setUserId(uid);
    const tokenExpiryDate = expirationDate || new Date(new Date().getTime() + 1000*60*60);
    setTokenExpiryDate(tokenExpiryDate);
    localStorage.setItem('userData',
      JSON.stringify({userId: uid, token:token, expiration: tokenExpiryDate.toISOString() })
    )
  }, []);
  const logout = useCallback(() => {
    // setIsLoggedIn(false);
    setToken(null);
    setUserId(null);
    setTokenExpiryDate(null);
    localStorage.removeItem('userData');
  }, []);


  //Autologout func...
  useEffect(()=>{
    if(token && tokenExpiryDate){
      const remainingTime = tokenExpiryDate.getTime() - new Date().getTime();
      logoutTimer = setTimeout(logout,remainingTime);
    }
    else{
      clearTimeout(logoutTimer)
    }
  },[token,logout,tokenExpiryDate])
  useEffect(()=>{
    const storedData = JSON.parse(localStorage.getItem('userData'));
    if(storedData && storedData.token && new Date(storedData.expiration) > new Date()){
      login(storedData.userId,storedData.token,storedData.expiration);
    }
  },[login])

  let routes;
  if (token) {
    routes = (
      <Routes>
        <Route path="/" element={<Users />} />
        <Route path="/:userId/places" element={<UserPlaces />} />
        <Route path="/places/new" element={<NewPlace />} />
        <Route path="/places/:placeId" element={<UpdatePlace />} />
        {/* <Route path="/auth" element={<Auth />} /> */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  } else {
    routes = (
      <Routes>
        <Route path="/" element={<Users />} />
        <Route path="/:userId/places" element={<UserPlaces />}/>
        {/*<Route path="/places/new" element={<NewPlace />} />
        <Route path="/places/:placeId" element={<UpdatePlace />} /> */}
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }
  return (
    <AuthContext.Provider
      value={{ isLoggedIn: !!token, token:token, userId:userId, login: login, logout: logout }}
    >
      <BrowserRouter>
        <MainNavigation />
        <main className="p-2">
          {" "}
          {/* ✅ Your page content goes here */}
          {/* <Routes>
            <Route path="/" element={<Users />} />
            <Route path="/:userId/places" element={<UserPlaces />} />
            <Route path="/places/new" element={<NewPlace />} />
            <Route path="/places/:placeId" element={<UpdatePlace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes> */}
          <Suspense
          fallback={
            <div className="center">
                <LoadingSpinner/>
            </div>
          }
          >
          {routes}
          </Suspense>
        </main>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
