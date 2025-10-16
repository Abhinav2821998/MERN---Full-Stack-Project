const { v4: uuidv4 } = require('uuid');
const HttpError = require('../models/http-error');
const User = require('../models/user');
const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const getUsers = async (req,res,next)=>{
    let users;
    try{
     users = await User.find({}, '-password');
    }catch(err){
        const error = new HttpError("Fetching users failed, please try again later",422);
        return next(error);
    }
     res.json({users : users.map(user=>user.toObject({getters:true}))});
};
const signup = async (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      console.log(errors);
    return next(new HttpError("Could not validate data, please check your data",422));
    }
   const {name,email,password} = req.body;
   let existingUser;
   try{
    existingUser = await User.findOne({email:email})
   }catch(err){
      const error = new HttpError("Signin up failed, please try again later",500);
      return next(error);
   }

   if(existingUser){
      const error = new HttpError("User exists already, please try again",422);
      return next(error);
   }

   //Storing hashed password
   let hashedPassword;
   try{
    hashedPassword = await bcrypt.hash(password,12);
   }catch(err){
    const error = new HttpError("Could not create user, please try again.",500);
    return next(error);
   }

   const createdUser = new User({
         name,
         email,
         password:hashedPassword,
         image: req.file.path,
         places:[]
       });
       try
       {
          await createdUser.save();
        }
        catch(err){
          const error = new HttpError("Signin up failed, please try again",500);
          return next(error);
        }
      
      //Generating token
      let token;
      try{
        token = jwt.sign({userId: createdUser.id, email: createdUser.email}, process.env.JWT_KEY,{expiresIn: '1h'})
      }catch(err){
        const error = new HttpError("Signin up failed, please try again",500);
        return next(error);
      }
      


      // res.status(200).json({user:createdUser.toObject({getters:true})});
      res.status(200).json({userId:createdUser.id, email:createdUser.email, token:token});
};
const login = async (req,res,next)=>{
    const {email,password} = req.body;
     let existingUser;
   try{
    existingUser = await User.findOne({email:email})
   }catch(err){
      const error = new HttpError("Login in failed, please try again later",500);
      return next(error);
   }
     if(!existingUser){
        return next( new HttpError('Invalid credentials, credentials seem to be wrong', 401));
    }

  //Comparing passwords
   let isValidPassword;
   try{
    isValidPassword = await bcrypt.compare(password,existingUser.password);
   }catch(err){
    const error = new HttpError("Could not login you, please try again.",500);
    return next(error);
   }

   if(!isValidPassword){
    const error = new HttpError("Passwords not matching..Could not login you, please try again.",401);
    return next(error);
   }

   //Generating token
      let token;
      try{
        token = jwt.sign({userId: existingUser.id, email: existingUser.email},  process.env.JWT_KEY,{expiresIn: '1h'})
      }catch(err){
        const error = new HttpError("Login failed, please try again",500);
        return next(error);
      }
      
    // res.json({message:'Logged In!', user: existingUser.toObject({getters:true})});
    res.json({userId:existingUser.id, email:existingUser.email, token:token});
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
