const { v4: uuidv4 } = require('uuid');
const HttpError = require('../models/http-error');
const {validationResult} = require('express-validator');
const getCoordsForAddress = require('../utils/location');
const Place = require('../models/place');
const User = require('../models/user');
const mongoose = require('mongoose');
const fs = require('fs');
const getPlaceById = async (req,res,next) =>{
    const placeId = req.params.pid;
    // const place = DUMMY_PLACES.find((p)=> {return p.id === placeId});
    let place;
    try{
      place = await Place.findById(placeId);
    }catch(err){
      const error = new HttpError("Something went wrong, could not find a place.",500);
      //To stop execution if any error found.
      return next(error);
    }
    if(!place){
      //Video 96-->
      const error =  new HttpError("Could not find a place for provided id.",404);
      return next(error);
    }
    // res.json({place});   //res.json({place:place});
    res.json({place:place.toObject({getters:true})});
}

const getPlacesByUserId = async (req,res,next) =>{
    const placeId = req.params.uid;
    // const places = DUMMY_PLACES.filter((p)=> {return p.creator === placeId});
    let places;
    try{
      places = await Place.find({creator:placeId});
    }catch(err){
      const error = new HttpError("Fetching places failed, please try later.",500);
      //To stop execution if any error found.
      return next(error);
    }
    if(!places || places.length === 0){
      return next(new HttpError("Could not find a place for provided user id.",404));
    }
    // res.status(200).json({places});   //res.json({place:place});
    res.json({places:places.map(place=>place.toObject({getters:true}))});
}

const createPlace = async (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      console.log(errors);
      // throw new HttpError("Invalid inputs passed, please check your data",422);
      return next(new HttpError("Invalid inputs passed, please check your data",422));
    }
    const {title,description,address}= req.body;
    console.log("Ye rhi body",req.body);
    let coordinates;
    // try{
    //   coordinates = await getCoordsForAddress(address);
    // }
    // catch(error){
    //   console.log("Getting error");
    //   return next(error);
    // }
    // const createdPlace = {
    //   id: uuidv4(),
    //   title,
    //   description,
    //   location:coordinates,
    //   address,
    //   creator
    // }
     const createdPlace = new Place({
      title,
      description,
      address,
      // location:coordinates,
      location:{
        lat: 40.7484474,
        long: -73.9871516
      },
      imageUrl: req.file.path,
      creator: req.userData.userId
    });
    // DUMMY_PLACES.push(createdPlace);


    //Check if place for particular user exists
    let user;
     try{
      user = await User.findById(req.userData.userId);
    }catch(err){
      const error = new HttpError("Creating place failed, try again later.",500);
      //To stop execution if any error found.
      return next(error);
    }

    if(!user){
      const error = new HttpError("Could not find user for provided id, try again later.",404);
      //To stop execution if any error found.
      return next(error);
    }


    //Saving the document 
    try{
      // await createdPlace.save();
      const sess = await mongoose.startSession();
      sess.startTransaction();
      await createdPlace.save({session:sess});
      user.places.push(createdPlace);
      await user.save({session:sess});
      await sess.commitTransaction();
    }catch(err){
      const error = new HttpError("Creating place failed, please try again",500);
      return next(error);
    }

    //Sent back response
    res.status(201).json({place:createdPlace});
}
const updatePlace = async (req,res,next)=>{
   const errors = validationResult(req);
    if(!errors.isEmpty()){
      console.log(errors);
      // throw new HttpError("Invalid inputs passed, please check your data",422);
      return next(new HttpError("Invalid inputs passed, please check your data",422));
    }
  const {title,description} = req.body;
  const placeId = req.params.pid;
  let place;
    try{
      place = await Place.findById(placeId);
    }catch(err){
      const error = new HttpError("Something went wrong, could not find a place.",500);
      //To stop execution if any error found.
      return next(error);
    }
  //const updatedPlace = DUMMY_PLACES.find(p=> p.id === placeId);
  // const updatedPlace = {...DUMMY_PLACES.find(p=> p.id === placeId)};
  // const placeIndex = DUMMY_PLACES.findIndex(p=> p.id === placeId);

  //

  if(place.creator.toString() !== req.userData.userId){
      const error = new HttpError("You are not allowed to edit this place",401)
      return next(error);
    }

  
  place.title = title;
  place.description = description;
  
  //Storing updated place in database.
   try{
      await place.save();
    }catch(err){
      const error = new HttpError("Something went wrong, could not update place",500);
      return next(error);
    }
    
  // DUMMY_PLACES[placeIndex] = updatedPlace;
  // res.status(200).json({place:updatedPlace});
  res.status(200).json({place:place.toObject({getters:true})});
}
const deletePlace = async (req,res,next)=>{
   const placeId = req.params.pid;
  //  DUMMY_PLACES = DUMMY_PLACES.filter(p=> p.id !== placeId)
   let place;
    try{
      place = await Place.findById(placeId).populate('creator');
    }catch(err){
      const error = new HttpError("Something went wrong, could not find a place.",500);
      //To stop execution if any error found.
      return next(error);
    }

    //If we don't find a place
   if(!place){
      const error = new HttpError("Could not find a place for this place id.",404);
      //To stop execution if any error found.
      return next(error);
    }

    if(place.creator.id !== req.userData.userId){
      const error = new HttpError("You are not allowed to delete this place",401)
      return next(error);
    }

    const imagePath = place.image;
    //Deleting the document
    try{
      // await place.remove();
      // await place.deleteOne();
      // console.log("Document deleted successfully");
      const sess = await mongoose.startSession();
      sess.startTransaction();
      await place.deleteOne({session:sess});
      place.creator.places.pull(place);
      await place.creator.save({session:sess});
      await sess.commitTransaction();

    }catch(err){
      const error = new HttpError("Something went wrong, could not delete place",500);
      return next(error);
    }
     fs.unlink(imagePath, err=>{
                console.log(err);
            })
   res.status(200).json({message:"Place Deleted Successfully"})
}
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;