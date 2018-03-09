const assert = require('assert');
const Plaintalk = require('../lib/plaintalk');
const BufferedPlaintalk = require('../lib/buffered-plaintalk');

describe('BufferedPlaintalk', function () {
    describe('simple messages', function () {
        const log = [];
        const decoder = new Plaintalk();
        const buf = new BufferedPlaintalk(decoder);
        buf.on('message', msg => log.push(msg.map(field => Buffer.from(field).toString())));

        decoder.write(Buffer.from('test\r\none two three\r\n'));
        assert.deepEqual(
            [
                [ "test" ],
                [ "one", "two", "three" ],
            ],
            log
        );
    });

    describe('escapes', function () {
        const log = [];
        const decoder = new Plaintalk();
        const buf = new BufferedPlaintalk(decoder);
        buf.on('message', msg => log.push(msg.map(field => Buffer.from(field).toString())));

        decoder.write(Buffer.from('t{1}e{1}s{1}t{1} me\r\n{12}one{1} two\r\n three\r\n'));
        assert.deepEqual(
            [
                [ "test me" ],
                [ "one{1} two\r\n", "three" ],
            ],
            log
        );
    });
});
