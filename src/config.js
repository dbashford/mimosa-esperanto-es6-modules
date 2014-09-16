"use strict";

exports.defaults = function() {
  return {
    esperanto: {
      type:"amd",
      exclude: [/[/\\]vendor[/\\]/, /[/\\]main[\.-]/, /-main.js$/, /[/\\]common.js$/],
      options: {
        defaultOnly: true,
        addUseStrict: true
      }
    }
  };
};

exports.placeholder = function () {
  var ph = "\n  esperanto:\n" +
    "    type: 'amd'           # output type, either 'amd' or 'commonjs'\n" +
    "    exclude: [/[/\\\\]vendor[/\\]/, /[/\\\\]main[\.-]/, /-main.js$/, /[/\\\\]common.js$/]\n" +
    "                          # List of regexes or strings to match files that should be excluded from\n" +
    "                          # transpiling. String paths can be absolute or relative to the\n" +
    "                          # watch.sourceDir. Regexes are applied to the entire path.\n" +
    "    options:              # pass-through options to esperanto\n" +
    "                          # Details: https://github.com/Rich-Harris/esperanto/wiki\n" +
    "      defaultOnly: true   # whether to run esperanto in default only mode\n" +
    "      addUseStrict: true  # whether to add a 'use strict' pragma.\n\n";
  return ph;
};

exports.validate = function( config, validators ) {
  var errors = [];
  var e = config.esperanto;

  if ( !e ) {
    errors.push( "esperanto config must be present");
  } else {

    if ( validators.ifExistsIsObject( errors, "esperanto config", e ) ) {

      if ( validators.stringMustExist( errors, "esperanto.type", e.type ) ) {
        if ( ["amd","commonjs"].indexOf( e.type ) === -1 ) {
          errors.push( "esperanto.type must be either 'amd' or 'commonjs'" );
        } else {
          e.isAMD = true;
          if ( e.type === "commonjs" ) {
            e.isAMD = false;
          }
        }
      }

      validators.ifExistsFileExcludeWithRegexAndString( errors, "esperanto.exclude", e, config.watch.sourceDir );

      if ( validators.ifExistsIsObject( errors, "esperanto.options", e.options ) ) {
        validators.ifExistsIsBoolean( errors, "esperanto.options.defaultOnly", e.options.defaultOnly );
        validators.ifExistsIsBoolean( errors, "esperanto.options.addUseStrict", e.options.addUseStrict );
        validators.ifExistsIsString( errors, "esperanto.options.indent", e.options.indent );
      }
    }
  }

  return errors;
};
