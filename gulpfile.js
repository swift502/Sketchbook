var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var uglifycss = require('gulp-uglifycss');

var styles = [
    './src/css/*',
];

var scripts = [

    './src/js/sys/config/config_prod.js',
    
    './src/js/lib/shaders/*',
    './src/js/lib/utils/*',

    './src/js/simulation/*',
    './src/js/characters/*',

    './src/js/sys/functions.js',
    './src/js/sys/input.js',

    './src/js/sys/init/three_init.js',
    './src/js/sys/init/ammo_init.js',
    './src/js/sys/init/characters_init.js',
    './src/js/sys/init/world_init.js',

    './src/js/main.js',
    './src/js/sys/renderLoop.js'
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
    .pipe(uglify())
    .pipe(gulp.dest('./docs/js/'));
}

exports.js = js;
exports.js_min = js_min;
exports.css = css;
exports.css_min = css_min;


var build = gulp.parallel(css_min, js_min);
exports.build = build;
exports.default = build;