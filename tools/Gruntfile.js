module.exports = function(grunt) {
	'use strict';

	var cssDir='/Users/hui/Documents/workspace/SportApp/WebContent/sportapp/www/css/';
	var buildDir='/Users/hui/Documents/workspace/SportApp/build/';
	
	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		clean:{
			options:{force:true},
			src:[cssDir,buildDir]
		},
		less : {
			src : {
				expand : true,
				cwd : "/Users/hui/Documents/workspace/SportApp/WebContent/less",
				src : "*.less",
				dest:cssDir,
				ext : ".css"
			}
		},
		cssmin : {
			add_banner : {
				options : {
					banner : '/* <%= pkg.name %> v<%= pkg.version %> | <%= grunt.template.today("yyyy-mm-dd") %> | zhengyinhui100@gmail.com */\n'
				},
				files : {
					(buildDir+'css/<%= pkg.name %>.min.css' ): [
												cssDir+'userlogin.css',
												cssDir+'main.css'
											]
				}
			}
		},
		handy_require:{
			js:{
				expand : true,
				cwd:'/Users/hui/Documents/workspace/SportApp/WebContent/sportapp/www/js',
				src : ['**/*.js'],
				dest: buildDir,
				pkgName:'sportapp.js',
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
			js : {
				// 将要被合并的文件
				src : [
				],
				// 合并后的JS文件的存放位置
				dest : 'dist/<%= pkg.name %>.js'
			}
		},
		uglify : {
			options : {
				// 此处定义的banner注释将插入到输出文件的顶部
				banner : '/* <%= pkg.name %> v<%= pkg.version %> | <%= grunt.template.today("yyyy-mm-dd") %> | zhengyinhui100@gmail.com */\n'
			},
			dist : {
				files : {
					'dist/<%= pkg.name %>.min.js' : ['<%= concat.js.dest %>']
				}
			}
		},
		ftpscript: {
    		main : {
				options : {
					host : '115.28.151.237',
					port : 22
					//"auth":{"username": "username2", "password": "password2"}
				},
				files : [{
					src : ['dist/handy.min.js'],
					dest : '/var/www/html/handy.min.js'
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

	grunt.registerTask('online', ['less','cssmin','concat','uglify','copy']);
	
	grunt.registerTask('dev', ['clean','less','cssmin','handy_require']);
	
	grunt.registerTask('default', ['dev']);
	
	
};
