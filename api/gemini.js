// Handler para función serverless que conecta con la API de Gemini
export default async function handler(req, res) {
    // Solo permite el método POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        // Realiza la petición a la API de Gemini usando la API_KEY del entorno
        const response = await fetch(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=' + process.env.API_KEY,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(req.body)
            }
        );

        // Parsea la respuesta y la envía al cliente
        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        // Manejo de errores: log y respuesta 500
        console.error('Error en función serverless:', error);
        return res.status(500).json({ error: 'Error interno' });
    }
}
