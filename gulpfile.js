const gulp = require('gulp');
const ts = require('gulp-typescript');
const shell = require('gulp-shell');
const runseq = require('run-sequence');
const tslint = require('gulp-tslint');
const { remove } = require('fs-extra');
const merge = require('merge2');
const sourcemaps = require('gulp-sourcemaps');
const tsProject = ts.createProject('tsconfig.json');
const mocha = require('gulp-mocha');
const releaseHelper = require('release-helper');

//TODO: Add releaseHelper.init(gulp); - once it works w/ gulp 4.0

gulp.task('default', done => runseq('clean', 'build', done));

gulp.task('clean', done => {
  remove('./lib', done);
});

gulp.task('live-test', () => {
  return gulp.src('test/**/*.js', { read: false })
    .pipe(mocha())
    .on('error', () => { });
});

gulp.task('test', () => {
  return gulp.src('test/**/*.js', { read: false })
    .pipe(mocha())
    .once('error', () => {
      process.exit(1);
    })
    .once('end', () => {
      process.exit();
    })
});

gulp.task('watch', () => {
  return gulp.watch(
    ['src/**/*.ts', 'test/**/*.js'],
    gulp.series('build', 'live-test'));
});

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



