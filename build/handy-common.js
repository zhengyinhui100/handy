/* Handy v1.0.0-dev | 2014-04-13 | zhengyinhui100@gmail.com */
/**
 * 抽象事件类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-03-20
 */
//"handy.common.AbstractEvents"
$Define('CM.AbstractEvents',
function(){
	
	var AbstractEvents=$H.createClass();
	
	$H.extend(AbstractEvents.prototype,$H.Events);
	
	$H.extend(AbstractEvents.prototype,{
		_eventCache          : {},                     //自定义事件池
		_listenTo            : [],                     //存储对其它对象的监听
		_parseListenToEvents : _fParseListenToEvents,  //
		listenTo             : fListenTo,              //监听指定对象的事件
		unlistenTo           : fUnlistenTo             //移除对其它对象的监听
	});
	/**
	 * 处理对象类型或者空格相隔的多事件
	 * @method _parseListenToEvents(sMethod,name[,param,..])
	 * @param {string}sMethod 调用的方法名
	 * @param {CM.AbstractEvents}oTarget 参数对象，继承自AbstractEvents的实例对象
	 * @param {Object|string}name 事件名称，'event1 event2'或{event1:func1,event:func2}
	 * 							事件名称支持命名空间(".name")，如：change.one
	 * @param {*=}param 附加参数，具体参照对应的方法
	 * @return {boolean} true表示已成功处理事件，false表示未处理
	 */
	function _fParseListenToEvents(sMethod,oTarget,name,param){
		var me=this;
		var aArgs=$H.toArray(arguments,3);
		return me._parseEvents(name,function(aParams){
			aParams.unshift(oTarget);
			me[sMethod].apply(me,aParams.concat(aArgs));
		});
	}
	/**
	 * 监听指定对象的事件
	 * @param {CM.AbstractEvents}oTarget 参数对象，继承自AbstractEvents的实例对象
	 * 其余参数同base.Events.on
	 */
	function fListenTo(oTarget,name,fHandler,context,nTimes){
		var me=this;
		if(me._parseListenToEvents('listenTo',oTarget,name,fHandler,context,nTimes)){
			return;
		}
		if(typeof context=='number'){
			nTimes=context;
			context=null;
		}
		context=context||me;
		var fCall=me._delegateHandler(fHandler,context);
		me._listenTo.push({
			target:oTarget,
			name:name,
			delegation:fCall,
			handler:fHandler
		});
		oTarget.on(name,fCall,context,nTimes);
	}
	/**
	 * 移除对其它对象的监听
	 * @param {CM.AbstractEvents|string}oTarget 参数对象，继承自AbstractEvents的实例对象，
	 * 							也可以传入'all'，表示移除所有监听
	 * 其余参数同base.Events.off
	 */
	function fUnlistenTo(oTarget,name,fHandler){
		var me=this;
		if(me._parseListenToEvents('unlistenTo',oTarget,name,fHandler)){
			return;
		}
		var aListenTo=me._listenTo;
		var bAll=oTarget=='all';
		$H.each(aListenTo,function(i,oListenTo){
			if(bAll||(oListenTo.name==name&&oListenTo.handler==fHandler&&oListenTo.target==oTarget)){
				oListenTo.target.off(oListenTo.name,oListenTo.delegation);
				aListenTo.splice(i,1);
			}
		})
	}
	
	return AbstractEvents;
});/**
 * 数据仓库类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
//"handy.common.DataStore"
$Define('CM.DataStore',
function(){
	var DataStore=$H.createClass();
	
	$H.extend(DataStore.prototype,{
		get            : fGet,
//		find           : fFind,
		push           : fPush
	});
	//缓存池
	var _cache={
//		name : []
	};
	
	//全局快捷别名
	$S=$H.getSingleton(DataStore);
	
	/**
	 * 获取数据
	 * @param {string}sName 模型名称或者cid
	 * @param {Object=}oOptions 用于匹配的键值对
	 * @return {Model|Array} 如果通过cid或id获取，返回模型对象，否则返回匹配的模型数组
	 */
	function fGet(sName,oOptions){
		var aCache;
		if(aCache=_cache[sName]){
			if(!oOptions){
				return aCache;
			}else{
				return $H.where(aCache,oOptions);
			}
		}
	}
	/**
	 * 放入仓库
	 * @param {string=}sCid 客户id
	 * @param {*}data 数据
	 */
	function fPush(sCid,data){
		if(typeof sCid!='string'){
			data=sCid;
			sCid=null;
		}
		var sName=data.constructor.$ns;
		var aCache=_cache[sName]||(_cache[sName]=[]);
		aCache.push(data);
		if(sCid){
			if(!_cache[sCid]){
				_cache[sCid]=data;
			}
		}
	}
	
	return DataStore;
	
});/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-01-25										*
*****************************************************************/
/**
 * 数据访问对象抽象类，模块的dao都要继承此类，dao内的方法只可以使用此类的方法进行数据操作，以便进行统一的管理
 */
//handy.common.AbstractDao
$Define('CM.AbstractDao',
'B.LocalStorage',
function(LS){
	
	var AbstractDao=$H.createClass();
	
	$H.extend(AbstractDao.prototype,{
		_ajaxMethodMap   : {
			'create': 'POST',
			'update': 'POST',
			'patch':  'PATCH',
			'delete': 'DELETE',
			'read':   'GET'
	    },
	    _localMethodMap  : {
	    	'create': 'setItem',
			'update': 'setItem',
			'patch':  'setItem',
			'delete': 'removeItem',
			'read':   'getItem'
	    },
		ajax             : fAjax,        //ajax方法
		beforeSend       : $H.noop,      //发送前处理
		error            : $H.noop,      //错误处理
		success          : $H.noop,      //成功处理
		get              : fGet,         //获取数据
		set              : fSet,         //设置数据
		remove           : fRemove,      //删除数据
		sync             : fSync         //同步数据
	});
	
	/**
	 * ajax
	 * @param {Object}oParams
	 * 
	 */
	function fAjax(oParams){
		var me=this;
		me.beforeSend(oParams);
		oParams.error=$H.intercept(me.error,oParams.error);
		oParams.success=$H.intercept(me.success,oParams.success);
		return $.ajax(oParams);
	}
	/**
	 * 获取数据
	 */
	function fGet(){
	}
	/**
	 * 设置数据
	 */
	function fSet(){
	}
	/**
	 * 删除数据
	 */
	function fRemove(){
	}
	/**
	 * 同步数据
	 * @param {string}sMethod 操作方法(read/update/delete/create/patch）
	 * @param {Model|Collection}oModel 参数模型或集合对象
	 * @param {Object}oOptions 选项{
	 * 		{string=}storeType:存储类型(local/remote),默认是remote
	 * 		{string=}data:要同步的数据
	 * 		{Object=}attrs:要同步的键值对
	 * }
	 * @return {*} 如果是get操作，返回指定的数据
	 */
	function fSync(sMethod, oModel, oOptions){
		var me=this;
		oOptions=oOptions||{};
		var sToreType=oOptions.storeType||'remote';
		//ajax请求参数
		var oParam={type: 'POST'||me._ajaxMethodMap[sMethod], dataType: 'json'};
		if(!oOptions.url){
		    oParam.url =oModel.getUrl();
		}
	    if (oOptions.data == null && oModel && (sMethod === 'create' || sMethod === 'update' || sMethod === 'patch')) {
	        //oParam.contentType = 'application/json';
	        oParam.data = oOptions.attrs || oModel.toJSON(oOptions);
	    }
	    
		if(sToreType=='remote'){
			//服务端存储
			oParam.url+='/'+sMethod+'.do';
			$H.extend(oParam,oOptions);
			me.ajax(oParam);
		}else{
			//本地存储
			LS[me._localMethodMap[sMethod]](oParam);
		}
		oModel.trigger('request', oModel, oOptions);
	}
	
	return AbstractDao;
	
});/**
 * 视图管理类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-10
 */
//"handy.common.AbstractManager"
$Define("CM.AbstractManager", function() {

	var AbstractManager = $H.createClass();
	
	$H.extend(AbstractManager.prototype, {
	    _types        : {},               //存储类
	    _all          : {},               //存储所有实例
		type          : 'manager',        //被管理对象的类型，也用于生成标记被管理对象的class
		registerType  : fRegisterType,    //注册视图类
		getClass      : fGetClass,        //根据xtype获取视图类
		register      : fRegister,        //注册视图
		unregister    : fUnRegister,      //注销视图
		eachInEl      : fEachInEl,        //循环指定节点里的被管理对象
		generateId    : fGenerateId,      //生成视图的id
		get           : fGet              //根据id或cid查找视图
	});
	
	/**
	 * 注册视图类型
	 * @method registerType
	 * @param {string}sXType 视图类型
	 * @param {object}oClass 视图类
	 */
	function fRegisterType(sXtype,oClass){
		var me=this;
		me._types[sXtype]=oClass;
		oClass.prototype.xtype=sXtype;
	}
	/**
	 * 根据xtype获取视图类
	 * @method getClass
	 * @param {string|Class}xtype 视图类型或命名空间或视图类
	 * @return {object} 返回对应的视图类
	 */
	function fGetClass(xtype){
		if($H.isClass(xtype)){
			return xtype;
		}
		return this._types[xtype]||$H.ns(xtype);
	}
	/**
	 * 注册视图
	 * @method register
	 * @param {object}oView 视图对象
	 */
	function fRegister(oView){
		this._all[oView.getId()]=oView;
	}
	/**
	 * 注销视图
	 * @method unRegister
	 * @param {object}oView 视图对象
	 */
	function fUnRegister(oView){
		var oAll=this._all;
		var sId=oView.getId();
		//执行update时，如果id没有改变，这里不需要删除，因为已经新对象被覆盖了
		if(oAll[sId]==oView){
			delete oAll[sId];
		}
	}
	/**
	 * 遍历指定节点里的所有视图
	 * @method eachInEl
	 * @param {jQuery}oEl 指定的节点
	 * @param {function(Component)}fCall
	 */
	function fEachInEl(oEl,fCall){
		var me=this;
		//获取视图el
		var oItemEl=oEl.find(".js-"+me.type);
		oItemEl.each(function(i,oEl){
			oEl=$(oEl);
			var sId=oEl.attr('id');
			var oItem=me.get(sId);
			//如果未被销毁，执行回调
			if(oItem){
				fCall(oItem);
			}
		})
	}
	/**
	 * 生成视图的id
	 * @method generateId
	 * @param {string=}sCid cid
	 * @param {boolean=}bNotChk 仅当为true时不检查id是否重复
	 */
	function fGenerateId(sCid,bNotChk){
		var me=this;
		var sId=$H.expando+"_"+me.type+"_"+(sCid||$H.Util.getUuid());
		if(bNotChk!=true&&me._all[sId]){
			$D.error('id重复:'+sId);
		}else{
			return sId;
		}
	}
	/**
	 * 根据id或cid查找视图
	 * @method get
	 * @param {string}sId 视图id或者cid
	 */
	function fGet(sId){
		var me=this;
		var all=me._all;
		return all[sId]||all[me.generateId(sId,true)];
	}

	return AbstractManager;
	
});/**
 * 视图管理类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-03-17
 */
