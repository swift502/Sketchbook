var gulp = require('gulp');
var concat = require('gulp-concat');
// var uglify = require('gulp-uglify');
var minify = require('gulp-minify');
//var uglifycss = require('gulp-uglifycss');
var cleanCSS = require('gulp-clean-css');

var styles = [
    './src/css/*',
];

var scripts = [

    './src/js/sys/ConfigProd.js',
    
    './src/js/lib/shaders/*',
    './src/js/lib/utils/*',

    './src/js/sys/Functions.js',

    './src/js/simulation/*',
    './src/js/characters/*',

    './src/js/sketchbook/Sketchbook.js',
    './src/js/sketchbook/SB_Input.js',
    './src/js/sketchbook/SB_GUI.js',
    './src/js/sketchbook/SB_CameraControls.js',
    './src/js/sketchbook/SB_GameModes.js',
    './src/js/sketchbook/SB_Characters.js',
    './src/js/sketchbook/SB_Three.js',
    './src/js/sketchbook/SB_Cannon.js',
    './src/js/sketchbook/SB_World.js',

    './src/js/Main.js',
];


function css() {
    return gulp.src(styles)
    .pipe(concat('sketchbook.css'))
    .pipe(gulp.dest('./docs/css/'));
}

function css_min() {
    return gulp.src(styles)
    .pipe(concat('sketchbook.min.css'))
    .pipe(cleanCSS())
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