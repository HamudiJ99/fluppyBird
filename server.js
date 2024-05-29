const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

// Beispiel-Highscores
let highscores = [];

app.use(bodyParser.json());

// Endpunkt zum Abrufen aller Highscores
app.get('/highscores', (req, res) => {
    res.json(highscores);
});

// Endpunkt zum Hinzufügen eines neuen Highscores
app.post('/highscores', (req, res) => {
    const { name, score } = req.body;
    if (!name || !score) {
        return res.status(400).json({ error: 'Name and score are required' });
    }
    highscores.push({ name, score });
    res.status(201).json({ message: 'Highscore added successfully' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
