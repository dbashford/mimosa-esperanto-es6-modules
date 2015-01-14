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

    var test = function(desc, outputFileText, output, strict, amd, otherOpts) {
      it(desc, function(done) {
        var mC = _.cloneDeep( mimosaConfig );
        mC.esperanto.options.strict = strict;
        mC.esperanto.isAMD = amd;
        if ( otherOpts ) {
          mC.esperanto = _.merge( mC.esperanto, otherOpts );
        }
        var options = {
          files:[{
            inputFileName: "/foo/bar/baz",
            outputFileName: "/a/b/c",
            inputFileText: "who cares",
            outputFileText: outputFileText
          }]
        };
        esparantoModule.resetTranspile();
        callback( mC, options, function() {
          expect(options.files[0].outputFileText).to.eql(output);
          done();
        });
      });
    };

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

    test("should transpile files",
      "import 'foo'",
      "define(['foo'], function () {\n\n\t'use strict';\n\n});",
      true,
      true);

    // WITHOUT EXPORTS

    test("should transpile to commonjs without strict mode",
      "import bar from 'foo'\nvar foo = \"yeah\"\nbar.what();",
      "'use strict';\n\nvar bar = require('foo');\nvar foo = \"yeah\"\nbar.what();",
      false,
      false);

    test("should transpile to commonjs with strict mode",
      "import bar from 'foo'\nvar foo = \"yeah\";\nbar.what();",
      "'use strict';\n\nvar bar = require('foo');\n\nvar foo = \"yeah\";\nbar['default'].what();",
      true,
      false);

    test("should transpile to amd with strict mode",
      "import bar from 'foo'\nvar foo = \"yeah\";\nbar.what();",
      "define(['foo'], function (bar) {\n\n\t'use strict';\n\n\tvar foo = \"yeah\";\n\tbar['default'].what();\n\n});",
      true,
      true);

    test("should transpile to amd without strict mode",
      "import bar from 'foo'\nvar foo = \"yeah\";\nbar.what();",
      "define(['foo'], function (bar) {\n\n\t'use strict';\n\n\tvar foo = \"yeah\";\n\tbar.what();\n\n});",
      false,
      true);

    // WITH EXPORTS

    test("should transpile to commonjs without strict mode with default exports",
      "import bar from 'foo'\nvar foo = \"yeah\"\nbar.what();\nexport default bar",
      "'use strict';\n\nvar bar = require('foo');\nvar foo = \"yeah\"\nbar.what();\nmodule.exports = bar",
      false,
      false);

    test("should transpile to commonjs with strict mode with default exports",
      "import bar from 'foo'\nvar foo = \"yeah\";\nbar.what();\nexport default bar",
      "'use strict';\n\nvar bar = require('foo');\n\nvar foo = \"yeah\";\nbar['default'].what();\nexports['default'] = bar['default']",
      true,
      false);

    test("should transpile to amd with strict mode with default exports",
      "import bar from 'foo'\nvar foo = \"yeah\";\nbar.what();\nexport default bar",
      "define(['exports', 'foo'], function (exports, bar) {\n\n\t'use strict';\n\n\tvar foo = \"yeah\";\n\tbar['default'].what();\n\texports['default'] = bar['default']\n\n});",
      true,
      true);

    // exporting variable rather than previous import
    test("should transpile to amd with strict mode with default exports",
      "import bar from 'foo'\nvar something = \"yeah\";\nbar.what();\nexport default something",
      "define(['exports', 'foo'], function (exports, bar) {\n\n\t'use strict';\n\n\tvar something = \"yeah\";\n\tbar['default'].what();\n\texports['default'] = something\n\n});",
      true,
      true);

    test("should transpile to amd without strict mode with default exports",
      "import bar from 'foo'\nvar foo = \"yeah\";\nbar.what();\nexport default bar",
      "define(['foo'], function (bar) {\n\n\t'use strict';\n\n\tvar foo = \"yeah\";\n\tbar.what();\n\n\treturn bar;\n\n});",
      false,
      true);

    // EXCLUDE TESTS

    test("should not transpile files excluded via regex",
      "import 'foo'\nexport default Foo;",
      "import 'foo'\nexport default Foo;",
      true,
      true,
      { excludeRegex: new RegExp([/foo/].join("|"), "i")});

    test("should not transpile files excluded via regex",
      "import 'foo'\nexport default Foo;",
      "import 'foo'\nexport default Foo;",
      true,
      true,
      { exclude: ["/foo/bar/baz"] });
  });
});
