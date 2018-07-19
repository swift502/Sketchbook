var gulp = require('gulp');
var concat = require('gulp-concat');
// var uglify = require('gulp-uglify');
var minify = require('gulp-minify');
var uglifycss = require('gulp-uglifycss');

var styles = [
    './src/css/*',
];

var scripts = [

    './src/js/sys/config/ConfigProd.js',
    
    './src/js/lib/shaders/*',
    './src/js/lib/utils/*',

    './src/js/sys/GlobalVariables.js',
    './src/js/sys/Functions.js',
    './src/js/sys/Input.js',

    './src/js/game_modes/*',
    './src/js/simulation/*',
    './src/js/characters/*',

    './src/js/init/InitCharacters.js',
    './src/js/init/InitThree.js',
    './src/js/init/InitCannon.js',
    './src/js/init/InitWorld.js',

    './src/js/sys/Debug.js',
    './src/js/Main.js',
    './src/js/sys/RenderLoop.js'
];


function css() {
    return gulp.src(styles)
    .pipe(concat('sketchbook.css'))
    .pipe(gulp.dest('./docs/css/'));
}

function css_min() {
    return gulp.src(styles)
    .pipe(concat('sketchbook.min.css'))
    .pipe(uglifycss())
    .pipe(gulp.dest('./docs/css/'));
}

function js() {
    return gulp.src(scripts)
    .pipe(concat('sketchbook.js'))
    .pipe(gulp.dest('./docs/js/'));
}

function js_min() {
    return gulp.src(scripts)
    .pipe(concat('sketchbook.min.js'))
    .pipe(minify({
        ext:{
            min:'.js'
        }
    }))
    .pipe(gulp.dest('./docs/js/'));
}

exports.js = js;
exports.js_min = js_min;
exports.css = css;
exports.css_min = css_min;


var build = gulp.parallel(css_min, js_min);
exports.build = build;
exports.default = build;