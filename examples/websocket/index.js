#!/usr/bin/env node

const url = require('url');
const path = require('path');
const webpack = require('webpack');
const middleware = require('webpack-dev-middleware');
const express = require('express');
const expressWs = require('express-ws');
const { DemoServer, DemoServerConnection } = require('../demo-server');

const server = new DemoServer();

const app = express();
expressWs(app);

const compiler = webpack({
    mode: 'development',
    entry: path.join(__dirname, 'app.js'),
});

app.use(middleware(compiler, { }));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.ws('/ws', function(ws, req) {
    const serverConnection = new DemoServerConnection(server);

    ws.on('message', function (data) {
        process.stdout.write(Buffer.from(data).toString());
        try {
            serverConnection.send(data);
        }
        catch (err) {
            console.error('Error while processing WebSockets message:');
            console.error(err);
            ws.close();
        }
    });
    ws.on('close', function () {
        serverConnection.close();
    });

    serverConnection.on('data', function (data) {
        process.stdout.write(Buffer.from(data).toString());
        ws.send(Buffer.from(data));
    });
    serverConnection.on('close', function () {
        ws.close();
    });

    const remote = url.format({
        hostname: req.connection.remoteAddress,
        port: req.connection.remotePort
    });
    console.log(`WebSocket connection from ${remote}`);
});

const listener = app.listen(3000, () => {
    console.log(`Listening on http://localhost:${listener.address().port}/`);
});


const net = require('net');
const tcp_listener = net.createServer(function (socket) {
	const serverConnection = new DemoServerConnection(server);

	socket.on('data', function (data) {
		serverConnection.send(data);
	});
    socket.on('close', function () {
        serverConnection.close();
    });

	serverConnection.on('data', function (data) {
		socket.write(Buffer.from(data));
	});
	serverConnection.on('close', function () {
		socket.end();
	});
});

tcp_listener.listen(2000, '127.0.0.1', function () {
	const port = tcp_listener.address().port;
	console.log(`Listening on localhost:${port}. Try connecting with`);
	console.log(`    telnet localhost ${port}`);
});
