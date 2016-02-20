# Gulp Remaster - "The Last Gulp Plugin"
Not the last gulp plugin anyone will ever write, but the last one that absolutely
must be written or the plugin of last resort. Remaster is a gulp plugin that
allows you to edit Vinyl files directly in your gulp task as they come through
the stream. Essentially it is a meta-plugin; if you can't find a plugin that
does what you need, use Remaster to get a hold of the Vinyl file objects
yourself and edit them.

You could also write a gulp plugin by wrapping Remaster.

## Use
Like other gulp plugins, Remaster is used by passing an invocation of Remaster
to the `.pipe()` method of a readable Vinyl stream. By default, Remaster
will behave much like [gulp-clone](https://github.com/mariocasciaro/gulp-clone)
in that it will make a clone of all Vinyl files found in the stream and pass
them on. A more useful invocation of Remaster will pass a file handler function
to be run on each file and, optionally, a final handler function to be invoked
after the last file is processed but before the stream is closed. There is also
an options object syntax that allows setting both handler functions and a few
other options.

If you wanted to build something like a simplistic [gulp-filter](https://github.com/sindresorhus/gulp-filter),
you could invoke Remaster something like this:

~~~javascript
var gulp = require('gulp'),
    remaster = require('gulp-remaster');

var filterPattern = /-test$/;

gulp.task('example', function(){
  return gulp.src("src/**/*.js")
    .pipe(remaster( function(file, done){
      if(file.isNull || filterPattern.test(file.stem)) {
        // remove file from the stream by calling the callback
        // without an error or a file.
        return done();
      }
      // pass the file on by passing it to the callback
      done(null, file);
    }))
    .pipe(gulp.dest("dest"));
})
~~~

## API
**`remaster( eachFileHandler[, finalHandler] )`** or **`remaster( options )`**

### `eachFileHandler( file[, encoding], callback )` or `eachFile`
Default: *internal passthrough file handler*
This is really just a thinly wrapped [through2](https://github.com/rvagg/through2/) [transform](https://github.com/rvagg/through2/#api) function. For
each file in the stream it receives either the `file` and a
`callback([err[, file]])` or the `file`, it's `encoding`, and a
`callback([err[, file]])`. Remaster will send an error to the `callback` if it
encounters a `file` that is not a [vinyl](https://github.com/gulpjs/vinyl) file
(i.e. what gulp streams usually contain.) The `callback` takes an `err` - for
reporting errors - and a `file`, which will be pushed to the stream. As with
[through2](https://github.com/rvagg/through2/), **this** is set to the stream,
so you may call `this.push(file)` instead of passing the file to the callback.

### `finalHandler(callback)` or `final`
Default: *undefined*
This is a thinly wrapped [through2](https://github.com/rvagg/through2/) [flush](https://github.com/rvagg/through2/#api) function. It receives a single
`callback([err])` which may be passed an error and should be called when you are
done with the stream.

### `copy`
Default: true
If truthy, Remaster will [clone](https://github.com/gulpjs/vinyl#cloneopt) all
Vinyl files passed through the stream before passing the clone to the eachFile
handler. If an object, it will be passed as an options object to [clone](https://github.com/gulpjs/vinyl#cloneopt).

### `RemasterError`
Default: *internal PluginError constructor*
This is the gulp-util PluginError constructor used to generate errors inside
Remaster. It is exposed here in case you want to use Remaster to simplify
writing your own gulp plugin. *In that case only*, set this to your own error
constructor.

## Additional Reading
Using Remaster is essentially [Writing a Gulp Plugin](https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/README.md).
You may find the section on [modifying file content](https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/README.md#modifying-file-content) particularly relevant. Keep in mind that Remaster is just as useful
for modifying Vinyl metadata as it is the file contents themselves.
