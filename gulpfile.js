'use strict'

var $ = require('gulp-load-plugins')()
var gulp = require('gulp')
var ghPages = require('gh-pages')
var sequence = require('run-sequence')

var jekyll_config = './_config.yml'
var sources = {
  content: 'site/**/*.{markdown,md,html,txt}',
  styles: 'site/_assets/stylesheets/**/*.{less,css}',
  js: 'site/_assets/scripts/**/*.js',
  images: 'site/_assets/images/**/*'
}

gulp.task('clean', function (cb) {
  ghPages.clean()
  require('del')(['dist', '.gh-pages'], cb)
})

gulp.task('styles', function () {
  var glob = require('glob')

  return gulp.src('site/_assets/stylesheets/index.less')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.less())
    .pipe($.uncss({ html: glob.sync('dist/**/*.html') }))
    .pipe($.autoprefixer())
    .pipe($.minifyCss())
    .pipe($.sourcemaps.write('dist/assets/maps'))
    .pipe($.rename('styles.css'))
    .pipe(gulp.dest('dist/assets/'))
    .pipe($.size())
    .pipe($.connect.reload())
})

gulp.task('javascripts', function () {
  return gulp.src(sources.js)
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.concat('site.js'))
    .pipe($.uglify())
    .pipe($.sourcemaps.write('maps'))
    .pipe(gulp.dest('dist/assets/scripts'))
    .pipe($.size())
    .pipe($.connect.reload())
})

gulp.task('images', function () {
  return gulp.src(sources.images)
    .pipe($.plumber())
    .pipe(gulp.dest('dist/assets/images'))
    .pipe($.size())
    .pipe($.connect.reload())
})

gulp.task('jekyll', function (next) {
  var cmd = 'bundle exec jekyll build --config ' + jekyll_config

  require('child_process').exec(cmd, function (err, stdout, stderr) {
    console.log(stdout)
    console.error(stderr)
    next(err)
  })
})

gulp.task('html', ['jekyll'], function () {
  return gulp.src('dist/**/*.html')
    .pipe($.plumber())
    .pipe($.htmlmin({
      minifyJS: true,
      minifyCSS: true,
      removeComments: true,
      collapseWhitespace: true,
      conservativeCollapse: true,
      removeEmptyAttributes: true,
      collapseBooleanAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true
    }))
    .pipe(gulp.dest('dist'))
    .pipe($.size())
    .pipe($.connect.reload())
})

gulp.task('build', function () {
  sequence('html', 'styles', 'javascripts', 'images')
})

gulp.task('gh-pages', function (next) {
  var path = require('path')
  var config = {
    message: 'Deploy ' + new Date().toISOString()
  }

  ghPages.publish(path.join(__dirname, 'dist'), config, next)
})

gulp.task('deploy', function () {
  sequence('build', 'gh-pages')
})

gulp.task('connect', function () {
  $.connect.server({
    port: 9191,
    root: 'dist',
    livereload: true,
    fallback: 'dist/404.html'
  })
})

gulp.task('watch', function () {
  gulp.watch(sources.content, ['build'])
  gulp.watch(sources.styles, ['styles'])
  gulp.watch(sources.images, ['images'])
  gulp.watch(sources.js, ['javascripts'])
})

gulp.task('default', ['clean'], function () {
  sequence('build', 'watch', 'connect')
})
