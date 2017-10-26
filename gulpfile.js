'use strict'

const $ = require('gulp-load-plugins')()
const gulp = require('gulp')
const ghPages = require('gh-pages')
const sequence = require('run-sequence')
const browserSync = require('browser-sync').create()

const jekyll_config = './_config.yml'
const sources = {
  content: 'site/**/*.{markdown,md,html,txt,yml}',
  styles: 'site/_assets/stylesheets/**/*.{less,css}',
  js: 'site/_assets/scripts/**/*.js',
  images: 'site/_assets/images/**/*',
  fonts: 'site/_assets/fonts/**/*',
  files: 'site/_assets/files/**/*'
}

gulp.task('clean', (cb) => {
  ghPages.clean()
  return require('del')(['dist', '.gh-pages'])
})

gulp.task('styles', () => {
  const glob = require('glob')

  return gulp.src('site/_assets/stylesheets/index.less')
    .pipe($.plumber())
    // .pipe($.sourcemaps.init())
    .pipe($.less())
    //.pipe($.uncss({ html: glob.sync('dist/**/*.html') }))
    .pipe($.autoprefixer())
    .pipe($.minifyCss())
    // .pipe($.sourcemaps.write('dist/assets/maps'))
    .pipe($.rename('styles.css'))
    .pipe(gulp.dest('dist/assets/css'))
    .pipe($.size())
    .pipe(browserSync.stream())
})

gulp.task('javascripts', () => {
  return gulp.src(sources.js)
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.concat('site.js'))
    .pipe($.uglify())
    .pipe($.sourcemaps.write('maps'))
    .pipe(gulp.dest('dist/assets/scripts'))
    .pipe($.size())
    .pipe(browserSync.stream())
})

gulp.task('imagemin', () => {
  return gulp.src(sources.images)
    .pipe($.imagemin({ progressive: true }))
    .pipe(gulp.dest('site/_assets/images'))
})

gulp.task('images', () => {
  return gulp.src(sources.images)
    .pipe($.plumber())
    .pipe(gulp.dest('dist/assets/images'))
    .pipe($.size())
    .pipe(browserSync.stream())
})

gulp.task('fonts', () => {
  return gulp.src(sources.fonts)
    .pipe($.plumber())
    .pipe(gulp.dest('dist/assets/font'))
    .pipe($.size())
    .pipe(browserSync.stream())
})

gulp.task('files', () => {
  return gulp.src(sources.files)
    .pipe($.plumber())
    .pipe(gulp.dest('dist/assets/files'))
    .pipe($.size())
    .pipe(browserSync.stream())
})

gulp.task('jekyll', (cb) => {
  const cmd = `bundle exec jekyll build --config ${jekyll_config}`

  require('child_process').exec(cmd, function (err, stdout, stderr) {
    console.log(stdout)
    console.error(stderr)
    cb(err)
  })
})

gulp.task('html', ['jekyll'], () => {
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
    .pipe(browserSync.stream())
})

gulp.task('rev', () => {
  var filter = $.filter('**/*.{js,css,jpg}', {restore: true})

  return gulp.src('dist/**/*')
    .pipe(filter)
    .pipe($.rev())
    .pipe(filter.restore)
    .pipe($.revReplace())
    .pipe(gulp.dest('dist'))
})

gulp.task('build', ['clean'], (cb) => {
  sequence('html', 'styles', 'javascripts', 'images', 'fonts', 'files', 'rev', cb)
})

gulp.task('gh-pages', (cb) => {
  const path = require('path')
  const cmd = 'git rev-parse --short HEAD'

  require('child_process').exec(cmd, (err, stdout, stderr) => {
    if (err) {
      cb(err)
    }

    ghPages.publish(path.join(__dirname, 'dist'), {
      message: `Deploying ${stdout} (${new Date().toISOString()})`
    }, cb)
  })
})

gulp.task('deploy', (cb) => {
  sequence('build', 'gh-pages', cb)
})

gulp.task('browser-sync', function () {
  browserSync.init({
    logPrefix: ' ▶ ',
    port: 9191,
    minify: false,
    notify: false,
    server: 'dist',
    open: false
  })
})

gulp.task('watch', () => {
  gulp.watch(sources.content, ['build'])
  gulp.watch(sources.styles, ['styles'])
  gulp.watch(sources.images, ['images'])
  gulp.watch(sources.fonts, ['fonts'])
  gulp.watch(sources.js, ['javascripts'])
})

gulp.task('default', (cb) => {
  sequence('build', 'watch', 'browser-sync', cb)
})
