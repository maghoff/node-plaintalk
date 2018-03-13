const EventEmitter = require('events');

function mapError(msg) {
    return Promise.reject({
        code: Buffer.from(msg[0]).toString(),
        description: Buffer.from(msg[1]).toString(),
    });
}

function DictionaryProtocol(client) {
    this.client = client;

    client.on('event', msg => this._event(msg));
}
DictionaryProtocol.prototype = Object.create(EventEmitter.prototype);

DictionaryProtocol.prototype.list = function () {
    return this.client.send(["list"])
        .then(terms => terms.map(x => Buffer.from(x).toString()))
        .catch(mapError);
};

DictionaryProtocol.prototype.define = function (term) {
    return this.client.send(["define", term])
        .then(args => Buffer.from(args[0]).toString())
        .catch(mapError);
};

DictionaryProtocol.prototype._event = function (msg) {
    switch (Buffer.from(msg[0]).toString()) {
        case 'define': {
            const term = Buffer.from(msg[1]).toString();
            const definition = Buffer.from(msg[2]).toString();
            this.emit('define', term, definition);
            break;
        }
    }
};

module.exports = DictionaryProtocol;
