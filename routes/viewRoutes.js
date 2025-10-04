const express = require('express');
const viewController = require('../controllers/viewsController');
const router = express.Router();

// Routes
router.get('/', viewController.getOverview);
router.get('/tour/:slug', viewController.getTour);
router.get('/login', viewController.getLoginForm);

module.exports = router;
