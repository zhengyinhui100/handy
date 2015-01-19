module.exports = function(grunt) {
	'use strict';

	var cssDir='src/css/';
	var buildDir='build/';
	var buildVersionDir=buildDir;
	
	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		clean:{
			options:{force:true},
			src:[cssDir,buildDir]
		},
		less : {
			src : {
				expand : true,
				cwd : "src/less",
				src : "*.less",
				dest:'src/css',
				ext : ".css"
			}
		},
		copy:{
			fixLess:{
				options : {
					process2 : function(content, srcpath) {
						return content.replace(/([0-9\.]+px)/g, function(match,$1){
							var v=$1.replace('px','');
							if(v=='1'){
								return $1;
							}
							v=(1/16)*parseInt(v);
							v=Math.ceil(v*1000)/1000;
							v=v+'em';
							grunt.log.writeln($1+"-->"+v);
							return v;
						});
					},
					process : function(content, srcpath) {
						//修正错误的em值
						return content.replace(/([0-9\.]+em)/g, function(match,$1){
							var v=$1.replace('em','');
							v=parseFloat(v);
							//转换成px
							v=v*16;
							grunt.log.writeln(v);
							v=Math.floor(v);
							grunt.log.writeln(v);
							v=(1/16)*v;
							v=Math.ceil(v*1000)/1000;
							v=v+'em';
							if($1!=v){
								grunt.log.writeln($1+"-->"+v);
							}
							return v;
						});
					}
				},
				files:[{
					expand : true,
					cwd : "src/less",
					src : "widget.less",
					dest:'src/less'
				}]
			},
			src:{
				expand : true,
				cwd:'src',
				src : ['css/**','js/**','img/**','lib/**','!img/**/*.ai','!img/**/*.psd'],
				dest :buildVersionDir
			}
		},
		concat : {
			css:{
				src : [
					buildVersionDir+'css/reset.css',
					buildVersionDir+'css/common.css',
					buildVersionDir+'css/icon.css',
					buildVersionDir+'css/widget.css'
				],
				dest : buildVersionDir+'css/<%=pkg.name%>.css'
			},
			jsLoader:{
				src:[
					'src/js/loader/base.js',
					'src/js/loader/Json.js', 
					'src/js/loader/Browser.js', 
					'src/js/loader/Debug.js',
					'src/js/loader/Loader.js'
				],
				// 合并后的JS文件的存放位置
				dest : buildVersionDir+'js/<%= pkg.name %>-loader.js'
			},
			jsOther : {
				// 将要被合并的文件
				src : [
					'src/js/base/Object.js',
					'src/js/base/Class.js',
					'src/js/base/Function.js', 
					'src/js/base/Event.js',
					'src/js/base/Date.js', 
					'src/js/base/String.js',
					'src/js/base/Number.js',
					'src/js/base/Cookie.js', 
					'src/js/base/Util.js',
					'src/js/base/Url.js',
					'src/js/base/Array.js', 
					'src/js/base/Geo.js',
					'src/js/base/Template.js', 
					'src/js/base/HashChange.js',
					'src/js/base/Support.js', 
					'src/js/base/Validator.js',
					'src/js/base/LocalStorage.js', 
					'src/js/base/Adapt.js',
					
					'src/js/util/ImgCompress.js',
					
					'src/js/effect/Animate.js',
					'src/js/effect/Draggable.js',
					
					'src/js/common/AbstractEvents.js',
					
					'src/js/plugin/Device.js',
					'src/js/plugin/Camera.js',
					'src/js/plugin/Geolocation.js',
					
					'src/js/data/DataStore.js',
					'src/js/data/AbstractDao.js',
					'src/js/data/AbstractData.js',
					'src/js/data/Model.js',
					'src/js/data/Collection.js',
					
					'src/js/view/AbstractManager.js',
					'src/js/view/ViewManager.js',
					'src/js/view/AbstractView.js',
					'src/js/view/ModelView.js', 
					'src/js/view/View.js',

					'src/js/module/AbstractModule.js',
					'src/js/module/AbstractNavigator.js',
					'src/js/module/Navigator.js',
					'src/js/module/History.js',
					'src/js/module/ModuleManager.js',
					
					'src/js/component/ComponentManager.js',
					'src/js/component/AbstractComponent.js',
					'src/js/component/Icon.js',
					'src/js/component/Link.js',
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
					'src/js/component/Set.js',
					'src/js/component/Field.js',
					'src/js/component/Form.js',
					'src/js/component/TabItem.js',
					'src/js/component/Tab.js',
					'src/js/component/Toolbar.js',
					'src/js/component/Tips.js',
					'src/js/component/Dialog.js',
					'src/js/component/Menu.js',
					'src/js/component/DatePicker.js',
					'src/js/component/DateSelect.js',
					'src/js/component/AbstractImage.js',
					'src/js/component/Image.js',
					'src/js/component/ImgUpload.js',
					'src/js/component/DisplayImage.js',
					'src/js/component/Crop.js',
					'src/js/component/CropWindow.js',
					'src/js/component/Hcard.js',
					'src/js/component/Vcard.js',
					'src/js/component/Conversation.js',
					'src/js/component/ModelList.js',
					'src/js/component/Editor.js',
					'src/js/component/Share.js',
					'src/js/component/PicCard.js',
					'src/js/component/Waterfall.js',
					'src/js/component/Slide.js'

				],
				// 合并后的JS文件的存放位置
				dest : buildVersionDir+'js/<%= pkg.name %>-other.js'
			},
			jsAll:{
				src:[
					buildVersionDir+'js/<%= pkg.name %>-loader.js',
					buildVersionDir+'js/<%= pkg.name %>-other.js'
				],
				// 合并后的JS文件的存放位置
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
					src:['js/**/*.js','lib/**/*.js'],
					dest:buildVersionDir,
					ext:'.min.js'
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
					src : ['build/handy.min.js'],
					dest : '/var/www/html/handy.min.js'
				}]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-ftpscript');

	grunt.registerTask('online', ['clean','less','copy:src','concat','cssmin','uglify']);
	
	grunt.registerTask('default', ['online']);
	
};
