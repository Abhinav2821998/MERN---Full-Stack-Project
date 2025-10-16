const express = require('express');
const {check} = require('express-validator');
const placesControllers = require('../controllers/places-controller')
const fileUpload = require('../middleware/file-upload')
const checkAuth = require('../middleware/check-auth');
const router = express.Router();
//To retrieve the details of a particular place..
router.get('/:pid',placesControllers.getPlaceById )
//To retrieve the details of place by a user..
router.get('/user/:uid', placesControllers.getPlacesByUserId)

//Requests having tokens will only beauthenticated to the belowroutes
router.use(checkAuth);
router.post('/',fileUpload.single('image'),[
    check('title').not().isEmpty(), 
    check('description').isLength({min:5}), 
    check('address').not().isEmpty()
    ],
    placesControllers.createPlace)
router.patch('/:pid',[
    check('title').not().isEmpty(), 
    check('description').isLength({min:5})
    ],placesControllers.updatePlace)
router.delete('/:pid',placesControllers.deletePlace)
module.exports = router;