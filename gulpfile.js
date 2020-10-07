// require gulp and main config
var gulp = require('gulp');
var util = require('gulp-util');
var config = require('./config.json');
// When building a WP theme, lets set the DIST in config to = './dist/theme-name/'

// Source: https://github.com/gulpjs/gulp-util

// GET environment gulp --env=ENVIRONMENT_TYPE can be dev, prod
var protocol = util.env.protocol || 'ssh';
var env = util.env.env || 'dev';
if( env === 'dev' ) config.isdev = !!env;

// alternative to gulp-util resources: https://yargs.js.org/

// Browser live reload
var bSync = require('browser-sync').create();

// CSS/SASS pludins
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var cssnano = require('gulp-cssnano');
var sourcemaps = require('gulp-sourcemaps');

//GFONTS
var googleWebFonts = require('gulp-google-webfonts');

// IMAGES
var imagemin = require('gulp-imagemin');

// KIT
var kit = require('gulp-kit');

// JS
var codekit = require('gulp-codekit');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var uglify = require('gulp-uglify');

// CLEAN
var del = require('del');
// CACHE
var cache = require('gulp-cache');

// DEV DEPLOY

// GLOBAL USAGE
var rename = require('gulp-rename');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var newer = require('gulp-newer');
// newer vs changed: https://stackoverflow.com/questions/24730215/gulp-newer-vs-gulp-changed
// plumber and notify: https://scotch.io/tutorials/prevent-errors-from-crashing-gulp-watch


// Deployment FTP/SSH
var gssh = require('gulp-ssh'); 
var ssh = new gssh(config.ssh.config);
var ftp = require('vinyl-ftp');
// resources: https://github.com/teambition/gulp-ssh
// https://www.npmjs.com/package/gulp-ssh


/*/ ------------ TASKS RUNNERS ------------ /*/



// --------------------------------
// BROWSER SYNC / LIVE RELOAD
// --------------------------------
gulp.task('serve', function() {
	bSync.init({
		server: {
			baseDir: config[env].dist
		}
	});
});
// bSync UI: port 3001
// Connect to mamp: https://discourse.roots.io/t/browsersync-and-mamp-pro-4/8159/2
// Options: https://browsersync.io/docs/options
// resources: https://scotch.io/tutorials/how-to-use-browsersync-for-faster-development
// resources: https://www.future-processing.pl/blog/gulp-sass-and-browsersync-in-practice/
// https://browsersync.io/

// --------------------------------
// SASS/SCSS Task
// --------------------------------
gulp.task('sass', function() {

	// Gets all files ending with .scss or sass in app/scss and children dirs
	return gulp.src( config[env].scss.src ) 

		// Handle error in pipe
		.pipe(plumber({errorHandler: notify.onError({ title: "<%= error.plugin %>", message: "Error: <%= error.message %>" })}))

		// If DEV start srouce maps
		.pipe( config.isdev ? sourcemaps.init() : util.noop() )

		// If DEV start do not compress css
		.pipe( config.isdev ? sass({ 'outputStyle': 'expanded' }).on('error', sass.logError) : sass() ) // DEV: output expanded

		// If DEV or PROD do autoprefixer
		.pipe(autoprefixer({
			overrideBrowserslist: ['last 2 versions'],
			cascade: true
    	}))
        
        // If DEV do not minify
        .pipe( config.isdev ? util.noop() : cssnano({ discardComments: {removeAll: true} }) )

        // If DEV write maps
		.pipe( config.isdev ? sourcemaps.write('/') : util.noop() )

		// Both add .min
        .pipe(rename({suffix: ".min"}))
		
		.pipe(gulp.dest( config[env].scss.dist ))

		// reload browser
		.pipe( bSync.reload({stream: true}) );
})
// Sources: https://www.sitepoint.com/simple-gulpy-workflow-sass/
// https://www.npmjs.com/package/gulp-cssnano


