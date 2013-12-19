/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-12-14										*
*****************************************************************/

/**
 * 模块管理类
 * @class ModuleManager
 */
$Define("handy.module.ModuleManager","handy.module.History",function(History){
	
	var ModuleManager=$HO.createClass();
	
	$HO.extend(ModuleManager.prototype,{
		//history          : null,   //历史记录
		//conf             : null,   //配置参数
		//modules          : null,   //缓存模块
		//container        : null,   //默认模块容器
		
		initialize         : fInitialize,      //初始化模块管理
		go                 : fGo,              //进入模块
		createMod          : fCreateMod,       //新建模块
		getModWrapper      : fGetModWrapper,   //获取模块包装div
		showMod            : fShowMod,         //显示模块
		hideAll            : fHideAll          //隐藏所有模块
	});
	/**
	 * 初始化模块管理
	 * @param {object}oConf 初始化配置参数
	 */
	function fInitialize(oConf){
		var that=this;
		that.history=new History();
		that.modules={};
		if(oConf){
			that.conf=oConf;
			that.container=oConf.container?$(oConf.container):$(document.body);
		}
	}
	/**
	 * 进入模块
	 * @method go(oParams)
	 * @param
	 */
	function fGo(oParams){
		var that=this;
		var sModName=oParams.modName;
		var oMods=that.modules;
		//如果在缓存模块中，直接显示该模块，并且调用该模块cache方法
		var oMod=oMods[sModName];
		//如果模块有缓存
		if(oMod&&oMod.useCache){
			that.showMod(oMod);
			oMod.cache(oParams);
		}else{
			that.createMod(oParams);
		}
		//保存状态
		that.history.saveState({
			callback:that.go,
			param:oParams,
			scope:that
		});
	}
	/**
	 * 新建模块
	 * @method createMod
	 * @param 
	 */
	function fCreateMod(oParams){
		var that=this;
		var sModName=oParams.modName;
		//请求模块
		$Require(sModName,function(Module){
			var oMod=new Module();
			oMod.initParam=oParams;
			//模块初始化
			oMod.init(oParams);
			oMod.beforeRender();
			//模块渲染
			var oModWrapper=that.getModWrapper();
			oMod.wrapper=oModWrapper;
			var oContainer=oMod.container=oMod.container?$(oMod.container):that.container;
			if(oMod.getHtml){
				oModWrapper.html(oMod.getHtml());
				oContainer.append(oModWrapper);
			}
			oMod.render(oModWrapper);
			that.showMod(oMod);
			oMod.afterRender();
			that.modules[sModName]=oMod;
		});
	}
	/**
	 * 获取模块包装div
	 * @method getModWrapper
	 * @param {string}sModName
	 */
	function fGetModWrapper(sModName){
		var that=this;
		var sId="modWrapper_"+sModName;
		var oDiv=$("#"+sId);
		if(oDiv.length=0){
			oDiv=$.createElement("div");
			oDiv.attr("id",sId);
		}
		return oDiv;
	}
	/**
	 * 显示模块
	 * @method showMod
	 * @param
	 */
	function fShowMod(oMod){
		this.hideAll();
		oMod.wrapper.show();
		oMod.isActive=true;
	}
	/**
	 * 隐藏所有模块
	 * @method hideAll
	 * @param
	 */
	function fHideAll(){
		var oModules=this.modules
		for(var module in oModules){
			oModules[module].wrapper.hide();
			oModules[module].isActive=false;
		}
	}
	
	return ModuleManager;
	
});