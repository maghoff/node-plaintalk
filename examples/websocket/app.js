const EventEmitter = require('events');
const State = require('./state');
const ClientConnection = require('./client-connection');
const DictionaryProtocol = require('./dictionary-protocol');

function App() {
    this.state = new State();
    this.dom = {
        list: document.getElementById('word'),
        definition: document.getElementById('definition'),
        wsStatus: document.getElementById("ws-status"),
    };

    this.client = new ClientConnection(window.location.href.replace(/^http/, 'ws') + "ws");

    this.client.on('open', () => this._connected());
    this.client.on('close', () => this._connectionStatus('disconnected'));

    this.dict = new DictionaryProtocol(this.client);

    this.state.on('terms', terms => this._terms(terms));
    this.state.on('define', (term, definition) => this._updateDomList(term, definition));
    this.state.on('define', (term, definition) => this._updateDomDefinition(term, definition));

    this.dict.on('define', (term, definition) => {
        console.log(`Definition update: ${JSON.stringify(term)}: ${JSON.stringify(definition)}`);
        this.state.updateDefinition(term, definition);
    });

    this.dom.list.addEventListener('change', ev => this._selectTerm(ev));

    this._connectionStatus('connecting');
}

App.prototype._selectTerm = function (ev) {
    let term = ev.target.value;
    let definition = this.state.definitions[term] || this.dict.define(term);

    Promise.resolve(definition)
        .then(definition => {
            this.state.updateDefinition(term, definition);
            this.dom.definition.textContent = definition;
        })
        .catch(alert);
};

App.prototype._connected = function () {
    this._connectionStatus('loading');
    this.dict.list()
        .then(terms => {
            this.state.setTerms(terms);
            this._connectionStatus('connected');
        })
        .catch(alert);
};

App.prototype._terms = function (terms) {
    while (this.dom.list.firstChild) {
        this.dom.list.removeChild(this.dom.list.lastChild);
    }

    terms.sort();
    terms.forEach(term => {
        const option = document.createElement('option');
        option.textContent = term;
        this.dom.list.appendChild(option);
    });
};

App.prototype._updateDomList = function (term, definition) {
    let opt;
    for (opt = this.dom.list.firstChild; opt != null; opt = opt.nextSibling) {
        if (opt.textContent === term) return;
        if (opt.textContent > term) break;
    }
    const option = document.createElement('option');
    option.textContent = term;
    this.dom.list.insertBefore(option, opt);
};

App.prototype._updateDomDefinition = function (term, definition) {
    if (this.dom.list.value !== term) return;
    this.dom.definition.textContent = definition;
};

App.prototype._connectionStatus = function (status) {
    this.dom.wsStatus.textContent = status;
}

const APP = new App();
