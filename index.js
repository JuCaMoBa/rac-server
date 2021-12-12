const http = require('http');
const app = require('./server');
const fullDate = require('./server/config/date')
const config = require('./server/config/');
const { connect } = require('./server/database');

const { port, hostname, database } = config;

// Database
connect({
  protocol: database.protocol,
  url: database.url,
  username: database.username,
  password: database.password,
});

const server = http.createServer(app);
  

server.listen(port, hostname, () => {
  console.log(`server running in http://${hostname}:${port}/ server starts at ${fullDate}` );
});