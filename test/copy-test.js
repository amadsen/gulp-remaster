var test = require('tape'),
    remaster = require('../index.js'),
    gutil = require('gulp-util'),
    File = gutil.File;

test('eachFile handler called for each file when passed as argument', function (assert) {
  var count = 0,
      expected = 3;
  var stream = remaster( function(file, done){
    count++;
    done(null, file);
  });

  stream.on('end', function(){
    assert.equal(count, expected, "Expected " + expected + " files and counted " + count);
    assert.end();
  });

  for (var i = 0; i < expected; i++) {
    stream.write(
      new File({
        cwd: "/",
        base: "/test/",
        path: "/test/eachFile_file_"+i+".txt",
        contents: new Buffer("This is test file content #" + i)
      })
    );
  }

  stream.end();
  stream.resume();
});

test('eachFile handler called for each file when passed as option', function (assert) {
  var count = 0,
      expected = 3;
  var stream = remaster({
    eachFile: function(file, done){
      count++;
      done(null, file);
    }
  });

  stream.on('end', function(){
    assert.equal(count, expected, "Expected " + expected + " files and counted " + count);
    assert.end();
  });

  for (var i = 0; i < expected; i++) {
    stream.write(
      new File({
        cwd: "/",
        base: "/test/",
        path: "/test/option.eachFile_file_"+i+".txt",
        contents: new Buffer("This is test file content #" + i)
      })
    );
  }

  stream.end();
  stream.resume();
});
