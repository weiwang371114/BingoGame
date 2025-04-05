import http from 'http';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import { readFile } from 'fs/promises';

const PORT = 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = http.createServer(async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    // Get the file path
    let filePath = join(__dirname, req.url === '/' ? 'index.html' : req.url);
    
    // Get the file extension
    const ext = extname(filePath);
    
    // Set the content type based on file extension
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif'
    };
    
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    try {
        // Read and serve the file
        const content = await readFile(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
    } catch (err) {
        if (err.code === 'ENOENT') {
            // File not found
            res.writeHead(404);
            res.end('File not found');
        } else {
            // Server error
            console.error(err);
            res.writeHead(500);
            res.end('Server error');
        }
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
