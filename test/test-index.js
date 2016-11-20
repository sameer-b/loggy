import {Loggy} from '../dist/index';
import {assert} from 'chai';
import sinon from 'sinon';

/* global window */
/* global describe */
/* global it */

const mockConsole = {
    log: () => null,
    info: () => null,
    warn: () => null,
    error: () => null
};

global.window = {
    console: Object.assign({}, mockConsole)
};

describe('index.js tests', function() {

    it('should call override console.log', function() {
        const l = new Loggy(),
            spy = sinon.spy(l, 'log');
        l.init();
        window.console.log('Test');
        l.restore();
        assert.equal(spy.callCount,1);
    });

    it('should call native console.log', function() {
        const l = new Loggy(),
            spy = sinon.spy(window.console, 'log');
        l.init();
        window.console.log('Test');
        l.restore();
        assert.equal(spy.callCount, 1);
    });

    it('should override & restore successfully', function() {
        const l = new Loggy();
        assert.equal(window.console.log.toString(), 'log');
        l.init();
        assert.notEqual(window.console.log.toString(), 'log');
        l.restore();
        assert.equal(window.console.log.toString(), 'log');
    });

    it('should capture all logs', function() {
        const l = new Loggy(),
            logObj = [{
                logSeverityLevel: 4,
                logs: [{msg: 'foo'},{msg: 'bar'}]
            }, {
                logSeverityLevel: 4,
                logs: [{msg: 'mock'},{msg: 'hell'}]
            }];

        l.init();
        window.console.log('foo', 'bar');
        window.console.log('mock', 'hell');
        assert.equal(JSON.stringify(l.getLogs()), JSON.stringify(logObj));
        l.restore();
    });

    it('should call override console.info', function() {
        const l = new Loggy(),
            spy = sinon.spy(l, 'info');
        l.init();
        window.console.info('Test');
        l.restore();
        assert.equal(spy.callCount,1);
    });

    it('should call native console.info', function() {
        const l = new Loggy(),
            spy = sinon.spy(window.console, 'info');
        l.init();
        window.console.info('Test');
        l.restore();
        assert.equal(spy.callCount, 1);
    });

    it('should call override console.warn', function() {
        const l = new Loggy(),
            spy = sinon.spy(l, 'warn');
        l.init();
        window.console.warn('Test');
        l.restore();
        assert.equal(spy.callCount,1);
    });

    it('should call native console.warn', function() {
        const l = new Loggy(),
            spy = sinon.spy(window.console, 'warn');
        l.init();
        window.console.warn('Test');
        l.restore();
        assert.equal(spy.callCount, 1);
    });

    it('should call override console.error', function() {
        const l = new Loggy(),
            spy = sinon.spy(l, 'error');
        l.init();
        window.console.error('Test');
        l.restore();
        assert.equal(spy.callCount,1);
    });

    it('should call native console.error', function() {
        const l = new Loggy(),
            spy = sinon.spy(window.console, 'error');
        l.init();
        window.console.error('Test');
        l.restore();
        assert.equal(spy.callCount, 1);
    });

});
