import createBareServer from '@tomphttp/bare-server-node';
import express from 'express';
import http from 'node:http';
import YAML from 'yaml';
import fs from 'fs';
import path from 'path';
import { createProxyMiddleware } from 'http-proxy-middleware';
const __dirname = path.resolve();
const settings = YAML.parse(fs.readFileSync(path.join(__dirname, '/config/settings.yml'), 'utf8'));

const httpServer = http.createServer();

const app = express();

app.use('/', createProxyMiddleware({
    target: 'http://localhost:9292',
    changeOrigin: false,
    logLevel: 'silent',
}));

const bareServer = createBareServer('/bare/');

httpServer.on('request', (req, res) => {
	if (bareServer.shouldRoute(req)) {
		bareServer.routeRequest(req, res);
	} else {
		app(req, res);
	}
});

httpServer.on('upgrade', (req, socket, head) => {
	if (bareServer.shouldRoute(req)) {
		bareServer.routeUpgrade(req, socket, head);
	} else {
		socket.end();
	}
});

httpServer.on('listening', () => {
	console.log('Server listening on port ' + settings.port);
});

httpServer.listen({
	port: settings.port,
});
