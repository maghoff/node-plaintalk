const assert = require('assert');
const PlainTalkGenerator = require('../lib/plaintalk-generator');

describe('PlainTalkGenerator', function () {
    describe('basic', function () {
        const log = [];
        const gen = new PlainTalkGenerator();
        gen.on('data', buf => log.push(buf));

        gen.startMessage();
        gen.startField();
        gen.fieldData(Buffer.from("waat"));
        gen.endField();
        gen.endMessage();

        const output = Buffer.concat(log).toString();
        assert.equal(output, "waat\n");
    });

    describe('escaping', function () {
        const log = [];
        const gen = new PlainTalkGenerator();
        gen.on('data', buf => log.push(buf));

        gen.startMessage();
        gen.startField();
        gen.fieldData(Buffer.from("wa"));
        gen.fieldData(Buffer.from("at"));
        gen.endField();
        gen.startField();
        gen.fieldData(Buffer.from("needs escaping"));
        gen.endField();
        gen.endMessage();

        const output = Buffer.concat(log).toString();
        assert.equal(output, "waat {14}needs escaping\n");
    });
});
