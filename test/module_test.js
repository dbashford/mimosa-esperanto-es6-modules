var sinon = require( "sinon" )
  , esparantoModule = require("../src")
  , defaults = require("../src").defaults()
  , registration = esparantoModule.registration
  , logger = require( 'logmimosa' )
  , _ = require('lodash')
  , mimosaConfig = {
    log: logger,
    extensions: {
      javascript: ['js']
    }
  }
  ;

mimosaConfig.esperanto = defaults.esperanto;
mimosaConfig.esperanto.isAMD = true;

describe("The esparanto module", function() {

  it("should expose the right four functions", function() {
    expect(esparantoModule.registration).to.exist;
    expect(esparantoModule.defaults).to.exist;
    expect(esparantoModule.placeholder).to.exist;
    expect(esparantoModule.validate).to.exist;
  });

  it("should register for all the right things", function(done) {
    var register = function( workflow, step, callback, extensions) {
      expect(workflow).to.eql([ "add", "update", "buildFile" ]);
      expect(step).to.eql("afterCompile");
      expect(extensions).to.eql([ "js" ]);
      done();
    };
    registration( mimosaConfig, register );
  });

  describe("when executed during a workflow", function() {

    var callback;

    before(function(done) {
      var register = function( workflow, step, cb, extensions) {
        callback = cb;
        done();
      };
      registration( mimosaConfig, register );
    });

    it("should call the callback when no files", function(done) {
      var mC = _.cloneDeep( mimosaConfig );
      var cb = sinon.spy();
      esparantoModule.resetTranspile();
      callback( mC, {files:[]}, cb );
      setTimeout(function(){
        expect(cb.called).to.equal(true);
        done();
      }, 200)
    });

    it("should transpile files", function(done) {
      var mC = _.cloneDeep( mimosaConfig );
      var options = {
        files:[{
          inputFileName: "/foo/bar/baz",
          outputFilename: "/a/b/c",
          inputFileText: "who cares",
          outputFileText: "import 'foo'"
        }]
      };
      esparantoModule.resetTranspile();
      callback( mC, options, function() {
        expect(options.files[0].outputFileText).to.eql(
          "define(['foo'],function () {\n\n\t'use strict';\n\n});");
        done();
      });
    });

    it("should transpile to commonjs", function(done) {
      var mC = _.cloneDeep( mimosaConfig );
      mC.esperanto.isAMD = false;
      var options = {
        files:[{
          inputFileName: "/foo/bar/baz",
          outputFilename: "/a/b/c",
          inputFileText: "who cares",
          outputFileText: "import 'foo'"
        }]
      };
      esparantoModule.resetTranspile();
      callback( mC, options, function() {
        expect(options.files[0].outputFileText).to.eql(
          "require('foo');");
        done();
      });
    });

    it("should transpile files without use strict when specified", function(done) {
      var mC = _.cloneDeep( mimosaConfig );
      var options = {
        files:[{
          inputFileName: "/foo/bar/baz",
          outputFilename: "/a/b/c",
          inputFileText: "who cares",
          outputFileText: "import 'foo'"
        }]
      };

      mC.esperanto.options.addUseStrict = false
      esparantoModule.resetTranspile();
      callback( mC, options, function() {
        expect(options.files[0].outputFileText).to.eql(
          "define(['foo'],function () {\n\n\t\n\n});");
        done();
      });
    });

    it("should transpile files with export", function(done) {
      var mC = _.cloneDeep( mimosaConfig );
      var options = {
        files:[{
          inputFileName: "/foo/bar/baz",
          outputFilename: "/a/b/c",
          inputFileText: "who cares",
          outputFileText: "import 'foo'\nexport default Foo;"
        }]
      };

      esparantoModule.resetTranspile();
      callback( mC, options, function() {
        expect(options.files[0].outputFileText).to.eql(
          "define(['foo'],function () {\n\n\t'use strict';\n\t\n\treturn Foo;\n\n});");
        done();
      });
    });

    it("should transpile files with export", function(done) {
      var mC = _.cloneDeep( mimosaConfig );
      var options = {
        files:[{
          inputFileName: "/foo/bar/baz",
          outputFilename: "/a/b/c",
          inputFileText: "who cares",
          outputFileText: "import 'foo'\nexport default Foo;"
        }]
      };

      mC.esperanto.options.defaultOnly = true;
      esparantoModule.resetTranspile();
      callback( mC, options, function() {
        expect(options.files[0].outputFileText).to.eql(
          "define(['foo'],function () {\n\n\t'use strict';\n\t\n\treturn Foo;\n\n});");
        done();
      });
    });

    it("should not transpile files excluded via regex", function(done) {
      var mC = _.cloneDeep( mimosaConfig );
      var options = {
        files:[{
          inputFileName: "/foo/bar/baz",
          outputFilename: "/a/b/c",
          inputFileText: "who cares",
          outputFileText: "import 'foo'\nexport default Foo;"
        }]
      };

      mC.esperanto.excludeRegex = new RegExp([/foo/].join("|"), "i");
      esparantoModule.resetTranspile();
      callback( mC, options, function() {
        expect(options.files[0].outputFileText).to.eql("import 'foo'\nexport default Foo;")

        done();
      });
    });


    it("should not transpile files excluded via string path", function(done) {
      var mC = _.cloneDeep( mimosaConfig );
      var options = {
        files:[{
          inputFileName: "/foo/bar/baz",
          outputFilename: "/a/b/c",
          inputFileText: "who cares",
          outputFileText: "import 'foo'\nexport default Foo;"
        }]
      };

      mC.esperanto.exclude = ["/foo/bar/baz"];
      esparantoModule.resetTranspile();
      callback( mC, options, function() {
        expect(options.files[0].outputFileText).to.eql("import 'foo'\nexport default Foo;")
        done();
      });
    });

  });
});
