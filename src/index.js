"use strict";

var config = require( "./config" )
  , logger = null
  , transpile;

var _transpile = function( mimosaConfig, options, next ) {
  if( !transpile ) {
    var esperanto = require( "esperanto" );
    if ( mimosaConfig.esperanto.isAMD ) {
      transpile = esperanto.toAmd;
    } else {
      transpile = esperanto.toCjs;
    }
  }

  if ( options.files && options.files.length ) {
    var e = mimosaConfig.esperanto;
    options.files.forEach( function( f ) {
      if ( e && e.excludeRegex && f.inputFileName.match( e.excludeRegex ) ) {
        logger.debug( "skipping esperanto transpiling for [[ " + f.inputFileName + " ]], file is excluded via regex" );
      } else {
        if ( e && e.exclude && e.exclude.indexOf( f.inputFileName ) > -1 ) {
          logger.debug( "skipping esperanto transpiling for [[ " + f.inputFileName + " ]], file is excluded via string path" );
        } else {
          if ( f.outputFileText ) {
            try {
              f.outputFileText = transpile( f.outputFileText, e.options || {} ).code;
            } catch ( err ) {
              mimosaConfig.log.error( "esperanto encountered a problem transpiling [[ " + f.inputFileName + " ]]\n" + err );
            }
          }
        }
      }
    });
  }

  next();
};

var registration = function( mimosaConfig, register ) {
  logger = mimosaConfig.log;
  register( [ "add", "update", "buildFile" ], "afterCompile", _transpile, mimosaConfig.extensions.javascript );
};

module.exports = {
  registration: registration,
  defaults:     config.defaults,
  placeholder:  config.placeholder,
  validate:     config.validate,
  resetTranspile:    function() {
    transpile = undefined;
  }
};