// --------------------------------
// IMAGES
// --------------------------------
gulp.task('img', function(){

	// Gets all image files
	return gulp.src( config[env].img.src )
		
		// Process only newer files in DEV, rebuild on PROD
		.pipe( config.isdev ? newer( config[env].img.dist ) : util.noop() )

		// Minify images according to setup
		// TODO: add multiple PLUGINS and CACHE
		.pipe( imagemin( config[env].img.imagemin ) )

		.pipe( gulp.dest( config[env].img.dist ) )

		// reload browser
		.pipe( bSync.reload({stream: true}) );
});
// resources: https://github.com/imagemin/imagemin, https://www.npmjs.com/search?q=keywords:imageminplugin
// https://github.com/sindresorhus/gulp-imagemin

// --------------------------------
// KIT
// --------------------------------
gulp.task('kit', function(){
	
	// Gets all .kit files
	return gulp.src( config[env].kit.src )

		// Handle error in pipe
		.pipe(plumber({errorHandler: notify.onError({ title: "<%= error.plugin %>", message: "Error: <%= error.message %>" })}))

		// Compile .kit files
		.pipe( kit( {compilePartials : true}) )

		.pipe( gulp.dest( config[env].kit.dist ) )

		// reload browser
		.pipe( bSync.reload({stream: true}) );
});

// --------------------------------
// FONTS
// --------------------------------
gulp.task('fonts', function() {

	// Get all FONT files
	return gulp.src( config[env].font.src )

		// Process only newer files in DEV, rebuild on PROD
		.pipe( config.isdev ? newer( config[env].img.dist ) : util.noop() )

		.pipe( gulp.dest( config[env].font.dist ) )

		// reload browser
		.pipe( bSync.reload({stream: true}) );
})
// resources: https://www.npmjs.com/search?q=font

var options = {
	fontsDir: 'Poppins/',
	cssDir: 'Poppins/css',
	cssFilename: 'setting.css'
};

gulp.task('gfonts', function () {
	return gulp.src('./src/fonts/fonts.list')
		.pipe(googleWebFonts(options))
		.pipe(gulp.dest('./src/fonts/'))
		;
});

// --------------------------------
// COPY OTHER FILES
// --------------------------------
gulp.task('copy', function() {

	// Get ALL other files
	return gulp.src( config[env].file.src ,{ base: config[env].file.base } )

		// Process only newer files in DEV, rebuild on PROD
		.pipe( config.isdev ? newer( config[env].img.dist ) : util.noop() )

		// Copy them
		.pipe( gulp.dest( config[env].file.dist ) )

		// reload browser
		.pipe( bSync.reload({stream: true}) );
})

// --------------------------------
// JAVSCRIPT
// --------------------------------
gulp.task("js", function() {

	// Get all JS files from source
	return gulp.src( config[env].js.src )
    	
		// Handle error in pipe
		.pipe(plumber({errorHandler: notify.onError({ title: "<%= error.plugin %>", message: "Error: <%= error.message %>" })}))

    	// Jshint with stylish output
        .pipe(jshint())
        .pipe(jshint.reporter( stylish ))
		.pipe(jshint.reporter('fail'))
        // .on('error', notify.onError({ message: 'JS hint fail'}))
		// If DEV start srouce maps
		.pipe( config.isdev ? sourcemaps.init() : util.noop() )

    	// Add support for codekit embeding
    	.pipe(codekit()).on('error', console.log)
		
        // If DEV do not minify
        .pipe( config.isdev ? util.noop() : uglify() )

        // If DEV write maps
		.pipe( config.isdev ? sourcemaps.write('/') : util.noop() )

		.pipe( rename({suffix: ".min"}) )

    	.pipe( gulp.dest( config[env].js.dist ) )

		// reload browser
		.pipe( bSync.reload({stream: true}) );
});
// resources: https://www.npmjs.com/package/gulp-codekit, https://github.com/webpack/webpack/issues/1205
// https://www.npmjs.com/package/gulp-babel

// --------------------------------
// EMPTY DIR/CACHE
// --------------------------------
gulp.task('clean', function() {
	if( !config.isdev ) {
		// Clear all cache
		cache.clearAll();
		// Empty output directory
		return del( [config[env].dist] );
	} 
	return Promise.resolve('the value is ignored');
})

