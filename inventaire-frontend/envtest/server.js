const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { spawn } = require('child_process');

console.log("===> Démarrage du serveur...");
const path = require('path');
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});


const app = express();
app.use(cors());
app.use(express.json());

// Endpoint pour lancer le script Python et lire result.txt
app.post('/run-script', (req, res) => {
    const { ip, community } = req.body;

    // Sous Windows, utilise 'python' au lieu de 'python3'
    const py = spawn('python', ['tst.py']);

    py.stdin.write(`${ip}\n`);
    py.stdin.write(`${community || 'public'}\n`);
    py.stdin.end();

    let output = '';

    py.stdout.on('data', (data) => {
        output += data.toString();
    });

    py.stderr.on('data', (data) => {
        output += `ERROR: ${data.toString()}`;
    });

    py.on('close', (code) => {
        // Quand le script est fini, lis le fichier result.txt
fs.readFile('result.html', 'utf8', (err, data) => {
    if (err) {
        return res.status(500).send({ error: "Erreur lecture result.html" });
    }
    res.send({ result: data });
});
    });
});

// Endpoint pour vider le fichier result.txt
app.post('/clear-result', (req, res) => {
    fs.writeFile('result.txt', '', (err) => {
        if (err) {
            return res.status(500).send({ error: "Erreur lors de la remise à zéro" });
        }
        res.send({ message: "Fichier vidé avec succès." });
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});
