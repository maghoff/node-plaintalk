#!/usr/bin/env node

const net = require('net');
const { DemoServer, DemoServerConnection } = require('../demo-server');

const server = new DemoServer();

const listener = net.createServer(function (socket) {
	const serverConnection = new DemoServerConnection(server);

	socket.on('data', function (data) {
		serverConnection.send(data);
	});

	serverConnection.on('data', function (data) {
		socket.write(Buffer.from(data));
	});
	serverConnection.on('close', function () {
		socket.end();
	});
});

listener.listen(2000, '127.0.0.1', function () {
	const port = listener.address().port;
	console.log(`Listening on localhost:${port}. Try connecting with`);
	console.log(`    telnet localhost ${port}`);
});
