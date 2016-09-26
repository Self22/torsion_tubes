'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    cleanCSS = require('gulp-clean-css'),
    notify = require('gulp-notify'),
    plumber = require('gulp-plumber'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    pug = require('gulp-pug'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload;

var path = {
    dest: {
        html: 'prod/',
        css: 'prod/css/',
        js: 'prod/js/',
        img: 'prod/img/',
        fonts: 'prod/fonts/'
    },
    src: {
        html: '_dev/*.html',
        css: '_dev/css/main.css',
        js: '_dev/js/main.js',
        img: '_dev/img/**/*.*',
        fonts: '_dev/fonts/**/*.*',
        pug: '_dev/*.pug'
    },
    watch: {
        html: '_dev/**/*.pug',
        css: '_dev/css/**/*.scss',
        js: '_dev/js/**/*.js',
        img: '_dev/img/**/*.*',
        fonts: '_dev/fonts/**/*.*'
    },
    clean: 'prod'
};

var config = {
        server: {
            baseDir: "prod"
        },
        open: false
    },
    configTunnel = {
        server: {
            baseDir: "prod"
        },
        tunnel: 'delivery',
        browser: 'Google Chrome',
        open: 'tunnel'
    };

gulp.task('html:build', function () {
    gulp.src(path.src.pug) //������� ����� �� ������� ����
        .pipe(plumber({ // plumber - ������ ��� ������� ������.
            errorHandler: notify.onError(function (err) { // nofity - ������������� ������ � ������� ��� ��� ����.
                return {
                    title: 'Pug',
                    message: err.message
                }
            })
        }))
        .pipe(pug({pretty: true})) // ��������� pug ��� ������ ����������� html �� ����������
        .pipe(gulp.dest(path.dest.html)) //�������� �� � ����� build
        .pipe(reload({stream: true})); //� ������������ ��� ������ ��� ����������
});


gulp.task('js:build', function () {
    gulp.src(path.src.js) //������ ��� main ����
        .pipe(sourcemaps.init()) //�������������� sourcemap
        .pipe(uglify()) //������ ��� js
        .pipe(sourcemaps.write('.')) //�������� �����
        .pipe(gulp.dest(path.dest.js)) //�������� ������� ���� � build
        .pipe(reload({stream: true})); //� ������������ ������
});


gulp.task('css:build', function () {
    gulp.src(path.src.css) //������� ��� main.scss
        //.pipe(plumber({ // plumber - ������ ��� ������� ������.
        //    errorHandler: notify.onError(function (err) { // nofity - ������������� ������ � ������� ��� ��� ����.
        //        return {
        //            title: 'Styles',
        //            message: err.message
        //        }
        //    })
        //}))
        .pipe(sourcemaps.init()) //�� �� ����� ��� � � js
        .pipe(sass().on('error', sass.logError)) //������������
        .pipe(prefixer()) //������� ��������� ��������
        .pipe(cleanCSS()) //������
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.dest.css)) //� � build
        .pipe(reload({stream: true}));
});

gulp.task('img:build', function () {
    gulp.src(path.src.img) //������� ���� ��������
        .pipe(imagemin({ //������ ��
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.dest.img)) //� ������ � build
        .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function () {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.dest.fonts));
});

gulp.task('build', [
    'html:build',
    'css:build',
    'fonts:build',
    'img:build',
    'js:build'
]);

gulp.task('watch', function () {
    watch([path.watch.html], function (event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.css], function (event, cb) {
        gulp.start('css:build');
    });
    watch([path.watch.fonts], function (event, cb) {
        gulp.start('fonts:build');
    });
    watch([path.watch.img], function (event, cb) {
        gulp.start('img:build');
    });
    watch([path.watch.js], function (event, cb) {
        gulp.start('js:build');
    });
});

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('webserverTunnel', function () {
    browserSync(configTunnel);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});


gulp.task('default', ['build', 'webserver', 'watch']);