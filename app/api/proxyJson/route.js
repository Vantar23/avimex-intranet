const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = 3001; // Puerto del proxy

app.use(cors()); // Permitir CORS para evitar restricciones
app.use(express.json()); // Permitir JSON en los cuerpos de las peticiones

// Ruta del proxy
app.all("/proxy", async (req, res) => {
    try {
        const { method, url, body } = req.body; // Datos enviados desde el cliente

        if (!method || !url) {
            return res.status(400).json({ error: "Faltan 'method' y 'url' en la solicitud." });
        }

        console.log(`Proxy: ${method} ${url}`);

        const options = {
            method: method.toUpperCase(), // Convertir el método a mayúsculas (GET, POST, PUT, DELETE)
            headers: { "Content-Type": "application/json" },
            ...(body ? { body: JSON.stringify(body) } : {}), // Agregar body si es POST, PUT o DELETE
        };

        const response = await fetch(url, options);
        const data = await response.json();

        res.json(data); // Responder con los datos obtenidos
    } catch (error) {
        console.error("Error en el proxy:", error);
        res.status(500).json({ error: "Error en el proxy" });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Proxy corriendo en http://localhost:${PORT}`);
});