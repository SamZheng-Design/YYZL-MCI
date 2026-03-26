const http = require('http');
const fs = require('fs');
const filePath = '/home/user/webapp/bible_v2.2.docx';
const server = http.createServer((req, res) => {
  const stat = fs.statSync(filePath);
  res.writeHead(200, {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'Content-Disposition': 'attachment; filename="bible_v2.2.docx"',
    'Content-Length': stat.size,
    'Access-Control-Allow-Origin': '*'
  });
  fs.createReadStream(filePath).pipe(res);
});
server.listen(8899, '0.0.0.0', () => console.log('V2.2 download server on :8899'));
