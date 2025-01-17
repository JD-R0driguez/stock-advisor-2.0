export default async function handler(req, res) {

    const POLYGON_API_KEY = process.env.POLYGON_API_KEY; // Securely access your API key
    const polygonEndpoint = 'https://api.polygon.io/v2/aggs/ticker';

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }
    
    // Calculate the date range
    const endDate = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1); // 1 year back
    const formattedStartDate = startDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    try {
        // Fetch data for each ticker
        const responses = await Promise.all(
            req.body.map(async (ticker) => {
                const url = `${polygonEndpoint}/${ticker}/range/1/day/${formattedStartDate}/${endDate}?adjusted=true&sort=desc&apiKey=${POLYGON_API_KEY}`;
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`Failed to fetch data for ${ticker}`);
                }

                return {
                    ticker,
                    data: await response.json(),
                };
            })
        );
        console.log(responses)
        // Send the combined data
        res.status(200).json({ data: responses });
    } catch (error) {
        console.error('Polygon API error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
 
}

