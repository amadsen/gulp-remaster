var test = require('tape'),
    remaster = require('../index.js'),
    gutil = require('gulp-util'),
    File = gutil.File;

test('eachFile handler called for each file when passed as an argument', function (assert) {
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

test('eachFile handler called for each file when passed as an option', function (assert) {
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

test('finish handler called once when passed as an argument', function (assert) {
  var count = 0,
      files = 3,
      expected = 1;
  var stream = remaster(null, function(done){
      count++;
      done();
  });

  stream.on('end', function(){
    assert.equal(count, expected, "Expected " + expected + " files and counted " + count);
    assert.end();
  });

  for (var i = 0; i < files; i++) {
    stream.write(
      new File({
        cwd: "/",
        base: "/test/",
        path: "/test/final_file_"+i+".txt",
        contents: new Buffer("This is test file content #" + i)
      })
    );
  }

  stream.end();
  stream.resume();
});

test('finish handler called once when passed as an option', function (assert) {
  var count = 0,
      files = 3,
      expected = 1;
  var stream = remaster({
    finish: function(done){
      count++;
      done();
    }
  });

  stream.on('end', function(){
    assert.equal(count, expected, "Expected " + expected + " files and counted " + count);
    assert.end();
  });

  for (var i = 0; i < files; i++) {
    stream.write(
      new File({
        cwd: "/",
        base: "/test/",
        path: "/test/options.final_file_"+i+".txt",
        contents: new Buffer("This is test file content #" + i)
      })
    );
  }

  stream.end();
  stream.resume();
});

test('finish handler called after all instances of eachFile handler', function (assert) {
  var count = 0,
      expected = 3;
  var stream = remaster({
    eachFile: function(file, done){
      count++;
      done(null, file);
    },
    finish: function(done){
      assert.equal(
        count,
        expected,
        "Expected " + expected + " files in finish handler and counted " + count
      );
      count = 0;
      done();
    }
  });

  stream.on('end', function(){
    assert.equal(count, 0, "Expected count reset to 0 by finish handler.");
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

test('Copy Vinyl files by default', function (assert) {
  var stream = remaster( function(file, done){
    if(file !== inputFile){
      assert.equal(
        file.contents.toString(),
        inputFile.contents.toString(),
        "Files are different objects, but contain the same string content."
      );
    }
    done(null, file);
  });

  var inputFile = new File({
    cwd: "/",
    base: "/test/",
    path: "/test/input_file.txt",
    contents: new Buffer("This is test file content")
  });

  stream.on('end', function(){
    assert.end();
  });

  stream.write(inputFile);

  stream.end();
  stream.resume();
});

test('`options.copy = false` disables copying Vinyl files', function (assert) {
  var stream = remaster( {
    copy: false,
    eachFile: function(file, done){
      assert.equal(file, inputFile, "Files are the same object.");
      done(null, file);
    }
  });

  var inputFile = new File({
    cwd: "/",
    base: "/test/",
    path: "/test/another_input_file.txt",
    contents: new Buffer("This is test file content")
  });

  stream.on('end', function(){
    assert.end();
  });

  stream.write(inputFile);

  stream.end();
  stream.resume();
});

test('`options.copy = <Vinyl File.clone() options>` works', function (assert) {
  var stream = remaster( {
    copy: {
      contents: false
    },
    eachFile: function(file, done){
      if(file !== inputFile){
        assert.equal(
          file.contents,
          inputFile.contents,
          "Files are different objects, but contents are the same Buffer."
        );
      }
      done(null, file);
    }
  });

  var inputFile = new File({
    cwd: "/",
    base: "/test/",
    path: "/test/yet_another_input_file.txt",
    contents: new Buffer("This is test file content")
  });

  stream.on('end', function(){
    assert.end();
  });

  stream.write(inputFile);

  stream.end();
  stream.resume();
});

test('Error when doing strict checking and stream data is not a Vinyl file', function (assert) {
  var stream = remaster({strict: true});

  stream.on('error', function(e){
    assert.pass("Recieved expected error.");
  });

  stream.on('end', function(){
    assert.end();
  });

  stream.write({
    cwd: "/",
    base: "/test/",
    path: "/test/not_vinyl_file.txt",
    contents: new Buffer("This is not a Vinyl file.")
  });

  stream.end();
  stream.resume();
});
