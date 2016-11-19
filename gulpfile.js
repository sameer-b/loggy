'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel');
const del = require('del');
const exec = require('child_process').exec;
const eslint = require('gulp-eslint');

const paths = {
    allSrcJs: 'src/**/*.js',
    libDir: 'dist'
};

gulp.task('lint', () => {
    // ESLint ignores files with "node_modules" paths.
    // So, it's best to have gulp ignore the directory as well.
    // Also, Be sure to return the stream from the task;
    // Otherwise, the task may end before the stream has finished.
    return gulp.src(['**/*.js','!node_modules/**', '!dist/**'])
        // eslint() attaches the lint output to the "eslint" property
        // of the file object so it can be used by other modules.
        .pipe(eslint())
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failAfterError last.
        .pipe(eslint.failAfterError());
});

gulp.task('clean', () => {
    return del(paths.libDir);
});

gulp.task('build', ['clean', 'lint'], () => {
    return gulp.src(paths.allSrcJs)
    .pipe(babel())
    .pipe(gulp.dest(paths.libDir));
});

gulp.task('main', ['build'], (callback) => {
    exec(`node ${paths.libDir}`, (error, stdout) => {
        console.log(stdout);
        return callback(error);
    });
});

gulp.task('watch', () => {
    gulp.watch(paths.allSrcJs, ['main']);
});

gulp.task('default', ['watch', 'main']);
