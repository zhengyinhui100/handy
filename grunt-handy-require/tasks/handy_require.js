/*
 * grunt-handy-require
 * https://github.com/zhengyinhui100/handy
 *
 * Copyright (c) 2014 zyh
 * Licensed under the MIT license.
 */

'us8e strict';

module.exports = function(grunt) {

	var _alias={};                 //存储别名，公共库建议大写，以便更好地与普通名称区别开，具体项目的别名建议小写
	
	var _oCache={};
	var _aDepTree=[];
	var _sCurrentId;
		
	function fAlias(sAlias,sOrig){
		if(typeof sAlias==='object'){
			for(var k in sAlias){
				fAlias(k,sAlias[k]);
			}
			return;
		}
		var oAlias=_alias;
		//创建别名
		if(sOrig){
			if(oAlias[sAlias]){
				$D.error('别名已被使用'+sAlias+':'+oAlias[sAlias]);
			}else{
				oAlias[sAlias]=sOrig;
			}
		}else if(sAlias){
			//转换别名
			var sName=sAlias,nIndex=sAlias.length-1,sSuffix='';
			do{
				//找到别名返回实名
				if(oAlias[sName]){
					return oAlias[sName]+sAlias.substring(nIndex);
				}
				//截掉最后一截再尝试
				nIndex=sName.lastIndexOf('.');
			}while(nIndex>0&&(sName=sName.substring(0,nIndex)))
			return sAlias;
		}else{
			return oAlias;
		}
	}
	
	function $Define(sId,aDeps,factory){
		//读取实名
		sId=fAlias(sId);
		_sCurrentId=sId;
		var nLen=arguments.length;
		if(nLen==2){
			factory=aDeps;
			aDeps=[];
		}
		//检出factory方法内声明的$Require依赖，如：var m=$Require('m');
		if(typeof factory==='function'){
			var m,sFactoryStr=factory.toString();
			var r=/\$Require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
			while(m=r.exec(sFactoryStr)){
				aDeps.push(m[1]);
			}
		}
		var oParent=_oCache[sId];
		if(!oParent){
			oParent=_oCache[sId]={id:sId,children:[]};
			_aDepTree.push(oParent);
		}
		for(var i=0;i<aDeps.length;i++){
			var sDepId=aDeps[i];
			sDepId=fAlias(sDepId);
			var oChild=_oCache[sDepId];
			if(!oChild){
				oChild=_oCache[sDepId]={id:sDepId,children:[]};
			}
			oParent.children.push(oChild);
		}
		
	}
	// Please see the Grunt documentation for more information regarding task
	// creation: http://gruntjs.com/creating-tasks

	grunt.registerMultiTask('handy_require', 'handy build tool', function() {
		// Merge task-specific and/or target-specific options with these defaults.
		var options = this.options({
			separator : ';'
		});
		var oContents={};
		var data=this.data;
		//定义别名
		fAlias(data.alias);
		// Iterate over all specified file groups.
		this.files.forEach(function(f) {
			// Concat specified files.
			var src = f.src.filter(function(filepath) {
				// Warn on and remove invalid source files (if nonull was set).
				if (!grunt.file.exists(filepath)) {
					grunt.log.warn('Source file "' + filepath + '" not found.');
					return false;
				} else {
					return true;
				}
			}).map(function(filepath) {
				// Read file source.
				var content=grunt.file.read(filepath);
				//
				if(content.indexOf('$Define')>0){
					eval(content);
					oContents[_sCurrentId]=content;
				}
				return content;
				
			}).join(grunt.util.normalizelf(options.separator));

		});
		
		var pkgFilePath=data.dest+'/'+(data.pkgName||'project.pkg.js');
		
		var sCode='';
		var _fTraversal=function(aChildren){
			if(!aChildren){
				return;
			}
			for(var i=0;i<aChildren.length;i++){
				var oChild=aChildren[i];
				_fTraversal(oChild.children);
				var sContent=oContents[oChild.id];
				if(sContent){
					sCode+=sContent+'\n';
					delete oContents[oChild.id];
				}
			}
		}
		_fTraversal(_aDepTree);
		
		grunt.file.write(pkgFilePath, sCode);
		
		
	});

};