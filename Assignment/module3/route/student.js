
const express = require('express');

const router = express.Router();

// GET students route
router.get('/', (req, res) => {
    res.json([
        { id: 1, name: 'Anu' }
    ]);
});

module.exports = router;
