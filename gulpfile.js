const gulp = require('gulp');
const babel = require('gulp-babel');
const del = require('del');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const babelRegister = require('babel-register');
const istanbul = require('gulp-istanbul');
const coveralls = require('gulp-coveralls');

const paths = {
    allSrcJs: 'src/**/*.js',
    libDir: 'dist'
};

gulp.task('lint', () => {
    return gulp.src(['**/*.js','!node_modules/**', '!dist/**', '!coverage/**'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('clean', () => {
    return del(paths.libDir);
});

gulp.task('babel', () => {
    return gulp.src(paths.allSrcJs)
    .pipe(babel())
    .pipe(gulp.dest(paths.libDir));
});

gulp.task('test', ['pre-test'], function() {
    return gulp.src(['test/test-*.js'], { read: false })
    .pipe(mocha({
        reporter: 'spec',
        compilers: {
            js: babelRegister
        },
        globals: {
            should: require('should')
        }
    }))
    .pipe(istanbul.writeReports())
    .pipe(istanbul.enforceThresholds({ thresholds: { global: 50 } }));
});

gulp.task('pre-test', function() {
    return gulp.src(['dist/*.js'])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
});

gulp.task('coveralls', function() {
    return gulp.src('coverage/lcov.info')
    .pipe(coveralls());
});

gulp.task('build', ['clean', 'lint', 'babel', 'test']);