//"handy.common.ViewManager"
$Define("CM.ViewManager", 'CM.AbstractManager',function(AbstractManager) {

	var ViewManager = $H.createClass();

	$H.inherit(ViewManager,AbstractManager,{
		type          : 'view',           //管理类型
		initialize    : fInitialize,      //初始化
		afterRender   : fAfterRender,     //调用指定dom节点包含的视图的afterRender方法
		destroy       : fDestroy          //销毁视图，主要用于删除元素时调用
	});
	
	//全局快捷别名
	$V=$H.getSingleton(ViewManager);
	
	/**
	 * 初始化
	 * @method initialize
	 */
	function fInitialize(){
		var me=this;
		//监听afterRender自定义事件，调用相关视图的afterRender方法
		$H.on("afterRender",function(sEvt,oEl){
			//调用包含的视图的afterRender方法
			me.afterRender(oEl);
		})
		//监听removeEl自定义事件，jQuery的remove方法被拦截(base/adapt.js)，执行时先触发此事件
		$H.on('removeEl',function(sEvt,oEl){
			//销毁包含的视图
			me.destroy(oEl);
		})
	}
	/**
	 * 调用指定dom节点包含的视图的afterRender方法
	 * @method afterRender
	 * @param {jQuery}oEl 指定的节点
	 */
	function fAfterRender(oEl){
		this.eachInEl(oEl,function(oView){
			oView.afterRender();
		});
	}
	/**
	 * 销毁视图，主要用于删除元素时调用
	 * @method destroy
	 * @param {jQuery}oRemoveEl 需要移除视图的节点
	 */
	function fDestroy(oRemoveEl){
		this.eachInEl(oRemoveEl,function(oView){
			oView.destroy(true);
		});
	}

	return ViewManager;
	
});/**
 * 抽象视图类
 * PS：注意，扩展视图类方法必须用本类的extend方法，扩展类的静态方法则可以使用$H.Object.extend方法，例如
 * var ExampleCmp=AbstractComponent.define('ExampleCmp');
 * ExampleCmp.extend({
 * 	   test:''
 * });
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2013-02-17
 */
