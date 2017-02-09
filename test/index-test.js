const { expect } = require('chai');
const { stub, match, assert, spy } = require('sinon');
const proxyquire = require('proxyquire');

describe('log-factory', () => {

  let logFactory, deps, instance;

  beforeEach(() => {
    instance = {
      debug: stub(),
      info: stub(),

      configure: stub()
    }

    deps = {
      'winston': {
        transports: {
          Console: stub().returns(instance)
        },
        loggers: {
          get: stub().returns(instance),
          has: stub().returns(false),
          add: stub().returns(instance),
          loggers: []
        }
      },
      'fs': {},
      'stack-trace': {}
    }

    logFactory = proxyquire('../lib', deps);
  });

  describe('init', () => {

    beforeEach(() => {
      logFactory.setDefaultLevel = stub();
    });

    it('inits via a level', () => {
      logFactory.init('silly');
      assert.calledWith(logFactory.setDefaultLevel, 'silly');
    });

    it('inits via an object', () => {
      logFactory.init({ app: 'silly' });
      assert.calledWith(logFactory.setDefaultLevel, 'silly');
    });
  });
});