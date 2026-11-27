
const express = require('express');

const app = express();

app.get('/students/:id', (req, res) => {
    const id = req.params.id;

    res.json({
        id: id,
        name: 'Anu'
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
