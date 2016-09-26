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
    gulp.src(path.src.pug) //Выберем файлы по нужному пути
        .pipe(plumber({ // plumber - плагин для отловли ошибок.
            errorHandler: notify.onError(function (err) { // nofity - представление ошибок в удобном для вас виде.
                return {
                    title: 'Pug',
                    message: err.message
                }
            })
        }))
        .pipe(pug({pretty: true})) // настройка pug для отмены минимизации html на продакшене
        .pipe(gulp.dest(path.dest.html)) //Выплюнем их в папку build
        .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});


gulp.task('js:build', function () {
    gulp.src(path.src.js) //Найдем наш main файл
        .pipe(sourcemaps.init()) //Инициализируем sourcemap
        .pipe(uglify()) //Сожмем наш js
        .pipe(sourcemaps.write('.')) //Пропишем карты
        .pipe(gulp.dest(path.dest.js)) //Выплюнем готовый файл в build
        .pipe(reload({stream: true})); //И перезагрузим сервер
});


gulp.task('css:build', function () {
    gulp.src(path.src.css) //Выберем наш main.scss
        //.pipe(plumber({ // plumber - плагин для отловли ошибок.
        //    errorHandler: notify.onError(function (err) { // nofity - представление ошибок в удобном для вас виде.
        //        return {
        //            title: 'Styles',
        //            message: err.message
        //        }
        //    })
        //}))
        .pipe(sourcemaps.init()) //То же самое что и с js
        .pipe(sass().on('error', sass.logError)) //Скомпилируем
        .pipe(prefixer()) //Добавим вендорные префиксы
        .pipe(cleanCSS()) //Сожмем
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.dest.css)) //И в build
        .pipe(reload({stream: true}));
});

gulp.task('img:build', function () {
    gulp.src(path.src.img) //Выберем наши картинки
        .pipe(imagemin({ //Сожмем их
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.dest.img)) //И бросим в build
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