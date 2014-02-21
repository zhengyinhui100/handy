/* Handy v1.0.0-dev | 2014-02-21 | zhengyinhui100@gmail.com */
/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-12-14										*
*****************************************************************/
//handy.module.AbstractModule
$Define("m.AbstractModule","cm.AbstractView",function (AbstractView) {
	/**
	 * 模块基类
	 * 
	 * @class AbstractModule
	 */
	var AbstractModule = $HO.createClass();
	
	$HO.inherit(AbstractModule,AbstractView,null, {
		
//		isLoaded       : false,          //{boolean}模块是否已载入
//		isActived      : false,          //{boolean}模块是否是当前活跃的
//		renderTo       : null,           //自定义模块容器，{jQuery}对象或选择器
		                                 //模块初始化后以_container为准，获取需用getEl方法
		useCache       : true,           //{boolean}是否使用cache
//		name           : null,           //{string}模块名
//		chName         : null,           //{string}模块的中文名称
		
//		getData        : null,           //{function()}获取该模块的初始化数据
//		clone          : null,           //{function()}克隆接口
		initialize     : fInitialize,    //模块类创建时初始化
		cache          : function(){},   //显示模块缓存
		init           : function(){},   //初始化函数, 在模块创建后调用（在所有模块动作之前）
		beforeRender   : function(){},   //模块渲染前调用
		render         : function(){},   //模块渲染
		afterRender    : function(){},   //模块渲染后调用
		reset          : function(){},   //重置函数, 在该模块里进入该模块时调用
		exit           : function(){return true},   //离开该模块前调用, 返回true允许离开, 否则不允许离开
		destroy        : fDestroy,       //模块销毁
		getHtml        : fGetHtml        //获取该模块的html
	});
	/**
	 * 构造函数
	 * @param{any} oConf 模块配置对象
	 * @return{void} 
	 */
	function fInitialize(oConf) {
		//Object.extend(this, oConf);
		this.conf = oConf;
	}
	/**
	 * 销毁模块
	 * @method destroy
	 */
	function fDestroy(){
		var me=this;
		me.getEl().remove();
	}
	/**
	 * 获取该模块的html
	 * @method getHtml
	 * @return {string} 返回模板html
	 */
	function fGetHtml(){
		var me=this;
		if(!me.tmpl){
			return '';
		}
		//将组件数组方式的模板转为字符串
		if(typeof me.tmpl!='string'){
			me.constructor.prototype.tmpl=me.tmpl.join('');
		}
		//由模板生成组件html
		var sHtml=$H.Template.tmpl({id:me.name,tmpl:me.tmpl},me);
		return sHtml;
	}
	
	return AbstractModule;
});/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-01-25										*
*****************************************************************/
/**
 * 数据访问对象抽象类，模块的dao都要继承此类，dao内的方法只可以使用此类的方法进行数据操作，以便进行统一的管理
 */
//handy.module.AbstractDao
$Define('m.AbstractDao',function(){
	
	var AbstractDao=$HO.createClass();
	
	$HO.extend(AbstractDao,{
		ajax         : fAjax,        //ajax方法
		beforeSend   : $H.noop,      //发送前处理
		error        : $H.noop,      //错误处理
		success      : $H.noop       //成功处理
	});
	
	/**
	 * ajax
	 * @method ajax
	 * @param {Object}oParams
	 * 
	 */
	function fAjax(oParams){
		var me=this;
		me.beforeSend(oParams);
		oParams.error=$HF.intercept(me.error,oParams.error);
		oParams.success=$HF.intercept(me.success,oParams.success);
		return $.ajax(oParams);
	}
	
	return AbstractDao;
	
});/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-01-25										*
*****************************************************************/
/**
 * 视图抽象类，模块的视图都要继承此类
 */
//handy.module.AbstractView
$Define('m.AbstractView',function(){
	
	var AbstractView=$HO.createClass();
	
	$HO.extend(AbstractView.prototype,{
	});
	
});/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-12-20										*
*****************************************************************/
//handy.module.AbstractNavigator
$Define("m.AbstractNavigator","handy.base.Object",function (Object) {
	/**
	 * 模块导航效果基类
	 * 
	 * @class AbstractNavigator
	 */
	var AbstractNavigator = Object.createClass();
	
	Object.extend(AbstractNavigator.prototype, {
		navigate      : function(){}      //显示导航效果，参数是当前进入的模块实例和模块管理类实例，此方法返回true表示不需要模块管理类的导航功能
	});
	
	return AbstractNavigator;
});/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-12-15										*
*****************************************************************/
/**
 * 历史记录类，用于记录和管理浏览历史
 * @class handy.module.History
 */
