"use strict";

var through = require("through2"),
    gutil = require("gulp-util"),
    File = gutil.File;

function RemasterError (msg, otps) {
  return gutil.PluginError("gulp-remaster", msg, opts);
}

module.exports = remaster;

function remaster(fileFn, endFn) {
  var options,
      stream;

  if(arguments.length === 1 && "function" !== typeof fileFn){
    options = fileFn;
  } else {
    // Create options from fileFn and finish
    options = {
      eachFile: fileFn,
      finish: endFn
    };
  }

  // set our default PluginError constructor
  if("function" !== typeof options.RemasterError){
    options.RemasterError = RemasterError;
  }

  // set our default file handler, if needed
  if("function" !== typeof options.eachFile){
    options.eachFile = passthroughFileFn;
  }

  // by default, we copy files that come through the stream
  if(!options.hasOwnProperty('copy')){
    options.copy = true;
  }

  function filesHandler (file, enc, done) {
    var copyOpts,
        args = [done],
        fn = options.eachFile;

    // make sure it is a Vinyl file
    if(!File.isVinyl(file)){
      done( new options.RemasterError("Received an object which is not a Vinyl file!") );
    }

    // copy Vinyl file
    if (options.copy) {
      copyOpts = ("object" === typeof options.copy && !Array.isArray(options.copy))?
        options.copy : undefined;
      file = file.clone(copyOpts);
    }

    if(fn.length > 2){
      args.unshift(enc);
    }
    args.unshift(file);

    return fn.apply(this, args);
  };

  if(options.finish && ("function" !== typeof options.finish || options.finish.length !== 1)){
    // throw an error complaining about improper finish function
    throw new options.RemasterError("Invalid finish handler provided!");
  }

  stream = through.obj(filesHandler, options.finish);
  return stream;
}

function passthroughFileFn (file, enc, done) {
  done(null, file);
}
