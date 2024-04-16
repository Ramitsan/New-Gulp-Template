const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require('gulp-sass')(require('sass'));
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const server = require("browser-sync").create();
const csso = require("gulp-csso");
const rename = require("gulp-rename");
const imagemin = import("gulp-imagemin");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore")
const posthtml = require("gulp-posthtml");
const include = require("posthtml-include");
const del = require("del");
const ghPages = require('gh-pages');
const path = require('path');

gulp.task("css", function () {
    return gulp.src("source/sass/style.scss")
      .pipe(plumber())
      .pipe(sourcemap.init())
      .pipe(sass())
      .pipe(postcss([ autoprefixer() ]))
      .pipe(csso())
      .pipe(rename("style.min.css"))
      .pipe(sourcemap.write("."))
      .pipe(gulp.dest("build/css"))
      .pipe(server.stream());
  });
  
  gulp.task("server", function () {
    server.init({
      server: "build/",
      notify: false,
      open: true,
      cors: true,
      ui: false
    });
  
    gulp.watch("source/sass/**/*.{scss,sass}", gulp.series("css"));
    gulp.watch("source/assets/icons/*.svg", gulp.series("sprite", "html", "refresh"));
    gulp.watch("source/*.html", gulp.series("html", "refresh"));
    gulp.watch("source/js/*.js", gulp.series("js", "refresh"));
  });
  
  gulp.task("refresh", function (done) {
    server.reload();
    done();
  });
  
  gulp.task("images", function() {
    return gulp.src("source/assets/**/*.{png,jpg,svg}")
      .pipe(imagemin([
        imagemin.optipng({optimizationLevel: 3}),
        imagemin.jpegtran({progressive: true}),
        imagemin.svgo()
      ]))
  
      .pipe(gulp.dest("source/assets"));
  
  });
  
  gulp.task("webp", function () {
    return gulp.src("source/assets/**/*.{png,jpg}")
      .pipe(webp({quality: 90}))
      .pipe(gulp.dest("source/assets"));
  });
  
  gulp.task("sprite", function () {
    return gulp.src("source/assets/*.svg")
      .pipe(svgstore({inlineSvg: true}))
      .pipe(rename("sprite_auto.svg"))
      .pipe(gulp.dest("build/img"));
  });
  
  gulp.task("html", function () {
    return gulp.src("source/*.html")
      .pipe(posthtml([
        include()
      ]))
      .pipe(gulp.dest("build"));
  });
  
  gulp.task("copy", function () {
    return gulp.src([
      "source/assets/fonts/*.{woff,woff2}",
      "source/assets/img/**",
      "source/assets/icons/**",
      // "source/js/**",
      "source//*.ico"
      ], {
        base: "source"
      })
    .pipe(gulp.dest("build"));
  });
  
  gulp.task("clean", function () {
    return del("build");
  });

  gulp.task("js", function () {
    return gulp.src([     
      "source/js/**",
      ], {
        base: "source"
      })
    .pipe(gulp.dest("build"));
  });
  
  gulp.task("build", gulp.series("clean", "copy", "js", "css", "sprite", "html"));
  gulp.task("start", gulp.series("build", "server"));

  function deploy(cb) {
    ghPages.publish(path.join(process.cwd(), './build'), cb);
  }
  exports.deploy = deploy;