//handy.module.History
$Define("m.History",
'handy.base.HashChange',
function(HashChange){

	var History=$HO.createClass();
	
	var _nIndex=0;
	
	$HO.extend(History.prototype,{
		initialize         : fInitialize,      //历史记录类初始化
		stateChange        : fStateChange,     //历史状态改变
		saveState          : fSaveState,       //保存当前状态
		getHashParam       : fGetHashParam,    //获取当前hash参数
		getCurrentState    : fGetCurrentState, //获取当前状态
		getPreState        : fGetPreState,     //获取前一个状态
		back               : fBack             //后退一步
	});
	/**
	 * 历史记录类初始化
	 * @method initialize
	 * @param {?string} sKey历史记录类的key，用于区分可能的多个history实例
	 */
	function fInitialize(sKey){
		var me=this;
		me.key=sKey||'handy';
		me.states=[];
		HashChange.listen($H.Function.bind(me.stateChange,me));
	}
	/**
	 * 历史状态改变
	 * @method stateChange
	 */
	function fStateChange(){
		var me=this;
		var oHashParam=me.getHashParam();
		var sKey=oHashParam.hKey;
		var aStates=me.states;
		//跟当前状态一致，不需要调用stateChange，可能是saveState触发的hashchange
		if(sKey==aStates[aStates.length-1]){
			//return;
		}
		var oState=aStates[sKey];
		if(oState){
			oState.onStateChange(oState.param,true);
		}
	}
	/**
	 * 保存当前状态
	 * @method saveState
	 * @param {object} oState{
	 * 				{object}param            : 进入模块的参数
	 * 				{function}onStateChange  : 历史状态变化时的回调函数
	 * 	}
	 */
	function fSaveState(oState){
		var me=this;
		var sHistoryKey=me.key+(++_nIndex);
		me.states.push(sHistoryKey);
		me.states[sHistoryKey]=oState;
		var oHashParam={
			hKey    : sHistoryKey,
			param : oState.param
		};
		$HU.setHash("#"+JSON.stringify(oHashParam));
	}
	/**
	 * 获取当前hash参数
	 * @method getHashParam
	 * @return {object} 返回当前hash参数
	 */
	function fGetHashParam(){
		var me=this;
		try{
			var sHash=$HU.getHash().replace("#","");
			var oHashParam=JSON.parse(sHash);
			return oHashParam;
		}catch(e){
			$H.Debug.warn("History.getCurrentState:parse hash error:"+e.message);
		}
	}
	/**
	 * 获取当前状态
	 * @method getCurrentState
	 * @return {object} 返回当前状态
	 */
	function fGetCurrentState(){
		var me=this;
		try{
			var oHashParam=me.getHashParam();
			return me.states[oHashParam.hKey];
		}catch(e){
			$H.Debug.warn("History.getCurrentState:parse hash error:"+e.message);
		}
	}
	/**
	 * 获取前一个状态
	 * @method getPreState
	 * @return {object} 返回前一个状态
	 */
	function fGetPreState(){
		var me=this;
		try{
			var oHashParam=JSON.parse($HU.getHash().replace("#",""));
			var sHKey=oHashParam.hKey;
			var aStates=me.states;
			var nLen=aStates.length;
			for(var i=0;i++;i<nLen){
				if(aStates[i]==sHKey){
					return i>0?aStates[aStates[--i]]:null;
				}
			}
		}catch(e){
			$H.Debug.error("History.getPreState error:"+e.message,e);
		}
	}
	/**
	 * 后退一步
	 * @method back
	 */
	function fBack(){
		var me=this;
		var oState=me.getPreState();
		if(oState){
			oState.onStateChange(oState.param);
		}
	}
	
	return History;
	
});/****************************************************************
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
		go                 : fGo               //进入模块
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
	 * @param {object}oParams{  //传入参数
	 * 		modName:模块名称
	 * 		...
	 * }
	 * @param {boolean=}bNotSaveHistory仅当为true时，不保存历史记录
	 */
	function fGo(oParams,bNotSaveHistory){
		var me=this;
		var sModName=oParams.modName;
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
				oMod.cache(oParams);
			}else if(!oMod.waiting){
				//标记不使用缓存，销毁新建
				me._destroy(oMod);
				me._createMod(oParams);
			}
			//如果模块已在请求中，直接略过，等待新建模块的回调函数处理
		}else{
			//否则新建一个模块
			me._createMod(oParams);
		}
		if(bNotSaveHistory!=true){
			//保存状态
			me.history.saveState({
				onStateChange:$H.Function.bind(me.go,me),
				param:oParams
			});
		}
		//重新标记当前模块
		me.currentMod=sModName;
	}
	
	return ModuleManager;
	
});