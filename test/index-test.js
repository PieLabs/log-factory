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
      'fs': {
        existsSync: stub(),
        readFileSync: stub()
      },
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

    let prepLoggers = (has) => {
      deps.winston.loggers.has.withArgs('app').returns(has);
      deps.winston.loggers.get.withArgs('app').returns(instance);
      deps.winston.loggers.add.withArgs('app').returns(instance);
      logFactory.init({ app: 'silly' });
    }


    let assertSetConfig = (run) => {

      it('calls logger.has', () => {
        run();
        assert.calledWith(deps.winston.loggers.has, 'app');
      });

      it('calls logger.configure', () => {
        run();
        assert.calledWith(instance.configure, {
          level: 'silly',
          transports: match.array
        });
      });


      it('calls logger.add if there is no logger', () => {
        run(false);
        assert.calledWith(deps.winston.loggers.add, 'app', {});
      });

      it('calls logger.get if there is a logger', () => {
        run(true);
        assert.calledWith(deps.winston.loggers.get, 'app');
      });

    }

    describe('with object', () => {

      let run = (has) => {
        prepLoggers(has);
        logFactory.init({ app: 'silly' });
      }
      assertSetConfig(run);
    });

    describe('with json string', () => {

      let run = (has) => {
        prepLoggers(has);
        logFactory.init(JSON.stringify({ app: 'silly' }));
      }
      assertSetConfig(run);
    });

    describe('with path to file', () => {
      let run = (has) => {
        prepLoggers(has);
        deps.fs.existsSync.returns(true);
        deps.fs.readFileSync.returns(JSON.stringify({ app: 'silly' }));
        logFactory.init('path/to/file');
      }

      assertSetConfig(run);
    });
  });
});