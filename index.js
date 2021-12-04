const http = require('http');
const app = require('./server');
const fullDate = require('./server/config/date')



const config = require('./server/config/');

const { port, hostname } = config;

const server = http.createServer(app);
  

server.listen(port, hostname, () => {
  console.log(`server running in http://${hostname}:${port}/ server starts at ${fullDate}` );
});