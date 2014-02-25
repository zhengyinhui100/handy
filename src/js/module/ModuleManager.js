/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-12-14										*
*****************************************************************/

/**
 * 模块管理类
 * @class ModuleManager
 */
//handy.module.ModuleManager
$Define("m.ModuleManager",
"m.History",
function(History){
	
	var ModuleManager=$HO.createClass();
	
	$HO.extend(ModuleManager.prototype,{
		//history          : null,   //历史记录
		//conf             : null,   //配置参数
		//modules          : null,   //缓存模块
		//container        : null,   //默认模块容器
		//navigator        : null,   //定制模块导航类
		//defModPackage    : "com.xxx.module",  //默认模块所在包名
		
		_getModWrapper     : _fGetModWrapper,   //获取模块包装div
		_createMod         : _fCreateMod,       //新建模块
		_showMod           : _fShowMod,         //显示模块
		_hideAll           : _fHideAll,         //隐藏所有模块
		_destroy           : _fDestroy,         //销毁模块
		
		initialize         : fInitialize,      //初始化模块管理
		go                 : fGo,              //进入模块
		back               : fBack             //后退一步
	});
	
	/**
	 * 新建模块
	 * @method _createMod
	 * @param 
	 */
	function _fCreateMod(oParams){
		var me=this;
		var sModName=oParams.modName;
		//先标记为正在准备中，新建成功后赋值为模块对象
		me.modules[sModName]={waiting:true};
		//请求模块
		$Require(me.defModPackage+sModName,function(Module){
			var oMod=new Module();
			oMod.name=sModName;
			oMod.mType=sModName;
			oMod.initParam=oParams;
			me.modules[sModName]=oMod;
			//模块初始化
			oMod.init(oParams);
			oMod.beforeRender();
			//模块渲染
			var oModWrapper=me._getModWrapper(sModName);
			oMod._container=oModWrapper;
			var oContainer=oMod.renderTo?$(oMod.renderTo):me.container;
			oModWrapper.html(oMod.getHtml());
			oContainer.append(oModWrapper);
			$HL.fire('afterRender',oModWrapper);
			oMod.render(oModWrapper);
			//可能加载完时，已切换到其它模块了
			if(me.currentMod==sModName){
				me._showMod(oMod);
			}
			oMod.afterRender();
		});
	}
	/**
	 * 获取模块包装div
	 * @method _getModWrapper
	 * @param {string}sModName
	 */
	function _fGetModWrapper(sModName){
		var me=this;
		var sId="modWrapper_"+sModName;
		var oDiv=$("#"+sId);
		if(oDiv.length==0){
			oDiv=$('<div id="'+sId+'" class="js-module m-module"></div>');
		}
		return oDiv;
	}
	/**
	 * 显示模块
	 * @method _showMod
	 * @param
	 */
	function _fShowMod(oMod){
		var me=this;
		//如果导航类方法返回true，则不使用模块管理类的导航
		if(me.navigator&&me.navigator.navigate(oMod,me)){
			return false;
		}else{
			this._hideAll();
			oMod._container.show();
		}
		oMod.isActive=true;
	}
	/**
	 * 隐藏所有模块
	 * @method _hideAll
	 * @param
	 */
	function _fHideAll(){
		var oModules=this.modules
		for(var module in oModules){
			oModules[module]._container.hide();
			oModules[module].isActive=false;
		}
	}
	/**
	 * 销毁模块
	 * @method _destroy
	 * @param {Module}oMod 待销毁的模块
	 */
	function _fDestroy(oMod){
		var me=this;
		oMod.destroy();
		delete me.modules[oMod.name];
	}
	/**
	 * 初始化模块管理
	 * @param {object}oConf {      //初始化配置参数
	 * 			{string}defModPackage  : 默认模块所在包名
	 * 			{string|element|jQuery}container  : 模块容器
	 * 			{Navigator}navigator   : 定制导航类
	 * }
	 */
	function fInitialize(oConf){
		var me=this;
		if(oConf){
			me.conf=oConf;
			$HO.extend(me,oConf);
			me.container=oConf.container?$(oConf.container):$(document.body);
		}
		me.defModPackage=me.defModPackage+".";
		me.history=new History();
		me.modules={};
	}
	/**
	 * 进入模块
	 * @method go(oParams)
	 * @param {Object|string}param  直接模块名字符串或者{  //传入参数
	 * 		modName:模块名称
	 * 		...
	 * }
	 * @param {boolean=}bNotSaveHistory仅当为true时，不保存历史记录
	 */
	function fGo(param,bNotSaveHistory){
		var me=this;
		if(typeof param=="string"){
			param={modName:param};
		}
		var sModName=param.modName;
		//当前显示的模块名
		var sCurrentMod=me.currentMod;
		var oMods=me.modules;
		var oCurrentMod=oMods[sCurrentMod];
		//如果要进入的正好是当前显示模块，调用模块reset方法
		if(sCurrentMod==sModName){
			if(!oCurrentMod.waiting){
				oCurrentMod.reset();
			}
			return;
		}
		
		//当前显示模块不允许退出，直接返回
		if(oCurrentMod&&!oCurrentMod.waiting&&!oCurrentMod.exit()){
			return false;
		}
		
		//如果在缓存模块中，直接显示该模块，并且调用该模块cache方法
		var oMod=oMods[sModName];
		//如果模块有缓存
		if(oMod){
			//标记使用缓存，要调用cache方法
			if(oMod.useCache){
				me._showMod(oMod);
				oMod.cache(param);
			}else if(!oMod.waiting){
				//标记不使用缓存，销毁新建
				me._destroy(oMod);
				me._createMod(param);
			}
			//如果模块已在请求中，直接略过，等待新建模块的回调函数处理
		}else{
			//否则新建一个模块
			me._createMod(param);
		}
		if(bNotSaveHistory!=true){
			//保存状态
			me.history.saveState({
				onStateChange:$H.Function.bind(me.go,me),
				param:param
			});
		}
		//重新标记当前模块
		me.currentMod=sModName;
	}
	/**
	 * 后退一步
	 * @method back
	 */
	function fBack(){
		
	}
	
	return ModuleManager;
	
});