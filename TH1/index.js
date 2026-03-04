const http = require('http');
const fs = require('fs');
const path = require('path');

function sendFile(res, filename, statusCode = 200) {
    const filePath = path.join(__dirname, filename);
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end('Lỗi đọc file');
        }
        res.writeHead(statusCode, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data);
    });
}

const server = http.createServer((req, res) => {
    switch (req.url) {
        case '/':
            sendFile(res, 'home.html');
            break;
        case '/about':
            sendFile(res, 'about.html');
            break;
        case '/contact':
            sendFile(res, 'contact.html');
            break;
        default:
            sendFile(res, '404.html', 404);
    }
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});