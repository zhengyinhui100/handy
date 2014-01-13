/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-12-14										*
*****************************************************************/

/**
 * 模块管理类
 * @class ModuleManager
 */
$Define("handy.module.ModuleManager",
"handy.module.History",
function(History){
	
	var ModuleManager=$HO.createClass();
	
	$HO.extend(ModuleManager.prototype,{
		//history          : null,   //历史记录
		//conf             : null,   //配置参数
		//modules          : null,   //缓存模块
		//container        : null,   //默认模块容器
		//navigator        : null,   //定制模块导航类
		//defModPackage    : "com.xxx.module",  //默认模块所在包名
		
		initialize         : fInitialize,      //初始化模块管理
		go                 : fGo,              //进入模块
		createMod          : fCreateMod,       //新建模块
		getModWrapper      : fGetModWrapper,   //获取模块包装div
		showMod            : fShowMod,         //显示模块
		hideAll            : fHideAll          //隐藏所有模块
	});
	/**
	 * 初始化模块管理
	 * @param {object}oConf {      //初始化配置参数
	 * 			{string}defModPackage  : 默认模块所在包名
	 * 			{string|element|jQuery}container  : 模块容器
	 * 			{Navigator}navigator   : 定制导航类
	 * }
	 */
	function fInitialize(oConf){
		var that=this;
		if(oConf){
			that.conf=oConf;
			$HO.extend(that,oConf);
			that.container=oConf.container?$(oConf.container):$(document.body);
		}
		that.defModPackage=that.defModPackage+".";
		that.history=new History();
		that.modules={};
	}
	/**
	 * 进入模块
	 * @method go(oParams)
	 * @param {object}oParams{  //传入参数
	 * 		modName:模块名称
	 * 		...
	 * }
	 * @param {boolean=}bNotSaveHistory仅当为true时，不保存历史记录
	 */
	function fGo(oParams,bNotSaveHistory){
		var that=this;
		var sModName=oParams.modName;
		var sCurrentMod=that.currentMod;
		var oMods=that.modules;
		var oCurrentMod=oMods[sCurrentMod];
		//如果正好是当前模块，调用模块reset方法
		if(sCurrentMod==sModName){
			oCurrentMod.reset();
			return;
		}
		//当前模块不允许退出，直接返回
		if(oCurrentMod&&!oCurrentMod.exit()){
			return false;
		}
		//如果在缓存模块中，直接显示该模块，并且调用该模块cache方法
		var oMod=oMods[sModName];
		//如果模块有缓存
		if(oMod&&oMod.useCache){
			that.showMod(oMod);
			oMod.cache(oParams);
		}else{
			//否则新建一个模块
			that.createMod(oParams);
		}
		if(bNotSaveHistory!=true){
			//保存状态
			that.history.saveState({
				onStateChange:$H.Function.bind(that.go,that),
				param:oParams
			});
		}
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
		$Require(that.defModPackage+sModName,function(Module){
			var oMod=new Module();
			oMod.name=sModName;
			oMod.mType=sModName;
			oMod.initParam=oParams;
			//模块初始化
			oMod.init(oParams);
			oMod.beforeRender();
			//模块渲染
			var oModWrapper=that.getModWrapper(sModName);
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
		if(oDiv.length==0){
			oDiv=$('<div id="'+sId+'"></div>');
		}
		return oDiv;
	}
	/**
	 * 显示模块
	 * @method showMod
	 * @param
	 */
	function fShowMod(oMod){
		var that=this;
		//如果导航类方法返回true，则不使用模块管理类的导航
		if(that.navigator&&that.navigator.navigate(oMod,that)){
			return false;
		}else{
			this.hideAll();
			oMod.wrapper.show();
		}
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