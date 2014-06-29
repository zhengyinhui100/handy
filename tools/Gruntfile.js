module.exports = function(grunt) {
	'use strict';

	var projectDir='/Users/hui/Documents/workspace/sportapp/';
	var buildDir=projectDir+'build/';
	var wwwDir=projectDir+'www/'
	var cssDir=wwwDir+'css/';
	var buildVersionDir=buildDir;
	var buildLibDir=buildVersionDir+'lib/';
	
	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		clean:{
			options:{force:true},
			src:[cssDir,buildDir]
		},
		less : {
			src : {
				expand : true,
				cwd : projectDir+"/less",
				src : "*.less",
				dest:cssDir,
				ext : ".css"
			}
		},
		copy:{
			all:{
				expand : true,
				cwd:wwwDir,
				src : ['css/**','js/**','img/**','lib/**'],
				dest :buildVersionDir
			}
		},
		cssmin : {
			add_banner : {
				options : {
					banner : '/* <%= pkg.name %> v<%= pkg.version %> | <%= grunt.template.today("yyyy-mm-dd") %> | zhengyinhui100@gmail.com */\n'
				},
				expand: true,
			    cwd: cssDir,
				src:['userlogin.css','main.css'],
				dest:buildVersionDir+'css/',
				ext:'.min.css'
			}
		},
		handy_require:{
			js:{
				expand : true,
				cwd: buildVersionDir+'js',
				src : ['**/*.js','!*.js'],
				dest: buildVersionDir+'js',
				pkgName:'<%=pkg.name%>.js',
				alias :{
					's':'com.sport',
					'm':'com.sport.module',
					'cm':'com.sport.common',
					'md':'com.sport.model',
					'cl':'com.sport.collection',
					'i':'com.sport.interface',
					'p':'com.sport.plugin'
				}
			}
		},
		concat : {
			crypto: {
				src : [
					buildLibDir+'crypto/aes.js',
					buildLibDir+'crypto/mode-ecb.js',
					buildLibDir+'crypto/pad-nopadding.js',
					buildLibDir+'crypto/pad-zeropadding.js'
				],
				dest : buildLibDir+'crypto.js'
			},
			cryptomin:{
				src : [
					buildLibDir+'crypto/aes.min.js',
					buildLibDir+'crypto/mode-ecb.min.js',
					buildLibDir+'crypto/pad-nopadding.min.js',
					buildLibDir+'crypto/pad-zeropadding.min.js'
				],
				dest : buildLibDir+'crypto.min.js'
			},
			otherlib:{
				src : [
					buildLibDir+'fastclick/fastclick.js',
					buildLibDir+'iscroll/iscroll4.js'
				],
				dest : buildLibDir+'otherlib.js'
			},
			sportapp : {
				src : [
					buildVersionDir+'js/Config.js',
					buildVersionDir+'js/<%= pkg.name %>.js',
					buildVersionDir+'js/Start.js'
				],
				dest : buildVersionDir+'js/<%= pkg.name %>.js'
			}
		},
		uglify : {
			options : {
				// 此处定义的banner注释将插入到输出文件的顶部
				banner : '/* <%= pkg.name %> v<%= pkg.version %> | <%= grunt.template.today("yyyy-mm-dd") %> | zhengyinhui100@gmail.com */\n'
			},
			dist : {
				files : [{
					expand:true,
					cwd:buildVersionDir,
					src:['js/**/*.js','lib/otherlib.js'],
					dest:buildVersionDir,
					ext:'.min.js'
				}]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-handy-require');

	grunt.registerTask('online', ['clean','less','copy','cssmin','handy_require','concat','uglify']);
	
	grunt.registerTask('default', ['online']);
	
	
};
