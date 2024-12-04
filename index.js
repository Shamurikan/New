const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve the index.html file for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint to search videos on YouTube
app.post('/search', async (req, res) => {
    const { query } = req.body;

    if (!query) {
        return res.status(400).send('Missing search query');
    }

    const API_KEY = 'AIzaSyCYdYjg5kUxEj8c4-A9BJhBzLRvPf8zkyE'; // Replace with your YouTube API key
    const SEARCH_URL = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&key=${API_KEY}&maxResults=50`;

    try {
        const response = await axios.get(SEARCH_URL);
        const results = response.data.items.map((item) => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
        }));

        res.json(results); // Send the results to the front-end
    } catch (error) {
        console.error('Error fetching search results:', error.message);
        res.status(500).send('Failed to fetch search results');
    }
});

// Endpoint to get the audio stream URL
app.post('/download-audio', (req, res) => {
    const { videoId } = req.body;

    if (!videoId) {
        console.error('Missing videoId');
        return res.status(400).send('Missing videoId');
    }

    const command = `yt-dlp -g "https://www.youtube.com/watch?v=${videoId}"`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('Error getting audio stream URL:', stderr);
            return res.status(500).send('Failed to get audio stream URL');
        }

        const streamUrl = stdout.trim();
        res.json({ streamUrl });
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