// --------------------------------
// DEPLOY --protocol=ssh|ftp
// --------------------------------
gulp.task('deploy', function() {

	// If --protocol=ssh 
	if( protocol === 'ssh' && config.ssh.enable ) {

		// Empty remote folder
		return ssh.shell( 'rm -rf ' + config.ssh.remotebase + '' + config.ssh.remotefolder + '{*,.*}' )
		
			// Get all files from output folder
			.pipe( gulp.src( config[env].dist + '**/*' ) )

			// Push data to remote folder
			.pipe( ssh.dest( config.ssh.remotebase + config.ssh.remotefolder ));		
	} 

	// If --protocol=ftp 
	if( protocol === 'ftp' && config.ftp.enable ) {
		var conn = ftp.create( config.ftp.config );
		return gulp.src( globs, { base: '.', buffer: false } )
			.pipe( conn.newer( '/public_html' ) ) // only upload newer files
			.pipe( conn.dest( '/public_html' ) );
	}

	// TODO: Upload only newer data to SSH
});
// source: https://gomasuga.com/blog/deploying-craft-cms-with-gulp-deployhq-build-ssh-commands
// source: https://www.npmjs.com/package/vinyl-ftp



/*/ ------------ WATCHERS / BUILDS ------------ /*/



// --------------------------------
// WATCHER
// --------------------------------
gulp.task('watch', function(){
	gulp.watch( config[env].scss.src, gulp.series('sass')); 
	gulp.watch( config[env].js.src, gulp.series('js')); 
	gulp.watch( config[env].img.src, gulp.series('img')); 
	gulp.watch( config[env].font.src, gulp.series('fonts')); 
	gulp.watch( config[env].kit.src, gulp.series('kit')); 
	gulp.watch( config[env].file.src, gulp.series('copy')); 

	// TODO - idle timeout .. automatically exit the watcher function
})

// --------------------------------
// BUILD --env=dev|prod
// --------------------------------
gulp.task('build', gulp.series( 'clean', gulp.parallel( 'sass', 'js', 'img', 'fonts', 'kit', 'copy' ) ));

// --------------------------------
// DEVELOP 
// --------------------------------
gulp.task('develop', gulp.series( 'build', gulp.parallel( 'serve', 'watch' )));


// --------------------------------
// TODO 
// --------------------------------
// PHP parsers, COFFFE SCRIPT, BABEL, other
// Linters
// Wordpress
// Plain CSS
// USEREF
// Concat instead of inclusion
// Architecture - BEM, ABEM, SMACSS, OOCSS 
// https://hackersandslackers.com/upgrading-to-gulp-4/
// https://medium.com/wolox-driving-innovation/dynamic-environments-for-your-gulp-tasks-27fada475c7e
// https://gist.github.com/desaiuditd/c4509339bb9bb9eae6a1
// https://blueprintinteractive.com/blog/how-sync-local-and-server-development-gulp
// https://webdevstudios.com/2016/04/12/gulp-configuration-a-beginners-guide/
// https://github.com/chalk/chalk
// https://devhints.io/yargs
// https://mikeeverhart.net/2016/01/deploy-code-to-remote-servers-with-gulp-js/
// https://gist.github.com/feliperoberto/9793674
// https://scotch.io/tutorials/how-to-use-browsersync-for-faster-development
// https://calendee.com/2015/01/20/conditional-build-process-with-gulp-if/
// https://www.npmjs.com/package/gulp-if
// https://www.npmjs.com/package/gulp-notify
// https://www.freshconsulting.com/how-to-organize-your-gulp-js-development-builds-for-multiple-environments/
// https://github.com/addyosmani/critical
// https://www.smashingmagazine.com/2015/08/understanding-critical-css/

//https://blog.alexdevero.com/gulp-web-designers-want-know/
//https://css-tricks.com/gulp-for-beginners/
// https://travismaynard.com/writing/getting-started-with-gulp
// https://www.npmjs.com/package/gulp-static-php
// https://www.npmjs.com/package/gulp-essentials
// https://gist.github.com/martincarlin87/2abdad2efa48bb8b45bf
// https://ypereirareis.github.io/blog/2015/10/13/gulp-gulpfile-environment-variable/
// https://www.toptal.com/javascript/optimize-js-and-css-with-gulp
// https://www.taniarascia.com/getting-started-with-gulp/