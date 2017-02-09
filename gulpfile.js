const gulp = require('gulp');
const ts = require('gulp-typescript');
const shell = require('gulp-shell');
const runseq = require('run-sequence');
const tslint = require('gulp-tslint');
const { remove } = require('fs-extra');
const merge = require('merge2');
const sourcemaps = require('gulp-sourcemaps');

const paths = {
  tscripts: {
    src: ['src/**/*.ts'],
    dest: 'lib'
  }
};

gulp.task('default', done => runseq('clean', 'build', done));

// ** Running ** //

gulp.task('run', shell.task([
  'node lib/index.js'
]));

gulp.task('clean', done => {
  remove('./lib', done);
});

// ** Watching ** //

gulp.task('watch', function () {
  gulp.watch(paths.tscripts.src, ['compile:typescript']);
});

gulp.task('watchrun', function () {
  gulp.watch(paths.tscripts.src, runseq('compile:typescript', 'run'));
});

let tsProject = ts.createProject('tsconfig.json');

// ** Compilation ** //

gulp.task('build', function () {

  let tsResult = gulp.src('src/**/*.ts') // or tsProject.src()
    .pipe(sourcemaps.init())
    .pipe(tsProject());

  let js = tsResult.js
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('lib'));

  let dts = tsResult.dts
    .pipe(gulp.dest('lib'));

  return merge([
    js,
    dts
  ]);
});



