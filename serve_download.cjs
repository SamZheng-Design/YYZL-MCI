const http = require('http');
const fs = require('fs');
const path = require('path');

const filePath = '/home/user/webapp/zhongliu_performance_optimization_prompts.docx';
const fileName = 'zhongliu_performance_optimization_prompts.docx';

const server = http.createServer((req, res) => {
  if (req.url === '/download') {
    const stat = fs.statSync(filePath);
    res.writeHead(200, {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': stat.size,
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif">
      <a href="/download" style="padding:20px 40px;background:#b91c1c;color:white;border-radius:12px;text-decoration:none;font-size:18px">
        📄 下载：中流通性能优化 Prompts.docx
      </a></body></html>`);
  }
});

server.listen(8899, '0.0.0.0', () => console.log('Download server on :8899'));