//"handy.common.View"
$Define('CM.View',
['CM.ViewManager',
'CM.AbstractEvents',
'B.Template'],
function(ViewManager,AbstractEvents,Template){
	
	var _oTagReg=/^(<[a-zA-Z]+)/;
	var _oHasClsReg=/^[^>]+class=/;
	var _oClsReg=/(class=")/;
	
	//自定义事件
	var View=AbstractEvents.derive({
		
		xtype               : 'View',            //类型
		_placeholder        : '<script id="" type="text/x-placeholder"></script>',        //占位符标签
		
		//配置
//		renderTo            : null,              //渲染节点
//		defItem             : null,              //默认子视图配置
//		hidden              : false,             //是否隐藏
//		delayShow           : false,             //是否延迟显示，主要用于弹出层
//		hideMode            : 'display',         //隐藏方式,'display'|'visibility'
//		disabled            : false,             //是否禁用
		autoRender          : true,              //是否默认就进行渲染
		renderBy            : 'append',          //默认渲染方式
//		extCls              : '',                //附加class
//		notListen           : false,             //不自动初始化监听器
		listeners           : [],                //事件配置列表，初始参数可以是对象也可以是对象数组
		items               : [],                //子视图配置，初始参数可以是对象也可以是对象数组
////	lazy                : false,             //保留属性：懒加载，初始化时只设置占位标签，只在调用show方法时进行实际初始化
		
		
		//属性
//		inited              : false,             //是否已经初始化
//		startParseItems     : false,             //是否已开始初始化子视图
//		manager             : null,              //视图管理对象
//		initParam           : null,              //保存初始化时传入的参数
//		_container          : null,              //试图对象容器节点
//      listened            : false,             //是否已初始化事件
//		isSuspend           : false,             //是否挂起事件
//		destroyed           : false,             //是否已销毁
//		_id                 : null,              //id
		tmpl                : '<div><%=this.findHtml(">*")%></div>',    //模板，字符串或数组字符串，ps:模板容器节点上不能带有id属性
//		rendered            : false,             //是否已渲染
//      showed              : false,             //是否已显示
		children            : [],                //子视图列表
		_customEvents       : [                  //自定义事件,可以通过参数属性的方式直接进行添加
			'beforeRender','render','afterRender',
			'beforeShow','show','afterShow',
			'beforeHide','hide','afterHide',
			'beforeUpdate','update','afterUpdate',
			'beforeDestroy','destroy','afterDestroy',
			'add','remove'
////		'layout'    //保留事件
		],  
		_defaultEvents      : [                  //默认事件，可以通过参数属性的方式直接进行添加
			'mousedown','mouseup','mouseover','mousemove','mouseenter','mouseleave',
			'dragstart','drag','dragenter','dragleave','dragover','drop','dragend',
			'touchstart','touchmove','touchend','touchcancel',
			'keydown','keyup','keypress',
			'click','dblclick',
			'focus','focusin','focusout',
			'contextmenu','change','submit'
		],
//		_listeners          : {},                   //实例事件池
		
		_applyArray         : _fApplyArray,         //在数组上依次执行方法
		_parseListenEvents  : _fParseListenEvents,  //处理对象类型或者空格相隔的多事件
		
		//初始化相关
		initialize          : fInitialize,       //初始化
////	init                : fInit,             //子类初始方法，doConfig后调用
////	lazyInit            : fLazyInit,         //保留方法：懒加载，初始化时只设置占位标签，以后再进行真正的初始化
		doConfig            : fDoConfig,         //初始化配置
		getEl               : fGetEl,            //获取容器节点
		getId               : fGetId,            //获取id
		initHtml            : fInitHtml,         //初始化html
		getHtml             : fGetHtml,          //获取html
		findHtml            : fFindHtml,         //获取子视图html
		initStyle           : fInitStyle,        //初始化样式
//   	layout              : fLayout,           //布局
		
		beforeRender        : fBeforeRender,     //渲染前工作
		render              : fRender,           //渲染
		afterRender         : fAfterRender,      //渲染后续工作
		beforeShow          : fBeforeShow,       //显示前工作
		show                : fShow,             //显示
		afterShow           : fAfterShow,        //显示后工作
		beforeHide          : fBeforeHide,       //隐藏前工作
		hide                : fHide,             //隐藏
		afterHide           : fAfterHide,        //隐藏后工作
		enable              : fEnable,           //启用
		disable             : fDisable,          //禁用
		getContent          : fGetContent,       //获取内容
		setContent          : fSetContent,       //设置内容
		
		//事件相关
		listen              : fListen,           //绑定事件
		unlisten            : fUnlisten,         //解除事件
		initListeners       : fInitListeners,    //初始化所有事件
		clearListeners      : fClearListeners,   //清除所有事件
		suspend             : fSuspend,          //挂起事件
		resume              : fResume,           //恢复事件
		
		findEl              : fFindEl,           //查找视图内节点
		parentsEl           : fParentsEl,        //查找视图的祖先节点
		
		//视图管理相关
////	get                 : fGet,              //保留接口
////	set                 : fSet,              //保留接口
		each                : fEach,             //遍历子视图
		match               : fMatch,            //匹配选择器
		find                : fFind,             //查找视图
		parents             : fParents,          //查找祖先视图
		index               : fIndex,            //获取本身的索引，如果没有父视图则返回null
		callChild           : fCallChild,        //调用子视图方法
		add                 : fAdd,              //添加子视图
		remove              : fRemove,           //删除子视图
		parseItem           : function(){},      //分析子视图，由具体视图类实现
		parseItems          : fParseItems,       //分析子视图列表
		
		//更新、销毁
		beforeUpdate        : fBeforeUpdate,     //更新前工作
		update              : fUpdate,           //更新
		afterUpdate         : fAfterUpdate,      //更新后工作
		beforeDestroy       : fBeforeDestroy,    //销毁前工作
		destroy             : fDestroy,          //销毁
		afterDestroy        : fAfterDestroy      //销毁后工作
	},{
		extend              : fExtend,           //扩展原型定义
		html                : fHtml              //静态初始化视图并生成html
	});
	/**
	 * 扩展原型定义
	 * @method extend
	 * @param {Object}oExtend 扩展源
	 */
	function fExtend(oExtend){
		var oProt=this.prototype;
		$H.extend(oProt, oExtend,{notCover:function(p){
			//继承父类的事件
			if($H.contains(['_customEvents','listeners'],p)){
				oProt[p]=(oExtend[p]||[]).concat(oProt[p]||[]);
				return true;
			}else if(p=='xtype'||p=='constructor'){
				return true;
			}
		}});
	}
	/**
	 * 静态初始化视图并生成html
	 * @method html
	 * @param {object}oParams 初始化参数
	 */
	function fHtml(oParams){
		var oView=new this($H.extend({autoRender:false},oParams));
		return oView.getHtml();
	}
	/**
	 * 在数组上依次执行方法
	 * @method _applyArray([sMethod,aParams,param...]) 不传参数的话，默认是调用者的方法名和参数
	 * @param {string=}sMethod 执行的方法名
	 * @param {Array|*=}aParams 参数对象，如果是数组，则在其元素上分别执行执行方法，
	 * 							并返回true，如果不是数组，返回false
	 * @return {boolean} true表示已处理
	 */
	function _fApplyArray(sMethod,aParams){
		var me=this;
		var aArgs=arguments;
		var fCaller=aArgs.callee.caller;
		var oOwner=fCaller.$owner.prototype;
		if(aArgs.length==0){
			aArgs=fCaller.arguments;
			aArgs=$H.toArray(aArgs);
			sMethod=fCaller.$name;
			aParams=aArgs.shift();
		}else{
			aArgs=$H.toArray(aArgs,2);
		}
		if($H.isArr(aParams)){
			for(var i=0,len=aParams.length;i<len;i++){
				oOwner[sMethod].apply(me,[aParams[i]].concat(aArgs));
			}
			return true;
		}
		return false;
	}
	/**
	 * 处理对象类型或者空格相隔的多事件
	 * @param {string}sMethod 调用的方法名
	 * @param {Object}oEvent 参数同this.listen
	 * @return {boolean} true表示已成功处理事件，false表示未处理
	 */
	function _fParseListenEvents(sMethod,oEvent){
		var me=this;
		var name=oEvent.name;
		return me._parseEvents(name,function(aParams){
			oEvent.name=aParams[0];
			if(aParams.length==2){
				oEvent.handler=aParams[1];
			}
			me[sMethod].call(me,oEvent);
		});
	}
	/**
	 * 初始化
	 * @method initialize
	 * @param {Object}oParams 初始化参数
	 */
	function fInitialize(oParams){
		var me=this;
		if(me.inited){
			return;
		}
		me.manager=me.constructor.manager||$H.getSingleton(ViewManager);
		
		//编译模板，一个类只需执行一次
		var tmpl=me.tmpl;
		if(!$H.isFunc(tmpl)){
			me.tmpl=me.constructor.prototype.tmpl=$H.tmpl(tmpl);
		}
		
		//初始化配置
		me.doConfig(oParams);
		//子类自定义配置
		if(me.init){
			me.init(oParams);
		}
		me.parseItems();
		if(me.autoRender!=false){
			me.render();
		}
		//注册视图，各继承类自行实现
		me.manager.register(me);
		me.inited=true;
	}
	/**
	 * 初始化配置
	 * @method doConfig
	 * @param {Object}oSettings 初始化参数
	 */
	function fDoConfig(oSettings){
		var me=this;
		//复制保存初始参数
		me.initParam=oSettings;
		if(typeof oSettings=='string'){
			oSettings={text:oSettings};
		}
		var oParams=oSettings||{};
		
		$H.extend(me,oParams,{notCover:function(p,val){
			var value=me[p];
			//默认事件，可通过参数属性直接添加
			var bIsCustEvt=$H.contains(me._customEvents,p);
			var bIsDefEvt=$H.contains(me._defaultEvents,p);
			if(bIsDefEvt){
				me.listeners.push({
					name:p,
					handler:oParams[p]
				});
				return true;
			}else if(bIsCustEvt){
				me.on(p,oParams[p]);
				return true;
			}else if(p=='defItem'){
				me[p]=$H.extend(me[p],val);
				return true;
			}else if(p=='listener'){
				me.listeners=me.listeners.concat($H.isArr(val)?val:[val]);
				return true;
			}else if(p=='items'){
				me.add(val);
				return true;
			}else if(p=='extCls'&&me[p]){
				me[p]+=' '+val;
				return true;
			}else if(p=='xtype'){
				if(me[p]=='View'){
					me[p]=typeof val=='string'?val:val.$ns;
				}
				return true;
			}
		}});
		if(oParams.renderTo){
			me.renderTo=$(oParams.renderTo);
		}else{
			me.renderTo=$(document.body);
		}
	}
	/**
	 * 获取容器节点
	 * @method getEl
	 * @return {jQuery} 返回容器节点
	 */
	function fGetEl(){
		return this._container;
	}
	/**
	 * 获取id
	 * @method getId
	 * @return {string}返回id
	 */
	function fGetId(){
		var me=this;
		return me._id||(me._id=me.manager.generateId(me.cid));
	}
	/**
	 * 初始化html
	 * @method initHtml
	 * @return {string} 返回html
	 */
	function fInitHtml(){
		var me=this;
		//由模板生成html
		var sHtml=me.tmpl(me);
		return sHtml;
	}
	/**
	 * 获取html
	 * @method getHtml
	 */
	function fGetHtml(){
		var me=this;
		var sId=me.getId();
		//添加隐藏style，调用show方法时才显示
		var sStyle;
 		if(me.displayMode=='visibility'){
			sStyle='visibility:hidden;';
 		}else{
			sStyle='display:none;';
 		}
 		var sHtml=me.initHtml();
		var bHasCls=_oHasClsReg.test(sHtml);
		var sExtCls='js-'+me.manager.type+" "+'js-'+me.xtype+" "+me.extCls+" ";
		if(bHasCls){
			//添加class
			sHtml=sHtml.replace(_oClsReg,'$1'+sExtCls);
		}
		//添加id和style
		sHtml=sHtml.replace(_oTagReg,'$1 id="'+sId+'" style="'+sStyle+'"'+(bHasCls?'':' class="'+sExtCls+'"'));
		return sHtml;
	}
	/**
	 * 获取子视图html
	 * @method findHtml
	 * @param {string=}sSel 选择器，不传表示返回自身的html
	 * @return {string} 返回对应html
	 */
	function fFindHtml(sSel){
		var me=this;
		var aItems=me.find(sSel);
		var aHtml=[];
		for(var i=0;i<aItems.length;i++){
			aHtml.push(aItems[i].getHtml());
		}
		return aHtml.join('');
	}
	/**
	 * 初始化样式
	 * @method initStyle
	 */
	function fInitStyle(){
		var me=this;
		var oEl=this.getEl();
		//添加style
		var oStyle=me.style||{};
		if(me.width!=undefined){
			oStyle.width=me.width;
		}
		if(me.height!=undefined){
			oStyle.height=me.height;
		}
		oEl.css(oStyle);
	}
	/**
	 * 渲染前工作
	 * @method beforeRender
	 * @return {boolean=} 仅当返回false时阻止渲染
	 */
	function fBeforeRender(){
		return this.trigger('beforeRender');
	}
	/**
	 * 渲染
	 * @method render
	 * @return {boolean=} 仅当没有成功渲染时返回false
	 */
	function fRender(){
		var me=this;
		if(me.beforeRender()==false){
			return false;
		}
		me.trigger('render');
		var sHtml=me.getHtml();
		me.renderTo[me.renderBy](sHtml);
		me.afterRender();
	}
	/**
	 * 渲染后续工作
	 * @method afterRender
	 * @return {boolean=} 仅当已经完成过渲染时返回false
	 */
	function fAfterRender(){
		var me=this;
		if(me.rendered){
			return false;
		}
		me.callChild();
		//缓存容器
		me._container=$("#"+me.getId());
		me.rendered=true;
		//初始化样式
		me.initStyle();
		//初始化事件
		if(me.notListen!=true){
			me.initListeners();
		}
		if(me.disabled){
			me.disable();
		}
		me.trigger('afterRender');
		//显示
		if(!me.hidden){
			me.show();
		}
	}
	/**
	 * 显示前工作
	 * @return {boolean=} 仅当返回false时阻止显示
	 */
	function fBeforeShow(){
		return this.trigger('beforeShow');
	}
	/**
	 * 显示
	 * @method show
	 * @param {boolean=}bNotDelay 仅当为true时强制不延迟显示
	 * @param {boolean=}bParentCall true表示是父组件通过callChild调用
	 * @return {boolean=} 仅当不是正常成功显示时返回false
	 */
	function fShow(bNotDelay,bParentCall){
		var me=this;
		if(me.beforeShow()==false
			//已经显示，直接退回
			||me.showed
			//设置了hidden=true的组件不随父组件显示而显示
			||(bParentCall&&me.hidden)){
			return false;
		}
		
		if(!bNotDelay&&me.delayShow){
			setTimeout(function(){
				//这里必须指定基类的方法，不然会调用到组件自定义的show方法
				View.prototype.show.call(me,true);
			},0);
			return;
		}
		me.trigger('show');
		me.showed=true;
		var oEl=me.getEl();
		if(me.displayMode=='visibility'){
			oEl.css({visibility:"visible"})
		}else{
			oEl.show();
		}
		me.callChild([null,true]);
		me.afterShow();
	}
	/**
	 * 显示后工作
	 * @method afterShow
	 */
	function fAfterShow(){
		this.trigger('afterShow');
	}
	/**
	 * 隐藏前工作
	 * @return {boolean} 仅当返回false时阻止隐藏
	 */
	function fBeforeHide(){
		return this.trigger('beforeHide');
	}
	/**
	 * 隐藏
	 * @method hide
	 * @return {boolean=} 仅当没有成功隐藏时返回false
	 */
	function fHide(){
		var me=this;
		if(me.beforeHide()==false
			//已经隐藏，直接退回
			||!me.showed){
			return false;
		}
		me.showed=false;
		var oEl=me.getEl();
		if(me.displayMode=='visibility'){
			oEl.css({visibility:"hidden"})
		}else{
			oEl.hide();
		}
		me.trigger('hide');
		me.afterHide();
	}
	/**
	 * 隐藏后工作
	 */
	function fAfterHide(){
		this.trigger('afterHide');
	}
	/**
	 * 启用
	 * @method enable
	 */
	function fEnable(){
		var me=this;
		me.resume();
		me.getEl().removeClass("hui-disable").find('input,textarea,select').removeAttr('disabled');
	}
	/**
	 * 禁用
	 * @method disable
	 */
	function fDisable(){
		var me=this;
		me.suspend();
		me.getEl().addClass("hui-disable").find('input,textarea,select').attr('disabled','disabled');
	}
	/**
	 * 读取内容
	 * @param {boolean=}bHtml 仅当false表示获取子组件列表，其它表示获取html内容
	 * @param {View|string|number=}obj 指定视图对象，或选择器或索引
	 * @return {string|Array.<Component>} 返回内容
	 */
	function fGetContent(bHtml,obj){
		var me=this;
		if(obj){
			if(!obj instanceof View){
				obj=me.find(obj)[0];
			}
		}else{
			obj=me;
		}
		if(bHtml==false){
			var aChildren=obj.children;
			return aChildren;
		}else{
			return obj.getEl().html();
		}
	}
	/**
	 * 设置内容
	 * @param {string|Component|Array.<Component>}content 内容，html字符串或组件或组件数组
	 * @param {View|string|number=}obj 指定视图对象，或选择器或索引
	 * @retun {View} 如果只添加一个组件(或配置)，则返回该组件
	 */
	function fSetContent(content,obj){
		var me=this;
		if(obj){
			if(!obj instanceof View){
				obj=me.find(obj)[0];
			}
			return obj.setContent(content);
		}
		var oEl=me.getEl();
		oEl.contents().remove();
		if(typeof content=='string'){
			oEl.html(content);
		}else{
			return me.add(content);
		}
	}
	/**
	 * 绑定事件
	 * @method listen
	 * @param {object}事件对象{
	 * 			{string}name      : 事件名
	 * 			{function(Object[,fireParam..])}handler : 监听函数，第一个参数为事件对象oListener，其后的参数为fire时传入的参数
	 * 			{any=}data        : 数据
	 * 			{jQuery|Function(this:this)=}el       : 绑定事件的节点，不传表示容器节点，传入函数(this是本视图对象)则使用函数返回值
	 * 			{CM.AbstractEvents|Function=}target : 监听对象(listenTo方法)，继承自AbstractEvents的实例对象，传入函数(this是本视图对象)则使用函数返回值
	 * 			{boolean=}custom  : 为true时是自定义事件
	 * 			{number=}times    : 执行次数
	 * 			{string=}selector : 选择器
	 * 			{any=}context     : 监听函数执行的上下文对象，默认是对象
	 * 			{string=}method   : 绑定方式，默认为"bind"
	 * }
	 */
	function fListen(oEvent){
		var me=this;
		if(me._parseListenEvents('listen',oEvent)){
			return;
		}
		var sName=oEvent.name,
			context=oEvent.context,
			nTimes=oEvent.times,
			oTarget=oEvent.target,
			bIsCustom=oEvent.custom,
			fHandler=oEvent.handler;
		if($H.isFunc(oTarget)){
			oTarget=oTarget.call(me);
		}
		//自定义事件
		if(oTarget||bIsCustom){
			var aArgs=$H.removeUndefined([oTarget,sName,fHandler,context,nTimes]);
			me[bIsCustom?'on':'listenTo'].apply(me,aArgs);
		}else{
			//element事件
			var aListeners=me._listeners,
				oEl=oEvent.el,
				sMethod=oEvent.method||"bind",
				sSel=oEvent.selector,
				oData=oEvent.data,
				fFunc=oEvent.delegation=me._delegateHandler(fHandler,context);
			if($H.isFunc(oEl)){
				oEl=oEl.call(me);
			}
			//移动浏览器由于click可能会有延迟，这里转换为touchend事件
			if($H.mobile()){
				if(sName=="click"){
					sName="touchend";
				}
			}
			oEl=oEl?typeof oEl=='string'?me.findEl(oEl):oEl:me.getEl();
			if(sSel){
				if(oData){
					oEl[sMethod](sSel,sName,oData,fFunc);
				}else{
					oEl[sMethod](sSel,sName,fFunc);
				}
			}else{
				if(oData){
					oEl[sMethod](sName,oData,fFunc);
				}else{
					oEl[sMethod](sName,fFunc);
				}
			}
			aListeners.push(oEvent);
		}
	}
	/**
	 * 解除事件
	 * @method unlisten
	 * @param {object}事件对象{
	 * 			{string}name      : 事件名
	 * 			{function}handler : 监听函数
	 * 			{jQuery=}el       : 绑定事件的节点，不传表示容器节点
	 * 			{boolean=}custom    : 为true时是自定义事件
	 * 			{string=}selector : 选择器
	 * 			{string=}method   : 绑定方式，默认为"bind"
	 * }
	 */
	function fUnlisten(oEvent){
		var me=this;
		if(me._parseListenEvents('unlisten',oEvent)){
			return;
		}
		var sName=oEvent.name,
			fHandler=oEvent.handler;
		if(oEvent.custom){
			me.off(sName,fHandler);
		}else{
			var oEl=oEvent.el,
				sMethod=oEvent.method=="delegate"?"undelegate":"unbind",
				sSel=oEvent.selector,
				fDelegation;
			//移动浏览器由于click可能会有延迟，这里转换为touchend事件
			if($H.mobile()){
				if(sName=="click"){
					sName="touchend";
				}
			}
			oEl=oEl?typeof oEl=='string'?me.findEl(oEl):oEl:me.getEl();
			for(var i=me._listeners.length-1;i>=0;i--){
				var oListener=me._listeners[i]
				if(oListener.handler==fHandler){
					fDelegation=oListener.delegation;
					me._listeners.splice(i,1);
					break;
				}
			}
			if(sSel){
				oEl[sMethod](sSel,sName,fDelegation);
			}else{
				oEl[sMethod](sName,fDelegation);
			}
		}
	}
	/**
	 * 初始化所有事件
	 * @method initListeners
	 * @return {boolean=}如果已经初始化了，则直接返回false
	 */
	function fInitListeners(){
		var me=this;
		//已经初始化，直接退回
		if(me.listened){
			return false;
		}
		me.listened=true;
		var aListeners=me.listeners;
		me._listeners=[];
		for(var i=aListeners.length-1;i>=0;i--){
			me.listen(aListeners[i]);
		}
		me.callChild();
	}
	/**
	 * 清除所有事件
	 * @method clearListeners
	 */
	function fClearListeners(){
		var me=this;
		var aListeners=me._listeners;
		for(var i=aListeners.length-1;i>=0;i--){
			me.unlisten(aListeners[i]);
		}
		me.off('all');
		me.unlistenTo('all');
		me.callChild();
	}
	/**
	 * 挂起事件
	 * @method suspend
	 */
	function fSuspend(){
		var me=this;
		//已经挂起，直接退回
		if(me.isSuspend){
			return false;
		}
		me.isSuspend=true;
		me.callChild();
	}
	/**
	 * 恢复事件
	 * @method resume
	 */
	function fResume(){
		var me=this;
		//已经恢复，直接退回
		if(!me.isSuspend){
			return false;
		}
		me.isSuspend=false;
		me.callChild();
	}
	/**
	 * 查找视图内节点
	 * @param {string}sSel jQuery选择器
	 * @return {jQuery} 返回结果
	 */
	function fFindEl(sSel){
		return this.getEl().find(sSel);
	}
	/**
	 * 查找视图的祖先节点
	 * @param {string}sSel jQuery选择器
	 * @return {jQuery} 返回结果
	 */
	function fParentsEl(sSel){
		return this.getEl().parents(sSel);
	}
	/**
	 * 遍历子视图
	 * @method each
     * @param {function}fCallback 回调函数:fCallback(i,oChild)|fCallback(args)this=oChild,返回false时退出遍历
     * @param {Array=}aArgs  回调函数的参数
	 */
	function fEach(fCallback, aArgs){
		var me=this;
		var aChildren=this.children;
		var nLen=aChildren.length;
		var bResult;
		for(var i=0;i<nLen;){
			var oChild=aChildren[i];
			if(aArgs){
				bResult=fCallback.apply(oChild,aArgs);
			}else{
				bResult=fCallback(i,oChild);
			}
			if(bResult===false){
				break;
			}
			//这里注意aChildren可能由于调用destroy而减少
			if(nLen==aChildren.length){
				i++;
			}else{
				nLen=aChildren.length;
			}
		}
	}
	/**
	 * 匹配选择器
	 * @method match
	 * @param {string}sSel 选择器，只支持一级选择器 xtype[attr=value]
	 * @param {Object=}oObj 被匹配的对象，默认为视图对象本身
	 * @return {boolean} 匹配则返回true
	 */
	function fMatch(sSel,oObj){
		if(sSel=="*"){
			return true;
		}
		var o=oObj||this,m,prop,op,value;
		//#btn => [cid=tbn]
		sSel=sSel.replace(/#([^\s,\[]+)/,'[cid=$1]');
		//'Button[attr=value]'=>'[xtype=Button][attr=value]'
		sSel=sSel.replace(/^([^\[]+)/,'[xtype=$1]');
		//循环检查
		var r=/\[([^=|\!]+)(=|\!=)([^=]+)\]/g;
		while(m=r.exec(sSel)){
			prop=m[1];
			//操作符：=|!=
			op=m[2];
			value=m[3];
			if(value=='false'||value=='true'){
				value=eval(value);
			}
			if(op==="="?o[prop]!=value:o[prop]==value){
				return false;
			}
		}
		return true;
	}
	/**
	 * 查找子元素或子视图
	 * @method find
	 * @param {number|string|Function(View)}sel 数字表示子组件索引，
	 * 				如果是字符串：多个选择器间用","隔开('sel1,sel2,...')，语法类似jQuery，
	 * 				如：'xtype[attr=value]'、'ancestor descendant'、'parent>child'，
	 * 				'#'表示cid，如'#btn'，表示cid为btn的视图
	 * 				'>Button'表示仅查找当前子节点中的按钮，'Button'表示查找所有后代节点中的按钮，
	 * 				如果是函数(参数是当前匹配的视图对象)，则将返回true的结果加入结果集
	 * @param {Array=}aResult 用于存储结果集的数组
	 * @return {Array} 返回匹配的结果，如果没找到匹配的子视图则返回空数组，ps:只有一个结果也返回数组，便于统一接口
	 */
	function fFind(sel,aResult){
		var me=this,aResult=aResult||[];
		if($H.isNum(sel)){
			var oItem=me.children[sel];
			aResult.push(oItem);
		}else if($H.isStr(sel)){
			//多个选择器
			if(sel.indexOf(",")>0){
				$H.each(sel.split(","),function(i,val){
					aResult=aResult.concat(me.find(val));
				})
				return aResult;
			}
			//查找视图
			var bOnlyChildren=sel.indexOf('>')==0;
			var sCurSel=sel.replace(/^>?\s?/,'');
			//分割当前选择器及后代选择器
			var nIndex=sCurSel.search(/\s|>/);
			var sCurSel,sExtSel;
			if(nIndex>0){
				sExtSel=sCurSel.substring(nIndex);
				sCurSel=sCurSel.substring(0,nIndex);
			}
			//匹配子视图
			me.each(function(i,oChild){
				var bMatch=oChild.match(sCurSel);
				if(bMatch){
					//已匹配所有表达式，加入结果集
					if(!sExtSel){
						aResult.push(oChild);
					}else{
						//还有未匹配的表达式，继续查找
						oChild.find(sExtSel,aResult);
					}
				}
				if(!bOnlyChildren){
					//如果不是仅限当前子节点，继续从后代开始查找
					oChild.find(sel,aResult);
				}
			});
		}else if($H.isFunc(sel)){
			//匹配子视图
			me.each(function(i,oChild){
				if(sel(oChild)){
					aResult.push(oChild);
				}
				oChild.find(sel,aResult);
			});
		}
		return aResult;
	}
	/**
	 * 查找祖先视图
	 * @method parents
	 * @param {string=}sSel 若此参数为空，直接返回最顶级祖先视图
	 * @return {jQuery|Component|null} 返回匹配的结果，如果没找到匹配的视图则返回null
	 */
	function fParents(sSel){
		var me=this;
		var oCurrent=me;
		while(oCurrent.parent){
			oCurrent=oCurrent.parent;
			if(sSel&&me.match(sSel,oCurrent)){
				return oCurrent;
			}
		}
		return sSel||oCurrent===me?null:oCurrent;
	}
	/**
	 * 获取本身的索引，如果没有父视图则返回null
	 * @method index
	 * @return {number} 返回对应的索引，如果没有父视图(也就没有索引)，返回null
	 */
	function fIndex(){
		var me=this;
		var oParent=me.parent;
		if(!oParent){
			return null;
		}else{
			var nIndex;
			oParent.each(function(i,oItem){
				if(oItem==me){
					nIndex=i;
					return false;
				}
			});
			return nIndex;
		}
	}
	/**
	 * 调用子视图方法
	 * @method callChild
	 * @param {string=}sMethod 方法名，不传则使用调用者同名函数
	 * @param {Array=}aArgs 参数数组
	 */
	function fCallChild(sMethod,aArgs){
		var me=this;
		if(me.children.length==0){
			return;
		}
		//没传方法名
		if(sMethod&&typeof sMethod!='string'){
			aArgs=sMethod;
			sMethod=null;
		}
		sMethod=sMethod||arguments.callee.caller.$name;
		me.each(function(i,oChild){
			if(aArgs){
				oChild[sMethod].apply(oChild,aArgs);
			}else{
				oChild[sMethod].call(oChild);
			}
		});
	}
	/**
	 * 添加子视图
	 * @method add
	 * @param {object|Array}item 视图对象或视图配置或数组
	 * @param {number=}nIndex 指定添加的索引，默认添加到最后
	 * @return {?Component} 添加的子视图只有一个时返回该视图对象，参数是数组时返回空
	 */
	function fAdd(item,nIndex){
		var me=this;
		if(me._applyArray()){
			return;
		}
		var bNoIndex=nIndex==undefined;
		//还没初始化子视图配置，直接添加到配置队列里
		if(!me.startParseItems){
			var aItems=me.items;
			if(bNoIndex){
				aItems.push(item);
			}else{
				aItems.splice(nIndex,0,item);
			}
			return;
		}
		//开始初始化后，如果是配置，先创建子视图
		if(!(item instanceof View)){
			//默认子视图配置
			if(me.defItem){
				$H.extend(item,me.defItem,{notCover:true});
			}
			//具体视图类处理
			me.parseItem(item);
			var Item=me.manager.getClass(item.xtype);
			if(Item){
				if(!item.renderTo){
					//初始化过后，默认添加到容器节点里
					if(me.inited){
						item.renderTo=me.getEl();
					}else{
						//没有初始化时，设置子组件不进行自动render，而是由组件本身进行render
						item.autoRender=false;
					}
				}
				item.parent=me;
				item=new Item(item);
			}else{
				$D.error("xtype:"+item.xtype+"未找到");
			}
		}else{
			item.parent=me;
		}
		var aChildren=me.children;
		if(bNoIndex){
			aChildren.push(item);
		}else{
			aChildren.splice(nIndex,0,item);
		}
		me.trigger('add',item);
		return item;
	}
	/**
	 * 删除子视图
	 * @method remove
	 * @param {object|number|string}item 视图对象或视图索引或选择器
	 * @return {boolean} true表示删除成功
	 */
	function fRemove(item){
		var me=this;
		if(me._applyArray()){
			return;
		}
		var aChildren=me.children;
		var bResult=false;
		var nIndex;
		if($H.isNum(item)){
			nIndex=item;
			item=aChildren[nIndex];
		}else if($H.isStr(item)||$H.isFunc(item)){
			item=me.find(item);
			for(var i=0,len=item.length;i<len;i++){
				if(me.remove(item[i])==false){
					return false;
				}
				bResult=true;
			}
		}else if(item instanceof View){
			if(item.parent==me){
				for(var i=0,len=aChildren.length;i<len;i++){
					if(aChildren[i]==item){
						nIndex=i;
						break;
					}
				}
			}else{
				return item.parent.remove(item);
			}
		}
		if(nIndex!=undefined&&item.destroy(true)!=false){
			aChildren.splice(nIndex,1);
			bResult=true;
		}
		me.trigger('remove',item);
		return bResult;
	}
	/**
	 * 分析子视图列表
	 * @method parseItems
	 */
	function fParseItems(){
		var me=this;
		me.startParseItems=true;
		var aItems=me.items;
		if(!aItems){
			return;
		}
		aItems=$H.isArr(aItems)?aItems:[aItems];
		//逐个初始化子视图
		for(var i=0,len=aItems.length;i<len;i++){
			me.add(aItems[i]);
		}
	}
	/**
	 * 更新前工作
	 * @return {boolean=} 仅当返回false时阻止更新
	 */
	function fBeforeUpdate(){
		return this.trigger('beforeUpdate');
	}
	/**
	 * 更新
	 * @param {Object}oOptions
	 * @return {boolean|Object} 更新失败返回false，成功则返回更新后的视图对象
	 */
	function fUpdate(oOptions){
		var me=this;
		if(me.beforeUpdate()==false){
			return false;
		}
		var oParent=me.parent;
		var oPlaceholder=$('<span></span>').insertBefore(me.getEl());
		//cid不同
		oOptions=$H.extend(oOptions||me.initParam,{
			xtype:me.xtype,
			renderBy:'replaceWith',
			renderTo:oPlaceholder
		});
		//不需要改变id/cid
		if(!oOptions.cid||oOptions.cid==me.cid){
			oOptions._id=me._id;
		}
		var oNew;
		if(oParent){
			var nIndex=me.index();
			if(oParent.remove(me)==false){
				oPlaceholder.remove();
				return false;
			}
			oNew=oParent.add(oOptions,nIndex);
		}else{
			if(me.destroy()==false){
				oPlaceholder.remove();
				return false;
			}
			oNew=new me.constructor(oOptions);
		}
		me.trigger('update',oNew);
		me.afterUpdate(oNew);
		return oNew;
	}
	/**
	 * 更新后工作
	 * @param {Object} 更新后的视图对象
	 */
	function fAfterUpdate(oNew){
		this.trigger('afterUpdate',oNew);
	}
	/**
	 * 销毁前工作
	 * @return {boolean=} 仅当返回false时阻止销毁
	 */
	function fBeforeDestroy(){
		return this.trigger('beforeDestroy');
	}
	/**
	 * 销毁
	 * @method destroy
	 * @param {boolean=} 仅当true时表示从remove里的调用，不需要再这里调用parent.remove
	 * @return {boolean=} 成功返回true，失败返回false，如果之前已经销毁返回空
	 */
	function fDestroy(bFromRemove){
		var me=this;
		if(me.beforeDestroy()==false){
			return false;
		}
		if(me.destroyed){
			return;
		}
		me.callChild();
		
		me.trigger('destroy');
		me.clearListeners();
		me.getEl().remove();
		me.destroyed=true;
		
		if(!bFromRemove&&me.parent){
			me.parent.remove(me);
		}
		//注销组件
		me.manager.unregister(me);
		delete me.initParam;
		delete me._container;
		delete me.renderTo;
		delete me._listeners;
		delete me.children;
		me.afterDestroy();
		return true;
	}
	/**
	 * 销毁后工作
	 */
	function fAfterDestroy(){
		this.trigger('afterDestroy');
	}
	
	return View;
	
});/**
 * 模型类，负责数据封装，可监听事件：invalid、sync、destroy、change:attr、change
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-03-06
 */
//"handy.common.Model"
$Define('CM.Model',
['CM.AbstractDao',
'CM.AbstractEvents'],
function(AbstractDao,AbstractEvents){
	
	var Model=AbstractEvents.derive({
		//可扩展属性
//      fields                : {},                  
		/**
		 * 属性声明列表，一般是需要额外处理的定制属性，基本类型的属性不需要在此声明，{
	     *	普通形式：
	     *	{string}name:{
		 *	    {string|Class=}type:类型，可以是字符串(string/number/Date/Model/Collection),也可以是类
		 *   	{Function=}parse:设置该属性时自定义解析操作,
		 *   	{Array=}depends:依赖的属性，计算属性需要此配置检查和计算
	     *	}
	     *	简便形式:
	     *	{name:type}
	     *}
	     */
////    belongsTo             : null,                //保留属性，描述一对一关系，
////    hasMany               : null,                //保留属性，描述一对多关系
//		cid                   : 0,                   //客户id
        idAttribute           : 'id',                //id默认属性名
//      defaults              : {},                  //默认属性
//		dao                   : null,                //数据访问对象，默认为common.AbstractDao
		
        //内部属性
//		_changing             : false,               //是否正在改变，但未保存
		_pending              : false,               //
//		_previousAttributes   : {},                  //较早的值
//		_attributes            : {},                 //属性对象
//    	_changed               : {},                 //改变了的值
//	    validationError       : {},                  //校验错误的值
        
        
   		_validate             : _fValidate,          //执行校验，如果通过校验返回true，否则，触发"invalid"事件
   		_initDepFields        : _fInitDepFields,     //初始化计算/依赖属性
   		_parseFields          : _fParseFields,       //属性预处理
   		_onAttrEvent          : _fOnAttrEvent,       //处理属性模型和集合事件
		
		initialize            : fInitialize,         //初始化
		toJSON                : fToJSON,             //返回对象数据副本
		sync                  : fSync,               //同步数据，可以通过重写进行自定义
   		get                   : fGet,                //获取指定属性值
   		escape                : fEscape,             //获取html编码过的属性值 
   		has                   : fHas,                //判断是否含有参数属性
   		set                   : fSet,                //设置值
   		unset                 : fUnset,              //移除指定属性
   		clear                 : fClear,              //清除所有属性
   		hasChanged            : fHasChanged,         //判断自上次change事件后有没有修改，可以指定属性
   		changedAttrbutes      : fChangedAttributes,  //返回改变过的属性，可以指定需要判断的属性
   		previous              : fPrevious,           //返回修改前的值，如果没有修改过，则返回null
   		fetch                 : fFetch,              //获取模型数据
   		save                  : fSave,               //保存模型
   		destroy               : fDestroy,            //销毁/删除模型
   		getUrl                : fGetUrl,             //获取模型url
   		parse                 : fParse,              //分析处理回调数据，默认直接返回response
   		clone                 : fClone,              //克隆模型
   		isNew                 : fIsNew,              //判断是否是新模型(没有提交保存，并且缺少id属性)
   		isValid               : fIsValid             //校验当前是否是合法的状态
	});
	
	/**
	 * 执行校验，如果通过校验返回true，否则，触发"invalid"事件
	 * @param {Object=}oAttrs 参数属性，传入表示只校验参数属性
	 * @param {Object=}oOptions 选项
	 * @return {boolean} true表示通过校验
	 */
    function _fValidate(oAttrs, oOptions) {
    	var me=this;
        if (!oOptions.validate || !me.validate){
        	return true;
        }
        oAttrs = $H.extend({}, me._attributes, oAttrs);
        var error = me.validationError = me.validate(oAttrs, oOptions) || null;
        if (!error){
        	return true;
        }
        me.trigger('invalid', me, error, $H.extend(oOptions, {validationError: error}));
        return false;
    }
    /**
     * 初始化计算/依赖属性
     */
    function _fInitDepFields(){
    	var me=this;
    	//处理计算属性
	    var oFields=me.fields,oField,aDeps;
	    for(var key in oFields){
	    	var oField=oFields[key];
			if(aDeps=oField.depends){
				for(var i=0;i<aDeps.length;i++){
			    	//当依赖属性变化时，设置计算属性
					me.on('change:'+aDeps[i],function(){
						me.set(key);
					});
				}
			}
	    }
    }
    /**
     * 属性预处理
     * @param {Object}oAttrs 属性表
     * @return {Object} 返回处理好的属性表
     */
    function _fParseFields(oAttrs){
    	var me=this;
    	var oFields;
    	if(!(oFields=me.fields)){
    		return oAttrs;
    	}
    	var oField,fParse,val,aDeps,type;
    	var oResult={};
		for(var key in oAttrs){
			val=oAttrs[key];
			if(oField=oFields[key]){
				type=$H.isObj(oField)?oField.type:oField;
				//自定义解析
				if(fParse=oField.parse){
					val=fParse.apply(me,[val,oAttrs]);
				}
				//自定义类型，包括Model和Collection
				if($H.isStr(type)){
					if(type=='Date'){
						val=$H.parseDate(val);
					}else if(type.indexOf('.')>0){
						type=$H.ns(type);
					}
				}
				if($H.isClass(type)&&!(val instanceof type)){
					val=new type(val);
					//监听所有事件
					val.on('all',$H.bind(me._onAttrEvent,me,key));
				}
			}
			oResult[key]=val;
		}
		return oResult;
    }
    /**
	 * 处理属性模型和集合事件
	 * @param {string}sAttr 属性名
	 * @param {string}sEvent 事件名称
	 * @param {Model|Collection}obj 对象
	 */
    function _fOnAttrEvent(sAttr,sEvent, obj) {
    	if(sEvent=='invalid'||sEvent=='sync'){
    		return;
    	}
    	var me=this;
    	var oVal=me.get(sAttr);
        if (sEvent.indexOf('change:')!=0){
        	me.trigger('change:'+sAttr,me,oVal);
        	me.trigger('change',me);
        }
    }
	/**
	 * 初始化
	 * @param {Object}oAttributes 初始化的对象
	 * @param {Object}oOptions 选项{
	 * 		{common.Collection}collection 集合对象
	 * 		{boolean}parse 是否解析
	 * }
	 */
	function fInitialize(oAttributes, oOptions) {
		var me=this;
		//配置dao对象
		me.dao=me.dao||$H.getSingleton(AbstractDao);
		me._initDepFields();
		var oAttrs = oAttributes || {};
		oOptions || (oOptions = {});
		me.cid = $H.Util.getUuid();
		me._attributes = {};
		if (oOptions.collection){
			me.collection = oOptions.collection;
		}
		if (oOptions.parse){
			oAttrs = me.parse(oAttrs, oOptions) || {};
		}
		oAttrs = $H.extend(oAttrs, $H.Util.result(me, 'defaults'),{notCover:true});
		me.set(oAttrs, oOptions);
		me._changed = {};
		//放入数据仓库
		$S.push(me);
	}
	/**
	 * 返回对象数据副本
	 * @return {Object} 返回对象数据副本
	 */
    function fToJSON() {
        return $H.clone(this._attributes);
    }
	/**
	 * 同步数据，可以通过重写进行自定义
	 * @param {string}sMethod 方法名
	 * @param {CM.Model}oModel 模型对象
	 * @param {Object}oOptions 设置
	 * @return {*} 根据同步方法的结果
	 */
    function fSync(sMethod,oModel,oOptions) {
        return this.dao.sync(sMethod,oModel,oOptions);
    }
    /**
     * 获取指定属性值
     * @param {string}sAttr 参数属性名
     * @return {*} 返回对应属性
     */
    function fGet(sAttr) {
        return this._attributes[sAttr];
    }
	/**
	 * 获取html编码过的属性值
	 * @param {string}sAttr 参数属性名
     * @return {*} 返回对应属性编码后的值
	 */
    function fEscape(sAttr) {
        return $H.String.escapeHTML(this.get(sAttr));
    }
	/**
	 * 判断是否含有参数属性
	 * @param {string}sAttr 参数属性
	 * @return {boolean} 指定属性不为空则返回true
	 */
    function fHas(sAttr) {
    	var value=this.get(sAttr);
    	return  value!= null&&value!=undefined;
    }
	/**
	 * 设置值，并触发change事件(如果发生了变化)
	 * @param {String}sKey 属性
	 * @param {*}val 值
	 * @param {Object}oOptions 选项{
	 * 		{boolean=}unset 是否清除设置
	 * 		{boolean=}silent 是否不触发事件
	 * }
	 */
    function fSet(sKey, val, oOptions) {
    	var me=this;
    	var oAttrs;
	    if (typeof sKey === 'object') {
	    	oAttrs = sKey;
	    	oOptions = val;
	    } else {
	    	(oAttrs = {})[sKey] = val;
	    }
	    oOptions || (oOptions = {});
	    //属性预处理
	    oAttrs= me._parseFields(oAttrs);
	    //先执行校验
	    if (!me._validate(oAttrs, oOptions)){
	    	return false;
	    }
	
	    var bUnset= oOptions.unset;
	    var bSilent= oOptions.silent;
	    var aChanges= [];
	    var bChanging= me._changing;
	    me._changing  = true;
	
	    //开始改变前，先存储初始值
	    if (!bChanging) {
	        me._previousAttributes = $H.Object.clone(me._attributes);
	    	me._changed = {};
	    }
	    var oCurrent = me._attributes, 
	    	oPrev = me._previousAttributes;
	
	    //id特殊处理
	    if (me.idAttribute in oAttrs){
	  	    me.id = oAttrs[me.idAttribute];
	    }
	    
	    //循环进行设置、更新、删除
	    for (var sAttr in oAttrs) {
	   	    val = oAttrs[sAttr];
	   	    //与当前值不相等，放入改变列表中
	    	if (!$H.equals(oCurrent[sAttr], val)){
	    		aChanges.push(sAttr);
	    	}
	    	//与初始值不相等，放入已经改变的hash对象中
	    	if (!$H.equals(oPrev[sAttr], val)) {
	            me._changed[sAttr] = val;
	    	} else {
	    		//跟初始值相等，即没有变化
	        	delete me._changed[sAttr];
	    	}
	    	//如果取消设置，删除对应属性
	    	bUnset ? delete oCurrent[sAttr] : oCurrent[sAttr] = val;
	    }
	    
	
	    //触发对应属性change事件
	    if (!bSilent) {
	        if (aChanges.length){
	        	me._pending = oOptions;
	        }
	        for (var i = 0, l = aChanges.length; i < l; i++) {
	      	    me.trigger('change:' + aChanges[i], me, oCurrent[aChanges[i]], oOptions);
	        }
	    }
	
	  // You might be wondering why there's a `while` loop here. Changes can
	  // be recursively nested within `"change"` events.
	    if (bChanging){
	    	return me;
	    }
	    //触发模型对象change事件
	    if (!bSilent) {
	        while (me._pending) {
	       		oOptions = me._pending;
	            me._pending = false;
	            me.trigger('change', me, oOptions);
	        }
	    }
	    me._pending = false;
	    me._changing = false;
	    return me;
    }
    /**
     * 移除指定属性
     * @param {string}sAttr 参数属性
     * @param {Object=}oOptions 备选参数
     * @return {Model}返回模型对象本身
     */
    function fUnset(sAttr, oOptions) {
    	oOptions=oOptions||{};
    	oOptions.unset=true;
        return this.set(sAttr, void 0, oOptions);
    }
    /**
     * 清除所有属性
     * @param {Object=}oOptions 
     */
    function fClear(oOptions) {
    	var me=this;
        var oAttrs = {};
        for (var sKey in me._attributes) {
            oAttrs[sKey] = void 0;
        }
        oOptions=oOptions||{};
    	oOptions.unset=true;
        return me.set(oAttrs,oOptions);
    }
	/**
	 * 判断自上次change事件后有没有修改，可以指定属性
	 * @param {string=}sAttr 参数属性，为空表示判断对象有没有修改
	 * @retur {boolean} true表示有修改
	 */
    function fHasChanged(sAttr) {
    	var oChange=this._changed;
        if (sAttr == null){
        	return !$H.isEmpty(oChange);
        }
        return $H.contains(oChange, sAttr);
    }
	/**
	 * 返回改变过的属性，可以指定需要判断的属性
	 * @param {Object=}oDiff 参数属性，表示只判断传入的属性
	 * @retur {boolean} 如果有改变，返回改变的属性，否则，返回false
	 */
    function fChangedAttributes(oDiff) {
    	var me=this;
        if (!oDiff){
            return me.hasChanged() ? $H.clone(me._changed) : false;
        }
        var val, changed = false;
        var oOld = me._changing ? me._previousAttributes : me._attributes;
        for (var sAttr in oDiff) {
            if (!$H.equals(oOld[sAttr], (val = oDiff[sAttr]))){
	            (changed || (changed = {}))[sAttr] = val;
            }
        }
        return changed;
    }
	/**
	 * 返回修改前的值，如果没有修改过，则返回null
	 * @param {string}sAttr 指定属性
	 * @return {*} 返回修改前的值，如果没有修改过，则返回null
	 */
    function fPrevious(sAttr) {
    	var me=this;
        if (sAttr == null || !me._previousAttributes){
        	return null;
        }
        return me._previousAttributes[sAttr];
    }
	/**
	 * 返回所有修改前的值
	 * @return {Object} 返回所有修改前的值
	 */
    function fPreviousAttributes() {
        return $H.clone(this._previousAttributes);
    }
	/**
	 * 获取模型数据
	 * @param {Object=}oOptions 备选参数
	 */
    function fFetch(oOptions) {
    	var me=this;
        oOptions = oOptions ? $H.clone(oOptions) : {};
        if (oOptions.parse === void 0) {
        	oOptions.parse = true;
        }
        var success = oOptions.success;
        oOptions.success = function(resp) {
        	if (!me.set(me.parse(resp, oOptions), oOptions)){
        		return false;
        	}
        	if (success){
        		success(me, resp, oOptions);
        	}
        	me.trigger('sync', me, resp, oOptions);
        };
        me.sync('read', me, oOptions);
    }
	/**
	 * 保存模型
	 * @param {String}sKey 属性
	 * @param {*}val 值
	 * @param {Object}oOptions 选项{
	 * 		{boolean=}unset 是否取消设置
	 * 		{boolean=}silent 是否不触发事件
	 * 		{boolean=}update true时执行update操作
	 * 		{boolean=}now 是否立即更新模型，默认是等到回调返回时才更新
	 * }
	 */
    function fSave(sKey, val, oOptions) {
    	var me=this;
        var oAttrs, sMethod, oXhr;
        //sKey, value 或者 {sKey: value}
        if (sKey == null || typeof sKey === 'object') {
        	oAttrs = sKey;
        	oOptions = val;
        } else {
        	(oAttrs = {})[sKey] = val;
        }

        oOptions = $H.extend({validate: true}, oOptions);

        //now==true，立刻设置数据
        if (oAttrs && oOptions.now) {
       	    if (!me.set(oAttrs, oOptions)){
       	    	return false;
       	    }
        } else {
        	//验证数据
        	if (!me._validate(oAttrs, oOptions)){
		        return false;
		    }
        }

        if (oOptions.parse === void 0){
        	oOptions.parse = true;
        }
        var fSuccess = oOptions.success;
        oOptions.success = function(resp) {
	        var oServerAttrs = me.parse(resp, oOptions);
	        //now!=true，确保更新相应数据(可能没有返回相应数据)
	        if (!oOptions.now){
	        	oServerAttrs = $H.extend(oAttrs || {}, oServerAttrs);
	        }
	        //服务器返回的值可能跟现在不一样，还要根据返回值修改
	        if ($H.isObj(oServerAttrs) && !me.set(oServerAttrs, oOptions)) {
	            return false;
	        }
	        if (fSuccess){
	        	fSuccess(me, resp, oOptions);
	        }
	        me.trigger('sync', me, resp, oOptions);
	    };

	    sMethod = me.isNew() ? 'create' : (oOptions.update ? 'update':'patch' );
    	//patch只提交所有改变的值
	    if (sMethod === 'patch'){
	    	var oChanged=me.changedAttrbutes(oAttrs);
	    	//没有改变的属性，直接执行回调函数
	    	if(!oChanged){
	    		if (fSuccess){
		        	fSuccess(me, oOptions);
		        }
		        return;
	    	}
	    	oOptions.attrs = oChanged;
	    }else{
	    	//提交所有属性值
	    	var oCurrent=$H.extend({},me._attributes);
	    	oOptions.attrs = $H.extend(oCurrent,oAttrs);
	    }
	    me.sync(sMethod, me, oOptions);
    }
	/**
	 * 销毁/删除模型
	 * @param {Object=}oOptions 备选参数{
	 * 		{boolean=}now 是否立即更新模型，默认是等到回调返回时才更新
	 * }
	 */
    function fDestroy(oOptions) {
    	var me=this;
        oOptions = oOptions ? $H.clone(oOptions) : {};
        var fSuccess = oOptions.success;

        var destroy = function() {
            me.trigger('destroy', me, me.collection, oOptions);
            me.off('all');
        };

        oOptions.success = function(resp) {
	        if (!oOptions.now || me.isNew()){
	        	destroy();
	        }
	        if (fSuccess){
	        	fSuccess(me, resp, oOptions);
	        }
	        if (!me.isNew()){
	        	me.trigger('sync', me, resp, oOptions);
	        }
	    };

        if (me.isNew()) {
       	    oOptions.success();
            return false;
        }

        me.sync('delete', me, oOptions);
        if (oOptions.now){
        	destroy();
        }
    }
	/**
	 * 获取模型url
	 * @return {string} 返回模型url
	 */
    function fGetUrl() {
    	var me=this;
        var sUrl =$H.result(me, 'url') ||$H.result(me.collection, 'url');
        if(!sUrl){
        	$D.error(new Error('必须设置一个url属性或者函数'));
        }
        if (me.isNew()){
        	return sUrl;
        }
        return sUrl.replace(/([^\/])$/, '$1/') + encodeURIComponent(me.id);
    }
    /**
     * 分析处理回调数据，默认直接返回response
     * @param {Object}resp
     * @param {Object}oOptions
     */
    function fParse(resp, oOptions) {
    	if(resp.code&&resp.data){
	        return resp.data;
    	}else{
    		return resp;
    	}
    }
    /**
     * 克隆模型
     * @return {Model} 返回克隆副本
     */
    function fClone() {
    	var me=this;
        return new me.constructor(me._attributes);
    }
	/**
	 * 判断是否是新模型(没有提交保存，并且缺少id属性)
	 * @return {boolean} true表示是新模型
	 */
    function fIsNew() {
    	var me=this;
        return !me.has(me.idAttribute);
    }
	/**
	 * 校验当前是否是合法的状态
	 * @return {boolean} true表示合法
	 */
    function fIsValid(oOptions) {
        return this._validate({}, $H.extend(oOptions || {}, { validate: true }));
    }
	
	return Model;
	
});/**
 * 集合类，封装模型集合，可监听事件：invalid、add、remove、sync、sort、reset及模型的事件
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-03-06
 */
//"handy.common.Collection"
$Define('CM.Collection',
['CM.AbstractDao',
'CM.AbstractEvents',
'CM.Model'],
function(AbstractDao,AbstractEvents,Model){
	
	var Collection=AbstractEvents.derive({
		//可扩展属性
//		url                    : '',                  //集合url
//		model                  : Model,               //子对象模型类
//		dao                    : null,                //数据访问对象，默认为common.AbstractDao
		
		//内部属性
//		_models                : [],                  //模型列表
//		_byId                  : {},                  //根据id和cid索引
//		length                 : 0,                   //模型集合长度
		
		_reset                 : _fReset,             //重置集合
		_prepareModel          : _fPrepareModel,      //初始化模型
		_addReference          : _fAddReference,      //关联模型和集合
		_removeReference       : _fRemoveReference,   //移除模型和集合关联关系
		_onModelEvent          : _fOnModelEvent,      //模型事件函数，当模型有事件发生时触发，主要是跟随模型进行更新和删除
		
		initialize             : fInitialize,         //初始化
		toJSON                 : fToJSON,             //返回json格式数据(模型数据的数组)
		sync                   : fSync,               //同步数据，可以通过重写进行自定义
		add                    : fAdd,                //添加模型
		remove                 : fRemove,             //移除模型
		set                    : fSet,                //设置模型
		reset                  : fReset,              //重置模型，此方法不会触发add、remove等事件，只会触发reset事件
		push                   : fPush,               //添加到集合最后
		pop                    : fPop,                //取出集合最后一个模型
		unshift                : fUnshift,            //添加到集合最前面
		shift                  : fShift,              //取出集合第一个模型
		slice                  : fSlice,              //返回选定的元素的数组，同"Array.slice"
		get                    : fGet,                //通过id或cid获取模型
		size                   : fSize,               //获取集合元素个数
		at                     : fAt,                 //获取指定位置的模型
		where                  : fWhere,              //返回包含指定 key-value 组合的模型的数组
		findWhere              : fFindWhere,          //返回包含指定 key-value 组合的第一个模型
		sort                   : fSort,               //排序
		pluck                  : fPluck,              //提取集合里指定的属性值
		getUrl                 : fGetUrl,             //获取集合url
		fetch                  : fFetch,              //请求数据
		create                 : fCreate,             //新建模型
		parse                  : fParse,              //分析处理回调数据，默认直接返回response
		clone                  : fClone               //克隆
		
	});
	
    var HA=$H.Array;
    
	//从base.Array生成方法
	$H.each([
		'map','some','every','find','filter','invoke','indexOf'
	], function(i,sMethod) {
	    Collection.prototype[sMethod] = function() {
	      var aArgs = Array.prototype.slice.call(arguments);
	      aArgs.unshift(this._models);
	      return HA[sMethod].apply(HA, aArgs);
	    };
	});
	
	$H.each(['sortBy','groupBy','countBy'], function(sMethod) {
	    Collection.prototype[sMethod] = function(value, context) {
	        var iterator = $H.isFunc(value) ? value : function(oModel) {
	            return oModel.get(value);
	        };
	        return HA[sMethod](this._models, iterator, context);
        };
    });
	
	/**
	 * 重置集合
	 */
    function _fReset() {
    	var me=this;
        me.length = 0;
        me._models = [];
        me._byId  = {};
    }

    /**
     * 初始化模型
     * @param {Object}oAttrs key-value组合
     * @param {Object}oOptions 选项，同Model初始化选项
     * @return {Model|boolean} 返回初始化的模型，如果初始化失败，则返回false
     */
    function _fPrepareModel(oAttrs, oOptions) {
    	var me=this;
        if (oAttrs instanceof Model){
        	return oAttrs;
        }
        oOptions = oOptions ? $H.clone(oOptions) : {};
        oOptions.collection = me;
        //如果数据仓库里已经存在，直接使用
        var oModel=$S.get(me.model.$ns,{id:oOptions.id});
        if(oModel=oModel&&oModel[0]){
        	return oModel;
        }
        
        oModel = new me.model(oAttrs, oOptions);
        if (!oModel.validationError){
        	return oModel;
        }
        me.trigger('invalid', me, oModel.validationError, oOptions);
        return false;
    }
	/**
	 * 关联模型和集合
	 * @param {Model}oModel 模型对象
	 */
    function _fAddReference(oModel) {
    	var me=this;
        me._byId[oModel.cid] = oModel;
        if (oModel.id != null){
        	me._byId[oModel.id] = oModel;
        }
        if (!oModel.collection){
        	oModel.collection = me;
        }
        oModel.on('all', me._onModelEvent, me);
    }
    /**
     * 移除模型和集合关联关系
     * @param {Model}oModel 模型对象
     */
    function _fRemoveReference(oModel) {
    	var me=this;
        if (me === oModel.collection){
        	delete oModel.collection;
        }
        oModel.off('all', me._onModelEvent, me);
    }
	/**
	 * 模型事件函数，当模型有事件发生时触发，主要是跟随模型进行更新和删除
	 * @param {string}sEvent 事件名称
	 * @param {Model}oModel 模型对象
	 * @param {Collection}oCollection
	 * @param {Object}oOptions 同remove方法的选项
	 */
    function _fOnModelEvent(sEvent, oModel, oCollection, oOptions) {
    	var me=this;
        if ((sEvent === 'add' || sEvent === 'remove') && oCollection !== me){
        	return;
        }
        if (sEvent === 'destroy'){
        	me.remove(oModel, oOptions);
        }
        //id特殊处理
        if (oModel && sEvent === 'change:' + oModel.idAttribute) {
            delete me._byId[oModel.previous(oModel.idAttribute)];
            if (oModel.id != null){
            	me._byId[oModel.id] = oModel;
            }
        }
        me.trigger.apply(me, arguments);
    }
	/**
	 * 初始化
	 * @param {Array=}aModels 模型数组
	 * @param {Object=}oOptions 选项{
	 * 		{Model=}model 模型类
	 * 		{function=}comparator 比较函数
	 * }
	 */
	function fInitialize(aModels, oOptions) {
		var me=this;
		me.dao=me.dao||$H.getSingleton(AbstractDao);
	    oOptions || (oOptions = {});
	    if (oOptions.model) {
	    	me.model = oOptions.model;
	    }
	    if (oOptions.url) {
	    	me.url = oOptions.url;
	    }
	    if (oOptions.comparator !== void 0) {
	    	me.comparator = oOptions.comparator;
	    }
	    me._reset();
	    if (aModels){
	    	me.reset(aModels, $H.extend({silent: true}, oOptions));
	    }
	}
	/**
	 * 返回json格式数据(模型数据的数组)
	 * @param {Object=}oOptions 选项(同set方法)
	 * @return {Array} 模型数据数组
	 */
    function fToJSON(oOptions) {
    	var me=this;
        return $H.map(me._models,function(oModel){
        	return oModel.toJSON(oOptions); 
        });
    }
	/**
	 * 同步数据，可以通过重写进行自定义
	 * @param {string}sMethod 方法名
	 * @param {Collection}oCollection 集合对象
	 * @param {Object}oOptions 设置
	 * @return {*} 返回同步方法的结果
	 */
    function fSync(sMethod,oCollection,oOptions) {
        return this.dao.sync(sMethod,oCollection,oOptions);
    }
	/**
	 * 添加模型
	 * @param 同"set"方法
	 * @return {Model}返回被添加的模型，如果是数组，返回第一个元素
	 */
    function fAdd(models, oOptions) {
    	oOptions=$H.extend({
    		add:true,
    		remove:false,
    		merge:false
    	},oOptions);
        return this.set(models,oOptions);
    }
    /**
     * 移除模型
     * @param 同"set"方法
     * @return {Model}返回被移除的模型，如果是数组，返回第一个元素
     */
    function fRemove(models, oOptions) {
    	var me=this;
        var bSingular = !$H.isArr(models);
        models = bSingular ? [models] : $H.clone(models);
        oOptions || (oOptions = {});
        var i, l, index, oModel;
        for (i = 0, l = models.length; i < l; i++) {
        	oModel = models[i] = me.get(models[i]);
        	if (!oModel){
        		continue;
        	}
        	delete me._byId[oModel.id];
        	delete me._byId[oModel.cid];
        	index = me.indexOf(oModel);
        	me._models.splice(index, 1);
        	me.length--;
        	if (!oOptions.silent) {
          		oOptions.index = index;
          		oModel.trigger('remove', oModel, me, oOptions);
        	}
        	me._removeReference(oModel, oOptions);
        }
        return bSingular ? models[0] : models;
    }
	/**
	 * 设置模型
	 * @param {Object|Model|Array}models 模型属性对象或模型对象或数组
	 * @param {Object}oOptions 选型{
	 * 		{boolean=}add : 是否是添加
	 * 		{boolean=}merge : 是否是合并
	 * 		{boolean=}remove : 是否删除
	 * 		{boolean=}sort : 是否排序
	 * 		{number=}at : 指定添加位置
	 * 		{boolean=}parse : 是否分析处理数据
	 * }
	 * @return {Model}返回被设置的模型，如果是数组，返回第一个元素
	 */
    function fSet(models, oOptions) {
    	var me=this;
    	oOptions = $H.extend({
    		add: true,
    		remove: true,
    		merge: true
    	},oOptions);
        if (oOptions.parse){
        	models = me.parse(models, oOptions);
        }
        var bSingular = !$H.isArr(models);
        var aModels = bSingular ? (models ? [models] : []) : $H.clone(models);
        var i, l, id, oModel, oAttrs, oExisting, sort;
        var at = oOptions.at;
        var cTargetModel = me.model;
        //是否可排序
        var bSortable = me.comparator && (at == null) && oOptions.sort !== false;
        var sortAttr = typeof me.comparator=="string" ? me.comparator : null;
        var aToAdd = [], aToRemove = [], oModelMap = {};
        //是否添加
        var bAdd = oOptions.add, 
        //是否合并
        bMerge = oOptions.merge,
        //是否移除
        bRemove = oOptions.remove;
        var order = !bSortable && bAdd && bRemove ? [] : false;

        //循环设置模型
        for (i = 0, l = aModels.length; i < l; i++) {
        	oAttrs = aModels[i] || {};
        	if (oAttrs instanceof Model) {
          		id = oModel = oAttrs;
        	} else {
         		id = oAttrs[cTargetModel.prototype.idAttribute || 'id'];
        	}

        	//如果已经存在对应id的模型
        	if (oExisting = me.get(id)) {
        		//移除
            	if (bRemove){
            		oModelMap[oExisting.cid] = true;
            	}
            	//合并
          		if (bMerge) {
           			oAttrs = oAttrs === oModel ? oModel.attributes : oAttrs;
                	if (oOptions.parse){
                		oAttrs = oExisting.parse(oAttrs, oOptions);
                	}
            		oExisting.set(oAttrs, oOptions);
            		//
            		if (bSortable && !sort && oExisting.hasChanged(sortAttr)){
            			sort = true;
            		}
          		}
         		aModels[i] = oExisting;

        	} else if (bAdd) {
        		oOptions.id=id;
         		//添加	
            	oModel = aModels[i] = me._prepareModel(oAttrs, oOptions);
            	if (!oModel){
            		continue;
            	}
            	aToAdd.push(oModel);
            	me._addReference(oModel, oOptions);
        	}

        	oModel = oExisting || oModel;
        	if (order && (oModel.isNew() || !oModelMap[oModel.id])){
        		order.push(oModel);
        	}
        	oModelMap[oModel.id] = true;
        }

        //如果有需要的话，移除相应模型
        if (bRemove) {
        	for (i = 0, l = me.length; i < l; ++i) {
           		if (!oModelMap[(oModel = me._models[i]).cid]){
           			aToRemove.push(oModel);
           		}
        	}
        	if (aToRemove.length){
        		me.remove(aToRemove, oOptions);
        	}
        }

        if (aToAdd.length || (order && order.length)) {
        	if (bSortable){
        		sort = true;
        	}
        	//更新长度
            me.length += aToAdd.length;
            //指定位置上添加
        	if (at != null) {
            	for (i = 0, l = aToAdd.length; i < l; i++) {
            		me._models.splice(at + i, 0, aToAdd[i]);
          		}
       		} else {
          		if (order){
          			me._models.length = 0;
          		}
          		var orderedModels = order || aToAdd;
          		for (i = 0, l = orderedModels.length; i < l; i++) {
            		me._models.push(orderedModels[i]);
          		}
        	}
        }

        //排序
        if (sort){
        	me.sort({silent: true});
        }

        //触发相应事件
        if (!oOptions.silent) {
        	for (i = 0, l = aToAdd.length; i < l; i++) {
            	(oModel = aToAdd[i]).trigger('add', oModel, me, oOptions);
        	}
        	if (sort || (order && order.length)){
        		me.trigger('sort', me, oOptions);
        	}
        }

        //返回被设置的模型，如果是数组，返回第一个元素
        return bSingular ? aModels[0] : aModels;
    }
	/**
	 * 重置模型，此方法不会触发add、remove等事件，只会触发reset事件
	 * @param 同"set"方法
	 * @return {Model} 返回重置的模型
	 */
    function fReset(models, oOptions) {
    	var me=this;
        oOptions || (oOptions = {});
        for (var i = 0, l = me._models.length; i < l; i++) {
        	me._removeReference(me._models[i], oOptions);
        }
        oOptions.previousModels = me._models;
        me._reset();
        models = me.add(models, $H.extend({silent: true}, oOptions));
        if (!oOptions.silent){
        	me.trigger('reset', me, oOptions);
        }
        return models;
    }
	/**
	 * 添加到集合最后
	 * @param 同"set"方法
	 * @return 返回添加的模型
	 */
    function fPush(oModel, oOptions) {
    	var me=this;
        return me.add(oModel, $H.extend({at: me.length}, oOptions));
    }
	/**
	 * 取出集合最后一个模型
	 * @param 同"set"方法
	 * @return {Model} 返回取出的模型
	 */
    function fPop(oOptions) {
    	var me=this;
        var oModel = me.at(me.length - 1);
        me.remove(oModel, oOptions);
        return oModel;
    }
	/**
	 * 添加到集合最前面
	 * @param 同"set"方法
	 * @return {Model} 返回添加的模型
	 */
    function fUnshift(oModel, oOptions) {
        return this.add(oModel, $H.extend({at: 0}, oOptions));
    }
	/**
	 * 取出集合第一个模型
	 * @param 同"set"方法
	 * @return {Model} 返回第一个模型
	 */
    function fShift(oOptions) {
    	var me=this;
        var oModel = me.at(0);
        me.remove(oModel, oOptions);
        return oModel;
    }
	/**
	 * 返回选定的元素的数组，同"Array.slice"
	 * @param {number}nStart 规定从何处开始选取。如果是负数，那么它规定从数组尾部开始算起的位置。也就是说，
	 * 						 -1 指最后一个元素，-2 指倒数第二个元素，以此类推。
	 * @param {number=}nEnd 规定从何处结束选取。该参数是数组片断结束处的数组下标。如果没有指定该参数，
	 * 						那么切分的数组包含从 start 到数组结束的所有元素。如果这个参数是负数，
	 * 						那么它规定的是从数组尾部开始算起的元素。
	 * @return {Array} 选定的元素的数组
	 */
    function fSlice() {
      return Array.prototype.slice.apply(this._models, arguments);
    }
	/**
	 * 通过id或cid获取模型
	 * @param {Object|number|string}obj 可以直接是id或cid，也可以是包含id或cid属性的对象
	 * @return {Model} 返回对应模型
	 */
    function fGet(obj) {
    	var me=this;
        if (obj == null){
      		return void 0;
        }
        return me._byId[obj] || me._byId[obj.id] || me._byId[obj.cid];
    }
    /**
     * 获取集合元素个数
     * @return {number} 返回元素个数
     */
    function fSize(){
    	return this.length;
    }
	/**
	 * 获取指定位置的模型
	 * @param {number}nIndex 参数索引
	 * @return {Model} 返回该模型
	 */
    function fAt(nIndex) {
        return this._models[nIndex];
    }
	/**
	 * 返回包含指定 key-value 组合的模型的数组
	 * @param {Object}oAttrs key-value 组合
	 * @param {boolean}bFirst 是否只返回第一个模型
	 * @return {Array|Model|undefined} 返回匹配对象的数组，如果没有，则返回空数组，如果bFirst==true，返回第一个匹配的模型
	 */
    function fWhere(oAttrs, bFirst) {
    	var me=this;
        if ($H.isEmpty(oAttrs)){
        	return bFirst ? void 0 : [];
        }
        return me[bFirst ? 'find' : 'filter'](function(oModel) {
        	for (var key in oAttrs) {
            	if (oAttrs[key] !== oModel.get(key)){
            		return false;
            	}
        	}
        	return true;
        });
    }
	/**
	 * 返回包含指定 key-value 组合的第一个模型
	 * @param {Object}oAttrs key-value 组合
	 * @return {Model|undefined} 返回第一个匹配的模型，没有匹配的模型则返回undefined
	 */
    function fFindWhere(oAttrs) {
        return this.where(oAttrs, true);
    }
	/**
	 * 排序
	 * @param {Object=}oOptions 选项{
	 * 		{boolean=}silent 是否不触发事件
	 * }
	 * @return {Collection} 返回排序后的集合
	 */
    function fSort(oOptions) {
    	var me=this;
        if (!me.comparator){
        	$D.error(new Error('没有比较器'));
        }
        oOptions || (oOptions = {});

        if (typeof me.comparator=='string' || me.comparator.length === 1) {
        	me._models = me.sortBy(me.comparator, me);
        } else {
       		me._models.sort($H.Function.bind(me.comparator, me));
        }

        if (!oOptions.silent){
        	me.trigger('sort', me, oOptions);
        }
        return me;
    }
    /**
     * 提取集合里指定的属性值
	 *  @param {string}sAttr 参数属性
	 *  @return {Array} 返回集合对应属性的数组
     */
    function fPluck(sAttr) {
      return $H.invoke(this._models, 'get', sAttr);
    }
    /**
     * 获取url
     * @return {string}返回集合的url
     */
    function fGetUrl(){
    	return this.url;
    }
	/**
	 * 请求数据
	 * @param {Object=}oOptions
	 * @return {}
	 */
    // Fetch the default set of models for me collection, resetting the
    // collection when they arrive. If `reset: true` is passed, the response
    // data will be passed through the `reset` method instead of `set`.
    function fFetch(oOptions) {
    	var me=this;
        oOptions = oOptions ? $H.clone(oOptions) : {};
        if (oOptions.parse === void 0){
        	oOptions.parse = true;
        }
        var success = oOptions.success;
        oOptions.success = function(resp) {
        	var method = oOptions.reset ? 'reset' : 'set';
        	me[method](resp, oOptions);
        	if (success){
        		success(me, resp, oOptions);
        	}
        	me.trigger('sync', me, resp, oOptions);
        };
        return me.sync('read', me, oOptions);
    }
	/**
	 * 新建模型
	 * @param {C.Model|Object}oModel 模型对象或者模型属性集
	 * @param {Object=}oOptions 选项
	 * @return {C.Model} 返回新建的模型
	 */
    // Create a new instance of a model in me collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    function fCreate(oModel, oOptions) {
    	var me=this;
        oOptions = oOptions ? $H.clone(oOptions) : {};
        if (!(oModel = me._prepareModel(oModel, oOptions))){
        	return false;
        }
        if (oOptions.now){
        	me.add(oModel, oOptions);
        }
        var success = oOptions.success;
        oOptions.success = function(oModel, resp) {
        	if (!oOptions.now){
        		me.add(oModel, oOptions);
        	}
        	if (success){
        		success(oModel, resp, oOptions);
        	}
        };
        oModel.save(null, oOptions);
        return oModel;
    }
	/**
     * 分析处理回调数据，默认直接返回response
     * @param {Object}resp
     * @param {Object}oOptions
     */
    function fParse(resp, oOptions) {
        return resp.data;
    }
	/**
	 * 克隆
	 * @return {Collection} 返回克隆的集合
	 */
    function fClone() {
    	var me=this;
        return new me.constructor(me._models);
    }
	
	return Collection;
	
});