const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;

app.set('trust proxy', true);
app.use(express.json());
app.use(cors());

// 1. MongoDB Verbindung
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/restkiste';
mongoose.connect(mongoURI)
    .then(() => console.log('Erfolgreich mit MongoDB verbunden!'))
    .catch(err => console.error('MongoDB Verbindungsfehler:', err));

// 2. Schema-Definition
const materialSchema = new mongoose.Schema({
    name: { type: String, required: true },
    menge: { type: String, required: true },
    plz: { type: String, required: true },
    lat: { type: Number, required: true },
    lon: { type: Number, required: true }
});

const Material = mongoose.model('Material', materialSchema);

// 3. OFFLINE-TELEFONBUCH: Fest hinterlegte Koordinaten für deine Umgebung (Kein Internet nötig!)
const PLZ_DATENBANK = {
    "64569": { lat: 49.9458, lon: 8.4592 }, // Nauheim
    "64521": { lat: 49.9044, lon: 8.4114 }, // Groß-Gerau
    "65428": { lat: 49.9947, lon: 8.4239 }, // Rüsselsheim
    "60311": { lat: 50.1112, lon: 8.6831 }, // Frankfurt
    "55116": { lat: 49.9929, lon: 8.2473 }  // Mainz
};

// Hilfsfunktion: Berechnet die Entfernung (Luftlinie in km)
function berechneEntfernung(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Hilfsfunktion: Holt Koordinaten offline oder versucht ein Online-Fallback
async function holeKoordinatenFuerPLZ(plz) {
    // Zuerst im Offline-Verzeichnis nachsehen
    if (PLZ_DATENBANK[plz]) {
        console.log(`PLZ ${plz} offline im Speicher gefunden!`);
        return PLZ_DATENBANK[plz];
    }

    // Fallback: Falls eine andere PLZ eingegeben wird, versuchen wir es online
    try {
        const response = await fetch(`https://openstreetmap.org{plz}&country=germany&format=json`, {
            headers: { 'User-Agent': 'RestKisteApp/1.0' }
        });
        const data = await response.json();
        if (data && data.length > 0) {
            return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        }
    } catch (error) {
        console.error("Online-Geocoding blockiert (kein Internet im Container):", error.message);
    }
    
    // Wenn alles fehlschlägt, nehmen wir Nauheim als Standard-Zentrum, damit die App nicht abstürzt
    return PLZ_DATENBANK["64569"];
}

// 4. Route: Materialien abrufen (GET)
app.get('/api/material', async (req, res) => {
    const { plz, radius } = req.query;

    try {
        const alleMaterialien = await Material.find();

        if (!plz || !radius || radius === "") {
            const antwort = alleMaterialien.map(item => ({
                id: item._id,
                name: item.name,
                menge: item.menge,
                plz: item.plz
            }));
            return res.json(antwort);
        }

        const suchKoordinaten = await holeKoordinatenFuerPLZ(plz);
        const maxRadius = parseFloat(radius);

        const gefilterteAntwort = alleMaterialien
            .map(item => {
                const dist = berechneEntfernung(suchKoordinaten.lat, suchKoordinaten.lon, item.lat, item.lon);
                return {
                    id: item._id,
                    name: item.name,
                    menge: item.menge,
                    plz: item.plz,
                    entfernung: dist
                };
            })
            .filter(item => item.entfernung <= maxRadius)
            .sort((a, b) => a.entfernung - b.entfernung);

        res.json(gefilterteAntwort);
    } catch (error) {
        console.error("Fehler beim Abrufen:", error);
        res.status(500).json({ error: "Datenbankfehler beim Abrufen" });
    }
});

// 5. Route: Neues Material hinzufügen (POST)
app.post('/api/material', async (req, res) => {
    const { name, menge, plz } = req.body;

    if (!name || !menge || !plz) {
        return res.status(400).json({ error: "Name, Menge und PLZ werden benötigt" });
    }

    const koordinaten = await holeKoordinatenFuerPLZ(plz);

    try {
        const neuesMaterial = new Material({
            name: name,
            menge: menge,
            plz: plz,
            lat: koordinaten.lat,
            lon: koordinaten.lon
        });

        await neuesMaterial.save();
        res.status(201).json(neuesMaterial);
    } catch (error) {
        console.error("Fehler beim Speichern:", error);
        res.status(500).json({ error: "Datenbankfehler beim Speichern" });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend läuft auf Port ${PORT}`);
});

// NEU: Route zum Löschen eines Materials anhand seiner ID
app.delete('/api/material/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const gelöscht = await Material.findByIdAndDelete(id);
        
        if (!gelöscht) {
            return res.status(404).json({ error: "Material nicht gefunden" });
        }
        
        res.json({ message: "Erfolgreich gelöscht!" });
    } catch (error) {
        console.error("Fehler beim Löschen:", error);
        res.status(500).json({ error: "Datenbankfehler beim Löschen" });
    }
});

