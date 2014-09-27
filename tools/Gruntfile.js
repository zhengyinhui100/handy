module.exports = function(grunt) {
	'use strict';

	var projectDir='/Users/hui/Documents/workspace/sportapp/';
	var ftlDir='/Users/hui/Documents/workspace/sport-web/src/main/webapp/WEB-INF/views';
	var deployDir='/Users/hui/Documents/';
	
	var buildDir=projectDir+'build/';
	var wwwDir=projectDir+'www/'
	var cssDir=wwwDir+'css/';
	var buildVersionDir=buildDir;
	var buildLibDir=buildVersionDir+'lib/';
	var appDir=deployDir+'appBuild/';
	var oNow=new Date();
	var _fFix=function(nNum){
		return nNum<10?'0'+nNum:nNum;
	}
	var sVersion=''+oNow.getFullYear()+_fFix(oNow.getMonth() + 1)+_fFix(oNow.getDate())+_fFix(oNow.getHours())+_fFix(oNow.getMinutes())+_fFix(oNow.getSeconds());
	var testConfig={
		serverName:'http://115.28.151.237:8080/',
		staticServerName:'http://115.28.151.237/',
		//staticServerName:'http://192.168.0.209/',
		environment:'test',
		//native app版本号
		appVersion:0.2,
		//webapp(前端更新)版本号
		version:0.2,
		//前端更新版本(时间)
		staticVersion:sVersion
	}
	
	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		clean:{
			options:{force:true},
			build:[cssDir,buildDir],
			appBuild:[appDir]
		},
		less : {
			src : {
				expand : true,
				cwd : projectDir+"/less",
				src : ["appinit.less","userlogin.less","main.less"],
				dest:cssDir,
				ext : ".css"
			}
		},
		copy:{
			//local test build 把options改名即可忽略此替换过程
			options : {
				//二进制文件必须排除，否则会损坏文件
				noProcess:['**/*.jpg','**/*.png','**/*.jpeg','**/*.gif','**/*.swf'],
				process : function(content, srcpath) {
					if(/\.(js|html|ftl)$/.test(srcpath)){
						return content.replace(/{%=(((?!%}).)+)%}/g, function(match,$1){
							return testConfig[$1];
						});
					}
					return content;
				}
			},
			build:{
				expand : true,
				cwd:wwwDir,
				src : ['css/**/*','img/**/*','js/**/*','lib/**/*'],
				dest :buildVersionDir
			},
			app:{
				expand : true,
				cwd:projectDir,
				src : [
					'**/*','!platforms/**/*','!plugins/**','!build/**','!htmlTmpl/**',
					'!less/**','!www/img/**','!www/css/**','!www/js/**','!www/lib/**'
				],
				dest :appDir
			},
			appLocal:{
				expand : true,
				cwd:buildDir,
				src : [
					'js/AppInit.min.js','css/appinit.min.css'
				],
				dest :appDir+'www'
			},
			ftl:{
				expand : true,
				cwd:ftlDir,
				src : ['index.ftl','chkVersion.ftl'],
				dest :deployDir
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
			css:{
				src : [
					buildVersionDir+'css/userlogin.css',
					buildVersionDir+'css/main.css'
				],
				dest : buildVersionDir+'css/<%=pkg.name%>.css'
			},
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
		cssmin : {
			add_banner : {
				options : {
					banner : '/* <%= pkg.name %> v<%= pkg.version %> | <%= grunt.template.today("yyyy-mm-dd") %> | zhengyinhui100@gmail.com */\n'
				},
				expand: true,
			    cwd: buildVersionDir,
				src:['css/*'],
				dest:buildVersionDir,
				ext:'.min.css'
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
					src:['js/**/*.js','lib/fastclick/*.js','lib/iscroll/*.js','lib/otherlib.js',
					'lib/kindeditor/kindeditor.js'],
					dest:buildVersionDir,
					ext:'.min.js'
				}]
			}
		},
		compress : {
			main : {
				options : {
					archive: '<%=pkg.name%>.tar.gz',
					mode : 'tgz'
				},
				files:[{
					src : ['../build/**/*',buildVersionDir+'**/*'],
					dest : '/Users/hui/Downloads/build'
				}]
			}
		},
		targz : {
			standalone_win : {
				files : {
					'../build/**/*' : '<%=pkg.name%>.tar.gz'
				}
			}
		},
		shell : {
			build : {
				command : [
					'mkdir '+deployDir+sVersion,
					'cp -R ../build '+deployDir+sVersion+'/'+'handy',
					'cp -R '+buildVersionDir+' '+deployDir+sVersion+'/'+'<%=pkg.name%>',
					'cd '+deployDir,
					'rm -f static.tar.gz',
					'tar -cvzf static.tar.gz index.ftl chkVersion.ftl '+sVersion,
					'rm -f index.ftl chkVersion.ftl',
					'rm -rf '+sVersion
				].join('&&')
			},
			appTar:{
				command : [
					'cd '+appDir,
					'rm -f '+deployDir+'app.zip',
					'zip -r '+deployDir+'app.zip www',
					'cd ../',
					'rm -rf appBuild'
				].join('&&')
			},
			buildDevApk:{
				command : [
					'cd '+projectDir,
					'rm -f plugins/android.json',
					'rm -fR platforms/android',
					'phonegap local build android'
				].join('&&')
			},
			buildTestApk:{
				command : [
					'cd '+appDir,
					'cp -R '+projectDir+'.cordova .cordova',
					'phonegap local build ios'
				].join('&&')
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
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-tar.gz');
	grunt.loadNpmTasks('grunt-shell');

	
	//local test build 把copy.options改名
	grunt.registerTask('testStaticBuild', ['clean:build','less','copy:build','copy:ftl','handy_require','concat','cssmin','uglify']);
	
	grunt.registerTask('testStaticTar', ['testStaticBuild','shell:build']);
	
	grunt.registerTask('appBuild', ['clean:appBuild','copy:app','copy:appLocal']);
	
	grunt.registerTask('appTar', ['testStaticBuild','appBuild','shell:appTar']);
	
	grunt.registerTask('testTar', ['testStaticBuild','shell:build','appBuild','shell:appTar']);
	
	grunt.registerTask('bulidTestApk', ['appBuild','shell:buildTestApk']);
	
	grunt.registerTask('bulidDevApk', ['shell:buildDevApk']);
	
	grunt.registerTask('default', ['appTar']);
	
};