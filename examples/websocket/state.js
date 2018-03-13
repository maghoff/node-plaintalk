const EventEmitter = require('events');

function State() {
    this.definitions = {};
}
State.prototype = Object.create(EventEmitter.prototype);

State.prototype.setTerms = function (terms) {
    terms.forEach(
        term => this.definitions[term] = this.definitions[term] || null
    );
    this.emit('terms', terms);
};

State.prototype.updateDefinition = function (term, definition) {
    this.definitions[term] = definition;
    this.emit('define', term, definition);
};

module.exports = State;
