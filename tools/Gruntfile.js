module.exports = function(grunt) {
	'use strict';

	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		less : {
			src : {
				expand : true,
				cwd : "/Users/hui/Documents/workspace/SportApp/WebContent/less",
				src : "*.less",
				dest:'/Users/hui/Documents/workspace/SportApp/WebContent/sportapp/www/css',
				ext : ".css"
			}
		},
		cssmin : {
			add_banner : {
				options : {
					banner : '/* <%= pkg.name %> v<%= pkg.version %> | <%= grunt.template.today("yyyy-mm-dd") %> | zhengyinhui100@gmail.com */\n'
				},
				files : {
					'dist/<%= pkg.name %>.min.css' : [
												'src/css/reset.css',
												'src/css/icon.css',
												'src/css/widget.css'
											]
				}
			}
		},
		concat : {
			js : {
				// 将要被合并的文件
				src : [
					'src/js/base/base.js',
					'src/js/base/Json.js', 
					'src/js/base/Object.js',
					'src/js/base/Browser.js', 
					'src/js/base/Debug.js',
					'src/js/base/Function.js', 
					'src/js/base/Class.js',
					'src/js/base/Loader.js', 
					'src/js/base/Events.js',
					'src/js/base/Date.js', 
					'src/js/base/String.js',
					'src/js/base/Cookie.js', 
					'src/js/base/Util.js',
					'src/js/base/Array.js', 
					'src/js/base/Geo.js',
					'src/js/base/Template.js', 
					'src/js/base/HashChange.js',
					'src/js/base/Support.js', 
					'src/js/base/Validator.js',
					'src/js/base/LocalStorage.js', 
					'src/js/base/adapt.js',
					
					'src/js/common/AbstractEvents.js',
					'src/js/common/DataStore.js',
					'src/js/common/AbstractDao.js',
					'src/js/common/Model.js',
					'src/js/common/Collection.js',
					'src/js/common/AbstractManager.js',
					'src/js/common/ViewManager.js',
					'src/js/common/AbstractView.js',
					'src/js/common/ModelView.js', 
					'src/js/common/View.js',

					'src/js/component/ComponentManager.js',
					'src/js/component/AbstractComponent.js',
					'src/js/component/Icon.js',
					'src/js/component/Button.js',
					'src/js/component/Desc.js',
					'src/js/component/Panel.js',
					'src/js/component/Popup.js',
					'src/js/component/ControlGroup.js',
					'src/js/component/Radio.js',
					'src/js/component/Checkbox.js',
					'src/js/component/Select.js',
					'src/js/component/Input.js',
					'src/js/component/Label.js',
					'src/js/component/RowItem.js',
					'src/js/component/Set.js', 'src/js/component/Field.js',
					'src/js/component/Form.js',
					'src/js/component/TabItem.js',
					'src/js/component/Tab.js',
					'src/js/component/Toolbar.js',
					'src/js/component/Tips.js',
					'src/js/component/Dialog.js',
					'src/js/component/Menu.js',
					'src/js/component/DatePicker.js',
					'src/js/component/DateSelect.js',
					'src/js/component/Hcard.js',
					'src/js/component/Vcard.js',
					'src/js/component/Conversation.js',
					'src/js/component/ModelList.js',

					'src/js/module/AbstractModule.js',
					'src/js/module/AbstractNavigator.js',
					'src/js/module/History.js',
					'src/js/module/ModuleManager.js'
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
		copy : {
			img : {
				files : [{
							expand : true,
							cwd:'src/img',
							src : ['**/*','!**/*.ai'],
							dest : 'dist/img'
						}]
			},
			js:{
				files : [{
							expand : true,
							cwd:'src/js',
							src : ['**/*'],
							dest : 'dist/js'
						}]
			}
		},
		jshint : {
			// define the files to lint
			files : ['Gruntfile.js', 'src/js/**/*.js'],
			// configure JSHint (documented at http://www.jshint.com/docs/)
			options : {
				globals : {
					jQuery : true,
					console : true,
					module : true
				}
			}
		},
		watch : {
			jshint:{
				files : ['<%= jshint.files %>'],
				tasks : ['jshint']
			},
			less:{
				files : ['src/less/*'],
				tasks : ['less']
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
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-ftpscript');

	grunt.registerTask('online', ['less','cssmin','concat','uglify','copy']);
	
	grunt.registerTask('default', ['less']);
	
};
