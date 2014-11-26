var validators = require("validatemimosa");
var validate = require("../src").validate;
var defaults = require("../src").defaults();

describe("module validation", function() {
  it("should pass when the defaults are left alone", function( ){
    var config = {
      watch: {
        sourceDir: "foo"
      }
    };
    config.esperanto = defaults.esperanto;

    var errors = validate(config, validators);
    expect(errors.length).to.eql(0);
  });

  it("should set the isAMD flag to true with defaults", function( ){
    var config = {
      watch: {
        sourceDir: "foo"
      }
    };
    config.esperanto = defaults.esperanto;

    var errors = validate(config, validators);
    expect(config.esperanto.isAMD).to.exist;
    expect(config.esperanto.isAMD).to.be.true;
  });

  it("should set the isAMD flag to false with commonjs", function( ){
    var config = {
      watch: {
        sourceDir: "foo"
      }
    };
    config.esperanto = defaults.esperanto;
    config.esperanto.type = "commonjs"

    var errors = validate(config, validators);
    expect(config.esperanto.isAMD).to.exist;
    expect(config.esperanto.isAMD).to.be.false;
  });

  it("should fail if esperanto config is empty", function( ){
    var config = {
      watch: {
        sourceDir: "foo"
      },
      esperanto:{}
    };

    var errors = validate( config, validators );
    expect( errors.length ).to.eql( 1 );
    expect( errors[0] ).to.eql( "esperanto.type must be present." );
  });

  it("should fail if esperanto isn't an object", function( ){
    var config = {
      watch: {
        sourceDir: "foo"
      },
      esperanto:4
    };
    var errors = validate( config, validators );
    expect( errors.length ).to.eql( 1 );
    expect( errors[0] ).to.eql( "esperanto config must be an object." );
  });

  it("should fail if esperanto.type isn't a string", function( ){
    var config = {
      watch: {
        sourceDir: "foo"
      },
      esperanto: {
        type: 0
      }
    };
    var errors = validate( config, validators );
    expect( errors.length ).to.eql( 1 );
    expect( errors[0] ).to.eql( "esperanto.type must be a string." );
  });

  it("should fail if esperanto.type is the wrong string", function( ){
    var config = {
      watch: {
        sourceDir: "foo"
      },
      esperanto: {
        type: "foo"
      }
    };
    var errors = validate( config, validators );
    expect( errors.length ).to.eql( 1 );
    expect( errors[0] ).to.eql( "esperanto.type must be either 'amd' or 'commonjs'" );
  });

  it("should fail when options are not an object", function( ){
    var config = {
      watch: {
        sourceDir: "foo"
      },
      esperanto: {
        type: "amd",
        options: 5
      }
    };
    var errors = validate( config, validators );
    expect( errors.length ).to.eql( 1 );
    expect( errors[0] ).to.eql( "esperanto.options must be an object." );
  });

  it("should fail with many errors for options when options are bad", function( ){
    var config = {
      watch: {
        sourceDir: "foo"
      },
      esperanto: {
        type: "amd",
        options: {
          strict: 2,
          indent: 3
        }
      }
    };
    var errors = validate( config, validators );
    expect( errors.length ).to.eql( 2 );
    expect( errors[0] ).to.eql( "esperanto.options.strict must be a boolean." );
    expect( errors[1] ).to.eql( "esperanto.options.indent must be a string." );
  });
});