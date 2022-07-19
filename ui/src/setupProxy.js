const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(createProxyMiddleware('/api', {target: 'http://api:5000'}));
  app.use(createProxyMiddleware('/websocket', {target: 'http://api:5000', ws: true}));
};
