import React from "react";
import './NewPlace.css';
import PlaceList from "../components/PlaceList";
import { useParams } from "react-router-dom";
import { useHttpClient } from "../../shared/hooks/http-hook";
import {AuthContext} from "../../shared/context/auth-context";
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useEffect,useState } from "react";
const DUMMY_PLACES = [
  {
    id: "p1",
    title: "Oberoi Building",
    description: "Top building",
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1670455445283-7234765ad25a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxN3x8fGVufDB8fHx8fA%3D%3D",
    address: "20 W 34th St New York, NY 10001",
    location: {
       lat: 40.7484405,
      long: -73.9878584,
    },
    creator: "u1",
  },
  {
    id: "p1",
    title: "Empire State Building",
    description: "Top building",
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1670455445283-7234765ad25a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxN3x8fGVufDB8fHx8fA%3D%3D",
    address: "20 W 34th St New York, NY 10003",
    location: {
      lat: 40.7484405,
      long: -73.9878584,
    },
    creator: "u2",
  },
];
const UserPlaces = () => {
  const userId = useParams().userId;
  const [loadedPlaces, setLoadedPlaces] = useState(false);
  const {isLoading, error, sendRequest, clearError} = useHttpClient();
  // const loadedPlaces = DUMMY_PLACES.filter((place) => place.creator === userId);
  
  useEffect(()=>{
    const fetchPlaces = async () =>{
      try{
        const responseData = await sendRequest(process.env.REACT_APP_BACKEND_URL + `/places/user/${userId}`);
        setLoadedPlaces(responseData.places);
      }catch(error){}
    }
    fetchPlaces();
  },[sendRequest]);
  // return <PlaceList items={DUMMY_PLACES} />;
  const placeDeleteHandler = (deletedId) =>{
     setLoadedPlaces(prevPlaces => prevPlaces.filter(place=> place.id !== deletedId));
  }
  return (<React.Fragment>
    <ErrorModal error={error} onClear={clearError}/>
     {isLoading && 
       <LoadingSpinner asOverlay/>
    }
    {!isLoading && loadedPlaces.length > 0 && <PlaceList items={loadedPlaces} onDeletePlace={placeDeleteHandler}/>}
  </React.Fragment>);
};
export default UserPlaces;
