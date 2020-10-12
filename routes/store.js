const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const storeController = require('../controllers/api/storeController');
const verifyjwt = require('../middlewares/tokenVerification');
const storage = require('../config/storage');


const storeValidation = [
    body('name').not().isEmpty().trim().escape(),
    body('description').not().isEmpty().trim().escape(),
    body('contact_no').not().isEmpty().trim().escape(),
    verifyjwt.checkToken
]

const storeLocationValidation = [
    body('name').not().isEmpty().trim().escape(),
    body('description').not().isEmpty().trim().escape(),
    body('contact_no').not().isEmpty().trim().escape(),
    body('zipcode').not().isEmpty().trim().escape(),
    body('lat').not().isEmpty().trim().escape(),
    body('long').not().isEmpty().trim().escape(),
    verifyjwt.checkToken
]

const storeNearByValidation = [
    body('lat').not().isEmpty().trim().escape(),
    body('long').not().isEmpty().trim().escape()
];

router.post('/store/create', storeValidation, storeController.create);
router.get('/store/list',storeController.list);
router.get('/store/:id',storeController.show);
router.get('/store/zipcode/:zipcode',storeController.getStoreByZipcode);
router.post('/store/nearby/stores', storeNearByValidation,storeController.nearByStores);
router.put('/store/:id/update', storeValidation, storeController.updateStore);
router.delete('/store/:id/delete', verifyjwt.checkToken,storeController.deleteStore);

module.exports = router;