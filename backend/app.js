const express = require('express');
const bodyParser = require('body-parser');
//PlacesRoutes added as middleware in app.js
const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/user-routes');
const HttpError = require('./models/http-error');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(bodyParser.json());
app.use('/uploads/images', express.static(path.join('uploads','images')));

app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept,Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
})
app.use('/api/places',placesRoutes); //Register placesRoutes as middleware.
app.use('/api/users',usersRoutes); //Register placesRoutes as middleware.

//Route Not Found Middleware
app.use((req,res,next)=>{
    const error =new HttpError('Could not find this route.',404);
    //Throw error is used to reach next error handler middleware
    throw error;
})
//Error handling middleware
app.use((error,req,res,next)=>{
    if(req.file){
        fs.unlink(req.file.path, err=>{
            console.log(err);
        })
    }
    if(res.headerSent){
        return next(error);
    }
    res.status(error.code || 500)
    res.json({message: error.message || 'An unknown error occured'})
})
mongoose
.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hbz3rtz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`)
.then(()=>{app.listen(5000);})
.catch(err=>console.log(err));