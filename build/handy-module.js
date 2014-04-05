/* Handy v1.0.0-dev | 2014-04-05 | zhengyinhui100@gmail.com */
/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-12-14										*
*****************************************************************/
//handy.module.AbstractModule
$Define("M.AbstractModule","CM.View",function (View) {
	/**
	 * 模块基类
	 * 
	 * @class AbstractModule
	 */
	var AbstractModule = $H.createClass();
	
	$H.inherit(AbstractModule,View, {
		
//		isLoaded       : false,          //{boolean}模块是否已载入
//		isActived      : false,          //{boolean}模块是否是当前活跃的
//		renderTo       : null,           //自定义模块容器，{jQuery}对象或选择器
		                                 //模块初始化后以_container为准，获取需用getEl方法
//		notCache       : false,          //{boolean}是否不使用cache，默认使用,仅当配置成true时不使用
//      clearCache     : false,          //仅清除一次当前的缓存，下次进入模块时执行清除并恢复原先缓存设置
//		name           : null,           //{string}模块名
//		chName         : null,           //{string}模块的中文名称
		
//		getData        : null,           //{function()}获取该模块的初始化数据
//		clone          : null,           //{function()}克隆接口
		useCache       : $H.noop,        //判断是否使用模块缓存
		cache          : $H.noop,        //显示模块缓存时调用
		init           : $H.noop,        //初始化函数, 在模块创建后调用（在所有模块动作之前）
		reset          : $H.noop,        //重置函数, 在该模块里进入该模块时调用
		exit           : function(){return true},  //离开该模块前调用, 返回true允许离开, 否则不允许离开
		cleanCache     : fCleanCache     //清除模块缓存
	});
	/**
	 * 清除模块缓存
	 */
	function fCleanCache(){
		this.clearCache=true;
	}
	
	return AbstractModule;
});/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-12-20										*
*****************************************************************/
//handy.module.AbstractNavigator
$Define("M.AbstractNavigator","handy.base.Object",function (Object) {
	/**
	 * 模块导航效果基类
	 * 
	 * @class AbstractNavigator
	 */
	var AbstractNavigator = $H.createClass();
	
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
$Define("M.History",
'handy.base.HashChange',
function(HashChange){

	var History=$H.createClass();
	
	var _nIndex=0;
	
	$H.extend(History.prototype,{
		initialize         : fInitialize,      //历史记录类初始化
		stateChange        : fStateChange,     //历史状态改变
		saveState          : fSaveState,       //保存当前状态
		saveHash           : fSaveHash,        //保存参数到hash
		getHashParam       : fGetHashParam,    //获取当前hash参数
		getCurrentState    : fGetCurrentState, //获取当前状态
		getPreState        : fGetPreState,     //获取前一个状态
		back               : fBack             //后退一步
	});
	/**
	 * 历史记录类初始化
	 * @method initialize
	 * @param {string=}sKey 历史记录类的key，用于区分可能的多个history实例
	 * @param {function=}fError 错误处理函数
	 */
	function fInitialize(sKey,fError){
		var me=this;
		if(typeof sKey=="function"){
			fError=sKey;
			sKey=null;
		}
		me.error=fError||$H.noop;
		me.key=sKey||'handy';
		me.states=[];
		HashChange.listen($H.Function.bind(me.stateChange,me));
	}
	/**
	 * 历史状态改变
	 * @method stateChange
	 */
	function fStateChange(){
		var me=this,
			oHashParam=me.getHashParam(),
		    sKey=oHashParam.hKey,
		 	sCurKey=me.currentKey,
		 	aStates=me.states,
		 	oCurState=aStates[sCurKey];
		//跟当前状态一致，不需要调用stateChange，可能是saveState触发的hashchange
		//&&$H.equals(oHashParam.param,oCurState.param)
		if(sKey==sCurKey){
			return false;
		}
		var oState=aStates[sKey];
		var bResult;
		if(oState){
			bResult=oState.onStateChange(oState.param,true);
		}else{
			$D.warn("hisory state not found");
			bResult=me.error('stateNotFound',oHashParam);
		}
		//如果调用不成功，则恢复原先的hashstate
		if(bResult!=true){
			oHashParam={
				hKey    : sCurKey,
				param   : oCurState.param
			};
			me.saveHash(oHashParam);
		}else{
			//改变当前hkey
			me.currentKey=sKey;
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
		var sHistoryKey=me.currentKey=me.key+(++_nIndex);
		me.states.push(sHistoryKey);
		me.states[sHistoryKey]=oState;
		me.saveHash({
			hKey    : sHistoryKey,
			param   : oState.param
		});
	}
	/**
	 * 保存状态值到hash中
	 * @method saveHash
	 * @param {*}param 要保存到hash中的参数
	 */
	function fSaveHash(param){
		//这里主动设置之后还会触发hashchange，不能在hashchange里添加set方法屏蔽此次change，因为可能不止一个地方需要hashchange事件
		$H.setHash("#"+$H.Json.stringify(param));
	}
	/**
	 * 获取当前hash参数
	 * @method getHashParam
	 * @return {object} 返回当前hash参数
	 */
	function fGetHashParam(){
		var me=this;
		try{
			var sHash=$H.getHash().replace("#","");
			var oHashParam=$H.parseJson(sHash);
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
			var oHashParam=me.getHashParam();
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
$Define("M.ModuleManager",
["M.History",
"CM.AbstractManager"],
function(History,AbstractManager){
	
	var ModuleManager=$H.createClass();
	
	//TODO 使用AbstractManager的方法
	$H.inherit(ModuleManager,AbstractManager,{
		
		type               : 'module',
		
		//history          : null,   //历史记录
		//conf             : null,   //配置参数
		//container        : null,   //默认模块容器
		//navigator        : null,   //定制模块导航类
		//defModPackage    : "com.xxx.module",  //默认模块所在包名
		
//		requestMod         : '',     //正在请求的模块名
//		currentMod         : '',     //当前模块名
		
		_createMod         : _fCreateMod,       //新建模块
		_showMod           : _fShowMod,         //显示模块
		_destroy           : _fDestroy,         //销毁模块
		
		initialize         : fInitialize,      //初始化模块管理
		go                 : fGo,              //进入模块
		update             : fUpdate,          //更新模块
		clearCache         : fClearCache,      //清除缓存模块
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
			var oOptions={
				renderTo:me.container,
				name:sModName,
				xtype:sModName,
				_id:me.generateId(),
				extCls:'js-module m-module',
				hidden:true
			};
			$H.extend(oOptions,oParams);
			var oMod=new Module(oOptions);
			me.modules[sModName]=oMod;
			$H.trigger('afterRender',oMod.getEl());
			//可能加载完时，已切换到其它模块了
			if(me.requestMod==sModName){
				me._showMod(oMod);
			}
		});
	}
	/**
	 * 显示模块
	 * @method _showMod
	 * @param
	 */
	function _fShowMod(oMod){
		var me=this;
		var oCurMod=me.modules[me.currentMod];
		//如果导航类方法返回true，则不使用模块管理类的导航
		if(!(me.navigator&&me.navigator.navigate(oMod,oCurMod,me))){
			if(oCurMod){
				oCurMod.hide();
			}
			oMod.show();
		}
		if(oCurMod){
			oCurMod.isActive=false;
		}
		oMod.isActive=true;
		me.currentMod=oMod.name;
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
			$H.extend(me,oConf);
			me.container=oConf.container?$(oConf.container):$(document.body);
		}
		me.defModPackage=me.defModPackage+".";
		me.history=new History(function(sCode,oParam){
			me.go(oParam.param);
		});
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
	 * @return {boolean} true表示成功，false表示失败
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
		if(oCurrentMod&&!oCurrentMod.waiting){
			if(oCurrentMod._forceExit){
				//标记为强制退出的模块不调用exit方法，直接退出，并将_forceExit重置为false
				oCurrentMod._forceExit=false;
			}else if(oCurrentMod.exit()==false){
				//模块返回false，不允许退出
				return false;
			}
		}
		
		//标记当前请求模块，主要用于异步请求模块回调时判断是否已经进了其它模块
		me.requestMod=sModName;
		
		//如果在缓存模块中，直接显示该模块，并且调用该模块cache方法
		var oMod=oMods[sModName];
		//如果模块有缓存
		if(oMod){
			//标记使用缓存，要调用cache方法
			if(oMod.notCache!=true&&oMod.clearCache!=true&&oMod.useCache(param)!=false){
				//恢复设置
				oMod.clearCache==false;
				me._showMod(oMod);
				oMod.cache(param);
			}else if(!oMod.waiting){
				//标记不使用缓存，销毁模块
				me._destroy(oMod);
				//重新标记当前模块
//				me.currentMod=sModName;
				//重新创建模块
				me._createMod(param);
			}
			//如果模块已在请求中，直接略过，等待新建模块的回调函数处理
		}else{
			//否则新建一个模块
			me._createMod(param);
		}
		//主要是处理前进和后退hash变化引起的调用，不需要再保存历史记录
		if(bNotSaveHistory!=true){
			//保存状态
			me.history.saveState({
				onStateChange:$H.Function.bind(me.go,me),
				param:param
			});
		}
		return true;
	}
	/**
	 * 更新模块
	 * @param {Module}oModule 模块对象
	 * @param {Object}oParams 参数
	 */
	function fUpdate(oModule,oParams){
		var oNew=oModule.update(oParams);
		if(oNew){
			this.modules[oModule.name]=oNew;
			$H.trigger('afterRender',oNew.getEl());
		}
	}
	/**
	 * 清除缓存模块
	 * @param {Module}oModule 参数模块
	 */
	function fClearCache(oModule){
		oModule.notCache=true;
	}
	/**
	 * 后退一步
	 * @method back
	 * @param {boolean=} 当传入true时，强制退出当前模块，即不调用模块的exit而直接退出
	 */
	function fBack(bForceExit){
		var me=this;
		if(bForceExit){
			me.modules[me.currentMod]._forceExit=true;
		}
		history.back();
	}
	
	return ModuleManager;
	
});