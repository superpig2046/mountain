/**
 * Created by yonghan on 17/5/6.
 */

var gulp = require('gulp');

var src = {
    // html 文件
    html: "src/html/*.html",
    // vendor 目录和 bower_components
    vendor: ["vendor/**/*", "bower_components/**/*"],
    // style 目录下所有 xx/index.less
    style: "src/style/*/*.less",
    // 图片等应用资源
    assets: "assets/**/*",
    js: "src/js/**/*.js"
};

var dist = {
    root: "dist/",
    html: "dist/",
    style: "dist/style",
    vendor: "dist/vendor",
    assets: "dist/assets",
    js: "dist/js"
};

var bin = {
    root: "bin/",
    html: "bin/",
    style: "bin/style",
    vendor: "bin/vendor",
    assets: "bin/assets",
    js: "bin/js"
};

var del = require('del');


function clean(done){
    del.sync(dist.root);
    done()

}


function copyAssets(){
    return gulp.src(src.assets).pipe(gulp.dest(dist.assets));
}

function copyVendor() {
    return gulp.src(src.vendor)
        .pipe(gulp.dest(dist.vendor));
}

function html() {
    return gulp.src(src.html)
        .pipe(gulp.dest(dist.html))
}

function style() {
    return gulp.src(src.style)
        .pipe(gulp.dest(dist.style))
}

function copyJs(){
    return gulp.src(src.js)
        .pipe(gulp.dest(dist.js))

}

var connect = require('gulp-connect');

function connectServer(done){
    connect.server({
        root: dist.root,
        port: 8090,
        livereload: true,

    });
    done()
}

function watch() {
    gulp.watch(src.html, html);
    gulp.watch("src/**/*.js", copyJs);
    gulp.watch("src/**/*.css", style);
    gulp.watch("dist/**/*").on('change', function(file) {
        console.log('>>>> detect dist change');
        gulp.src('dist/')
            .pipe(connect.reload());
    });
}

gulp.task("default", gulp.series(
    clean,
    gulp.parallel(copyAssets, copyVendor, html, style, copyJs),
    connectServer,
    watch
));