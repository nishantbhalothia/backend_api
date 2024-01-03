const express = require('express');
const router = express.Router();

// All routes
router.get('/', (req, res) => {
    res.send('Hello World');
}
);

router.use('/api/users', require('./api/user.js'));


module.exports = router;