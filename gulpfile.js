const gulp = require('gulp');
const babel = require('gulp-babel');
const del = require('del');
const exec = require('child_process').exec;
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const babelRegister = require('babel-register');
const paths = {
    allSrcJs: 'src/**/*.js',
    libDir: 'dist'
};

gulp.task('lint', () => {
    return gulp.src(['**/*.js','!node_modules/**', '!dist/**'])
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

gulp.task('test', function() {
    return gulp.src(['test/test-*.js'], { read: false })
    .pipe(mocha({
        reporter: 'spec',
        compilers: {
            js: babelRegister
        },
        globals: {
            should: require('should')
        }
    }));
});

gulp.task('main', ['build'], (callback) => {
    exec(`node ${paths.libDir}`, (error, stdout) => {
        console.log(stdout);
        return callback(error);
    });
});

gulp.task('build', ['clean', 'lint', 'babel', 'test']);
