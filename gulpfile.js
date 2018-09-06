const gulp = require('gulp'),
    less = require('gulp-less'),
    path = require('path'),
    browserSync = require('browser-sync'),
    pug = require('gulp-pug'),
    htmlbeautify = require('gulp-html-beautify'),
    concat = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
    uglify = require('gulp-uglifyjs'),
    cssnano = require('gulp-cssnano'), // Подключаем пакет для минификации CSS
    rename = require('gulp-rename'); // Подключаем библиотеку для переименования файлов


/* Сборка */
const del = require('del'), // Подключаем библиотеку для удаления файлов и папок
    imagemin = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
    pngquant = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
    cache = require('gulp-cache'), // Подключаем библиотеку кеширования
    autoprefixer = require('gulp-autoprefixer');// Подключаем библиотеку для автоматического добавления префиксов


/* Less */
gulp.task('less', function (done) {
    gulp.src('app/less/**/*.less')
        .pipe(less({
            paths: [path.join(__dirname, 'less', 'includes')]
        }).on('error', function (error) {
            done(error)
        }))
        .pipe(gulp.dest('app/css')).on('end', function () {
            done()
        })
        .pipe(browserSync.reload({
            stream: true
        }));
});

/* Pug */

gulp.task('pug', function (done) {
    gulp.src("app/pug/*.pug")
        .pipe(pug().on('error', function (error) {
            // у нас ошибка
            done(error);
        }))
        .pipe(gulp.dest("app"))
        .on('end', function () {
            // у нас все закончилось успешно
            done();
        })
        .pipe(browserSync.reload({
            stream: true
        }));
});

/* Замена дефолтного beautify */

gulp.task('htmlbeautify', function () {
    var options = {
        indentSize: 2
    };
    gulp.src('app/*.html')
        .pipe(htmlbeautify(options))
        .pipe(gulp.dest('app'))
});

/* LiveReload */

gulp.task('browser-sync', function () { // Создаем таск browser-sync
    browserSync({ // Выполняем browser Sync
        server: { // Определяем параметры сервера
            baseDir: 'app' // Директория для сервера - app
        },
        notify: false // Отключаем уведомления
    });
});

gulp.task('scripts', function() {
    return gulp.src(['app/js/libs/*.js']) //Указываем точный путь в случае подключения какой-либо библиотеки
        .pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
        .pipe(uglify()) // Сжимаем JS файл
        .pipe(gulp.dest('app/js')); // Выгружаем в папку app/js
});

gulp.task('css-libs', ['less'], function() {
    return gulp.src('app/css/libs/*.css') // Указываем точный путь в случае подключения какой-либо библиотеки
        .pipe(cssnano()) // Сжимаем
        .pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
        .pipe(gulp.dest('app/css')); // Выгружаем в папку app/css
});

/* Смотрим изменения */
gulp.task('watch', ['browser-sync', 'css-libs', 'pug', 'scripts'], function () {
    gulp.watch('app/less/**/*.less', ['less']);
    gulp.watch('app/pug/*.pug', ['pug']);
    gulp.watch('app/*.html', ['htmlbeautify']);
    gulp.watch('app/js/*.js', browserSync.reload);
    // Наблюдение за другими типами файлов
});


/* Продакш */
gulp.task('clean', function() {
    return del.sync('dist/*'); // Удаляем папку dist перед сборкой
});

gulp.task('img', function() {
    return gulp.src('app/img/**/*') // Берем все изображения из app
        .pipe(cache(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('dist/img')); // Выгружаем на продакшен
});

gulp.task('build', ['clean', 'img', 'less', 'scripts', 'pug'], function() {

    var buildCss = gulp.src('app/css/*.css')
    .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
    .pipe(gulp.dest('dist/css'));

    var buildFonts = gulp.src('app/fonts/**/*').pipe(gulp.dest('dist/fonts'));

    var buildJs = gulp.src('app/js/**/*').pipe(gulp.dest('dist/js'));

    var buildHtml = gulp.src('app/*.html').pipe(gulp.dest('dist'));

});

gulp.task('default', ['watch']);

gulp.task('clear', function () {
    return cache.clearAll();
});
