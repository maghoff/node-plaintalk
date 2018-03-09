const assert = require('assert');
const PlainTalk = require('../lib/plaintalk');

describe('PlainTalk', function () {
    describe('messageStart and messageEnd', function () {
        const log = [];
        const decoder = new PlainTalk();
        decoder.on('messageStart', () => log.push('messageStart'));
        decoder.on('messageEnd', () => log.push('messageEnd'));
        decoder.write(Buffer.from('waat\r\n'));

        assert.equal(log.length, 2);
        assert.equal(log[0], 'messageStart');
        assert.equal(log[1], 'messageEnd');
    });

    describe('messageStart and fieldStart', function () {
        const log = [];
        const decoder = new PlainTalk();
        decoder.on('messageStart', () => log.push('messageStart'));
        decoder.on('fieldStart', () => log.push('fieldStart'));
        decoder.write(Buffer.from('waat\r\n'));

        assert.equal(log.length, 2);
        assert.equal(log[0], 'messageStart');
        assert.equal(log[1], 'fieldStart');
    });

    describe('fieldStart and fieldEnd', function () {
        const log = [];
        const decoder = new PlainTalk();
        decoder.on('fieldStart', () => log.push('fieldStart'));
        decoder.on('fieldEnd', () => log.push('fieldEnd'));
        decoder.write(Buffer.from('waat\r\n'));

        assert.equal(log.length, 2);
        assert.equal(log[0], 'fieldStart');
        assert.equal(log[1], 'fieldEnd');
    });

    describe('fieldData', function () {
        const log = [];
        const decoder = new PlainTalk();
        decoder.on('fieldData', data => log.push(data));
        decoder.write(Buffer.from('waat\r\n'));

        assert.equal(log.length, 1);
        assert(log[0].equals(Buffer.from('waat')));
    });

    describe('fieldData chunks', function () {
        const log = [];
        const decoder = new PlainTalk();
        decoder.on('fieldData', data => log.push(data));
        decoder.write(Buffer.from('wa'));
        decoder.write(Buffer.from('at\r\n'));

        assert.equal(log.length, 2);
        assert(log[0].equals(Buffer.from('wa')));
        assert(log[1].equals(Buffer.from('at')));
    });

    describe('fieldData escaped', function () {
        const log = [];
        const decoder = new PlainTalk();
        decoder.on('fieldData', data => log.push(data));
        decoder.write(Buffer.from('waat{2} nice!\r\n'));

        const concat = Buffer.concat(log);
        assert(concat.equals(Buffer.from('waat nice!')));
    });
});
