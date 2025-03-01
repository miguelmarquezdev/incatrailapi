const express = require('express');
const axios = require('axios');
const cors = require('cors');
const https = require('https');

const app = express();
app.use(express.json()); // Permite leer JSON en las solicitudes
app.use(cors()); // Habilita CORS para peticiones desde el frontend

// URLs de la API
const AUTH_URL = 'https://api-tuboleto.cultura.pe/auth/user/login';
const API_URL = 'https://api-tuboleto.cultura.pe/recaudador/venta/getConsultaCupos';

// Credenciales de acceso (reemplaza esto con valores seguros)
const USERNAME = 'happygringotours@gmail.com';
const PASSWORD = '///GRINGO1987';

// Configuración para ignorar la verificación del certificado SSL
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// Función para obtener el token de autenticación
async function getAuthToken() {
    try {
        const response = await axios.post(AUTH_URL, {
            username: USERNAME,
            password: PASSWORD
        }, {
            headers: { 'Content-Type': 'application/json' },
            httpsAgent // Deshabilita la verificación SSL
        });

        return response.data.body?.access_token || null;
    } catch (error) {
        console.error('Error al obtener el token:', error.message);
        return null;
    }
}

// Endpoint para obtener disponibilidad de cupos en el Camino Inca
app.post('/api/disponibilidad', async (req, res) => {
    const { year, month, route } = req.body;

    // Obtener token de autenticación
    const token = await getAuthToken();
    if (!token) {
        return res.status(500).json({ message: 'No se pudo obtener el token de autenticación' });
    }

    // Construcción de la URL según la ruta (2 días o 4 días)
    const url = (route === "2d")
        ? `${API_URL}?idRuta=5&anio=${year}&mes=${month}&idLugar=2`
        : `${API_URL}?idRuta=1&anio=${year}&mes=${month}&idLugar=2`;
    
    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            httpsAgent // Deshabilita la verificación SSL en la petición
        });

        res.json({
            message: 'Datos obtenidos correctamente',
            data: response.data
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al conectar con la API de disponibilidad',
            error: error.message
        });
    }
});

// Iniciar el servidor en el puerto 5000
app.listen(5000, () => {
    console.log('Servidor corriendo en http://localhost:5000');
});
