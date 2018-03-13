const EventEmitter = require('events');
const { PlainTalk, BufferedPlaintalk, PlainTalkGenerator } = require('../../');

function ClientConnection(url) {
    this.url = url;
    this.socket = null;

    this.decoder = new PlainTalk();
    this.buf = new BufferedPlaintalk(this.decoder);
    this.buf.on('message', msg => this._message(msg));

    this.gen = new PlainTalkGenerator();
    this.gen.on('data', data => this.socket.send(data));

    this.callbacks = [];
    this.msgId = 0;

    this._connect();
}
ClientConnection.prototype = Object.create(EventEmitter.prototype);

ClientConnection.prototype._connect = function () {
    if (this.socket) return false;

    this.socket = new WebSocket(this.url);
    this.socket.binaryType = "arraybuffer";

    this.socket.addEventListener('open', () => this._socketOpen());
    this.socket.addEventListener('close', () => this._socketClose());
    this.socket.addEventListener('message', msg => this.decoder.write(Buffer.from(msg.data)));
};

ClientConnection.prototype._message = function (msg) {
    console.log('Received', msg);

    if (!this.socket) return; // There were things already in the in-buffer

    const id = Buffer.from(msg[0]);

    if (id.equals(Buffer.from('*'))) {
        this.emit('event', msg.slice(1));
        return;
    }

    const index = this.callbacks.findIndex(cb => id.equals(cb.id));
    if (index < 0) throw new Error(`Logic error: missing callback for ID ${JSON.stringify(id)}`);

    const { resolve, reject } = this.callbacks.splice(index, 1)[0];
    if (!this.callbacks.length) this.msgId = 0;

    const status = Buffer.from(msg[1]).toString();
    const rest = msg.slice(2);

    if (status === 'ok') resolve(rest);
    else if (status === 'error') reject(rest);
    else {
        this.emit('error', `Protocol error, unexpected status: ${JSON.stringify(status)}`);
        this._close();
    }
};

ClientConnection.prototype._socketOpen = function () {
    this.emit('open');
};

ClientConnection.prototype._socketClose = function () {
    this.emit('close');
};

ClientConnection.prototype._close = function () {
    if (!this.socket) return false;

    this.socket.close();
    this.socket = null;

    return true;
};

ClientConnection.prototype.send = function (msg) {
    const id = Buffer.from((this.msgId++).toString());
    this.gen.message([id].concat(msg.map(Buffer.from)));
    return new Promise((resolve, reject) => {
        this.callbacks.push({ id, resolve, reject });
    });
};

module.exports = ClientConnection;
