// Load plugins
const autoprefixer = require("gulp-autoprefixer");
const browsersync = require("browser-sync");
const cleanCSS = require("gulp-clean-css");
const gulp = require("gulp");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const uglify = require("gulp-uglify");
const replace = require('gulp-replace');
const fs = require('fs');
const zip = require('gulp-zip');
const moment = require('moment');

// Copy third party libraries from /node_modules into /vendor
function vendor(done) {
  // Bootstrap
  gulp.src([
      './node_modules/bootstrap/dist/**/*',
      '!./node_modules/bootstrap/dist/css/bootstrap-grid*',
      '!./node_modules/bootstrap/dist/css/bootstrap-reboot*'
    ])
    .pipe(gulp.dest('./vendor/bootstrap'))
    .pipe(gulp.dest('./build/vendor/bootstrap'))

  // Font Awesome
  gulp.src([
      './node_modules/@fortawesome/**/*',
    ])
    .pipe(gulp.dest('./vendor'))
    .pipe(gulp.dest('./build/vendor'))

  // jQuery
  gulp.src([
      './node_modules/jquery/dist/*',
      '!./node_modules/jquery/dist/core.js'
    ])
    .pipe(gulp.dest('./vendor/jquery'))
    .pipe(gulp.dest('./build/vendor/jquery'))

    done()
}

// CSS task
function css() {
  return gulp
    .src("./scss/*.scss")
    .pipe(plumber())
    .pipe(sass({
      outputStyle: "expanded"
    }))
    .on("error", sass.logError)
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest("./css"))
    .pipe(gulp.dest("./build/css"))
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(cleanCSS())
    .pipe(gulp.dest("./css"))
    .pipe(gulp.dest("./build/css"))
    .pipe(browsersync.stream());
}

// JS task
function js() {
  return gulp
    .src([
      './js/*.js',
      '!./js/*.min.js',
      '!./js/contact_me.js',
      '!./js/jqBootstrapValidation.js'
    ])
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./js'))
    .pipe(gulp.dest('./build/js'))
    .pipe(browsersync.stream());
}

// HTML task
function html() {
  return gulp
    .src([
      './**/*.html',
      '!./dist/**',
      '!./build/**',
      '!./node_modules/**',
      '!./upload/**',
      '!./template/**'
    ])
    .pipe(replace('[[[nav]]]', fs.readFileSync('template/navigation.html', 'utf8')))
    .pipe(replace('[[[footer]]]', fs.readFileSync('template/footer.html', 'utf8')))
    .pipe(replace('[[[head]]]', fs.readFileSync('template/head.html', 'utf8')))
    .pipe(gulp.dest('./build/'))
    .pipe(browsersync.stream());
}

// misc task
function misc() {
    return gulp
        .src([
            './robots.txt',
            './sitemap.xml'
        ])
        .pipe(gulp.dest('./build/'))
        .pipe(browsersync.stream());
}

// images task
function images() {
  return gulp
    .src([
      './img/*.png',
      './img/*.jpg',
      './img/*.jpeg'
    ])
    .pipe(gulp.dest('./build/img/'))
    .pipe(browsersync.stream());
}

// Tasks
gulp.task("misc", misc);
gulp.task("css", css);
gulp.task("js", js);
gulp.task("html", html);
gulp.task("images", images);
gulp.task("vendor", vendor);

// BrowserSync Reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

gulp.task("default", gulp.parallel('vendor', css, js, html, images, misc));

gulp.task('dev', gulp.series(gulp.parallel('vendor', 'css', 'js', 'html', 'images', 'misc'), function() {
    browsersync.init({
      server: {
        baseDir: "./build"
      }
    });

    gulp.watch("./scss/**/*", css);
    gulp.watch(["./js/**/*.js", "!./js/*.min.js"], js);
    gulp.watch(["./**/*.html", "!./build/**"], html);
}));

gulp.task('dist', gulp.series(gulp.parallel('vendor', 'css', 'js', 'html', 'images', 'misc'), function() {

  var now = moment().format('YYYY-MM-DD');
  console.log(now)

  const uploadDir = 'upload'
  if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
  }

  return gulp.src(['build/**/*', '!./build/assets', '!./build/assets/**'])
        .pipe(zip('oidamo_'+now+'.zip'))
        .pipe(gulp.dest('upload'))
}));
