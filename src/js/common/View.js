/**
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
'CM.AbstractEvents'],
function(ViewManager,AbstractEvents){
	
	var _oTagReg=/^(<[a-zA-Z]+)/;
	var _oHasClsReg=/^[^>]+class=/;
	var _oClsReg=/(class=")/;
	
	//自定义事件
	var View=AbstractEvents.extend({
		
		xtype               : 'View',    //类型
		
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
		
		
		//属性
//		manager             : null,              //视图管理对象
//		params              : null,              //初始化时传入的参数
//		_container          : null,              //试图对象容器节点
//      listened            : false,             //是否已初始化事件
//		isSuspend           : false,             //是否挂起事件
//		destroyed           : false,             //是否已销毁
//		_id                 : null,              //id
//		tmpl                : [],                //模板，首次初始化前为数组，初始化后为字符串，ps:模板容器节点上不能带有id属性
//		rendered            : false,             //是否已渲染
//      showed              : false,             //是否已显示
		children            : [],                //子视图列表
		_customEvents       : [                  //自定义事件,可以通过参数属性的方式直接进行添加
			'beforeRender','render','afterRender',
			'beforeShow','show','afterShow',
			'beforeHide','hide','afterHide',
			'beforeUpdate','update','afterUpdate',
			'beforeDestroy','destroy','afterDestroy'
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
//      listeners           : [],                //类事件配置
//		_listeners          : {},                //实例事件池
		
		_parseListenEvents  : _fParseListenEvents, //处理对象类型或者空格相隔的多事件
		
		initialize          : fInitialize,       //初始化
		doConfig            : fDoConfig,         //初始化配置
		getEl               : fGetEl,            //获取容器节点
		getId               : fGetId,            //获取id
		initHtml            : fInitHtml,         //初始化html
		getHtml             : fGetHtml,          //获取html
		findHtml            : fFindHtml,         //获取子视图html
		initStyle           : fInitStyle,        //初始化样式
		
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
		
		listen              : fListen,           //绑定事件
		unlisten            : fUnlisten,         //解除事件
		initListeners       : fInitListeners,    //初始化所有事件
		clearListeners      : fClearListeners,   //清除所有事件
		suspend             : fSuspend,          //挂起事件
		resume              : fResume,           //恢复事件
		
		//视图管理相关
		each                : fEach,             //遍历子视图
		match               : fMatch,            //匹配选择器
		find                : fFind,             //查找子元素或子视图
		parents             : fParents,          //查找祖先元素或祖先视图
		index               : fIndex,            //获取本身的索引，如果没有父视图则返回null
		callChild           : fCallChild,        //调用子视图方法
		add                 : fAdd,              //添加子视图
		remove              : fRemove,           //删除子视图
		addItem             : fAddItem,          //添加子视图配置
		parseItem           : function(){},      //分析子视图，由具体视图类实现
		parseItems          : fParseItems,       //分析子视图列表
		
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
				oEvent.handler=aParams[0];
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
		me.manager=me.constructor.manager||$H.getSingleton(ViewManager);
		//初始化配置
		me.doConfig(oParams);
		me.parseItems();
		if(me.autoRender!=false){
			me.render();
		}
		//注册视图，各继承类自行实现
		me.manager.register(me);
	}
	/**
	 * 初始化配置
	 * @method doConfig
	 * @param {Object}oParams 初始化参数
	 */
	function fDoConfig(oParams){
		var me=this;
		//保存参数
		me.params=oParams;
		//复制参数
		me.settings=$H.clone(oParams);
		if(oParams.renderTo){
			me.renderTo=$(oParams.renderTo);
		}else{
			me.renderTo=$(document.body);
		}
		var aListeners=me.listeners||[];
		//添加参数中的事件
		if(oParams.listeners){
			aListeners=aListeners.concat(oParams.listeners);
		}
		me._listeners=aListeners;
		
		//只覆盖基本类型的属性
		$H.extend(me,oParams,{notCover:function(sProp){
			var value=me[sProp];
			//默认事件，可通过参数属性直接添加
			var bIsCustEvt=$H.contains(me._customEvents,sProp);
			var bIsDefEvt=$H.contains(me._defaultEvents,sProp);
			if(bIsDefEvt){
				me._listeners.push({
					name:sProp,
					handler:oParams[sProp]
				});
			}else if(bIsCustEvt){
				me.on(sProp,oParams[sProp]);
			}
			if((value!=null&&typeof value=='object')||$H.isFunction(value)){
				return true;
			}
		}});
		//覆盖子视图默认配置
		if(oParams.defItem){
			$H.extend(me.defItem,oParams.defItem);
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
		//将数组方式的模板转为字符串
		if(typeof me.tmpl!='string'){
			me.tmpl=me.constructor.prototype.tmpl=me.tmpl.join('');
		}
		//由模板生成html
		var sHtml=$H.Template.tmpl({id:me.xtype,tmpl:me.tmpl},me);
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
		var sExtCls='js-'+me.manager.type+" "+me.extCls+" ";
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
		var aChildren=sSel==">*"?me.children:me.find(sSel);
		var aHtml=[];
		for(var i=0;i<aChildren.length;i++){
			aHtml.push(aChildren[i].getHtml());
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
	 * 绑定事件
	 * @method listen
	 * @param {object}事件对象{
	 * 			{string}name      : 事件名
	 * 			{function(Object[,fireParam..])}handler : 监听函数，第一个参数为事件对象oListener，其后的参数为fire时传入的参数
	 * 			{any=}data        : 数据
	 * 			{jQuery=}el       : 绑定事件的节点，不传表示容器节点
	 * 			{CM.AbstractEvents=}target : 监听对象(listenTo方法)，继承自AbstractEvents的实例对象
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
		if(oTarget||bIsCustom){
			var aArgs=$H.removeUndefined([oTarget,sName,fHandler,context,nTimes]);
			me[bIsCustom?'on':'listenTo'].apply(me,aArgs);
		}else if(oEvent.custom){
			me.on.apply(me,sName,fHandler,context,nTimes);
		}else{
			var aListeners=me._listeners,
				oEl=oEvent.el,
				sMethod=oEvent.method||"bind",
				sSel=oEvent.selector,
				oData=oEvent.data,
				fFunc=oEvent.delegation=me._delegateHandler(fHandler,context);
			//移动浏览器由于click可能会有延迟，这里转换为touchend事件
			if($H.mobile()){
				if(sName=="click"){
					sName="touchend";
				}
			}
			oEl=oEl?typeof oEl=='string'?me.find(oEl):oEl:me.getEl();
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
			oEl=oEl?typeof oEl=='string'?me.find(oEl):oEl:me.getEl();
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
		var aListeners=me._listeners;
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
		//'Button[attr=value]'=>'[xtype=Button][attr=value]'
		sSel=sSel.replace(/^([^\[]+)/,'[xtype="$1"]');
		//循环检查
		var r=/\[([^=|\!]+)(=|\!=)([^=]+)\]/g;
		while(m=r.exec(sSel)){
			prop=m[1];
			//操作符：=|!=
			op=m[2];
			value=eval(m[3]);
			if(op==="="?o[prop]!=value:o[prop]==value){
				return false;
			}
		}
		return true;
	}
	/**
	 * 查找子元素或子视图
	 * @method find
	 * @param {string}sSel '$'开头表示查找视图，多个选择器间用","隔开('$sel1,$sel2,...')，语法类似jQuery，如：'$xtype[attr=value]'、'$ancestor descendant'、'$parent>child'，
	 * 				'$>Button'表示仅查找当前子节点中的按钮，'$Button'表示查找所有后代节点中的按钮，
	 * @param {Array=}aResult 用于存储结果集的数组
	 * @return {jQuery|Array} 返回匹配的结果，如果没找到匹配的子视图则返回空数组
	 */
	function fFind(sSel,aResult){
		var me=this;
		//查找元素
		if(sSel.indexOf('$')!=0){
			return me.getEl().find(sSel);
		}
		var aResult=aResult||[];
		//多个选择器
		if(sSel.indexOf(",")>0){
			$H.each(sSel.split(","),function(i,val){
				aResult=aResult.concat(me.find(val));
			})
			return aResult;
		}
		//查找视图
		var bOnlyChildren=sSel.indexOf('>')==1;
		var sCurSel=sSel.replace(/^\$>?\s?/,'');
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
					oChild.find('$'+sExtSel,aResult);
				}
			}
			if(!bOnlyChildren){
				//如果不是仅限当前子节点，继续从后代开始查找
				oChild.find(sSel,aResult);
			}
		});
		return aResult;
	}
	/**
	 * 查找祖先元素或祖先视图
	 * @method parents
	 * @param {string=}sSel 若此参数为空，直接返回最顶级祖先视图，'$'开头表示查找视图，如：'$xtype[attr=value]'
	 * @return {jQuery|Component|null} 返回匹配的结果，如果没找到匹配的视图则返回null
	 */
	function fParents(sSel){
		var me=this;
		//查找元素
		if(sSel&&sSel.indexOf('$')!=0){
			return me.getEl().parents(sSel);
		}
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
	 * @param {object}oItem 视图对象
	 */
	function fAdd(oItem){
		var me=this;
		me.children.push(oItem);
		oItem.parent=me;
	}
	/**
	 * 删除子视图
	 * @method remove
	 * @param {object}oItem 视图对象
	 * @return {boolean} true表示删除成功
	 */
	function fRemove(oItem){
		var me=this;
		var aChildren=me.children;
		var bResult=false;
		for(var i=0,len=aChildren.length;i<len;i++){
			if(aChildren[i]==oItem){
				aChildren.splice(i,1);
				oItem.destroy();
				bResult=true;
			}
		}
		return bResult;
	}
	/**
	 * 添加子视图配置
	 * @method addItem
	 * @param {object}oItem 子视图配置
	 */
	function fAddItem(oItem){
		var me=this;
		var oSettings=me.settings;
		var items=oSettings.items;
		if(!items){
			oSettings.items=[];
		}else if(!$H.isArray(items)){
			oSettings.items=[items];
		}
		oSettings.items.push(oItem);
	}
	/**
	 * 分析子视图列表
	 * @method parseItems
	 */
	function fParseItems(){
		var me=this;
		var aItems=me.settings.items;
		if(!aItems){
			return;
		}
		aItems=aItems.length?aItems:[aItems];
		//逐个初始化子视图
		for(var i=0,len=aItems.length;i<len;i++){
			var oItem=aItems[i];
			//默认子视图配置
			if(me.defItem){
				$H.extend(oItem,me.defItem,{notCover:true});
			}
			//具体视图类处理
			me.parseItem(oItem);
			var Item=me.manager.getClass(oItem.xtype);
			if(Item){
				if(!oItem.renderTo){
					oItem.autoRender=false;
				}
				var oItem=new Item(oItem);
				me.add(oItem);
			}else{
				$D.error("xtype:"+oItem.xtype+"未找到");
			}
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
		//cid不同
		oOptions=$H.extend({
			renderBy:'before',
			renderTo:me.getEl()
		},oOptions);
		if(oParent){
			//继承默认配置
			oOptions=$H.extend(oParent.defItem,oOptions);
			//具体视图类处理
			oParent.parseItem(oOptions);
		}
		//不需要改变id/cid
		if(!oOptions.cid||oOptions.cid==me.cid){
			oOptions._id=me._id;
		}
		var oNew=new me.constructor(oOptions);
		if(oParent){
			oNew.parent=oParent;
			oParent.each(function(i,oItem){
				if(oItem==me){
					oParent.children.splice(i,1,oNew);
					return false;
				}
			});
		}
		me.destroy();
		me.trigger('update');
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
	 * @return {boolean=} 如果没有顺利销毁，则直接返回false
	 */
	function fDestroy(){
		var me=this;
		if(me.beforeDestroy()==false||me.destroyed){
			return false;
		}
		me.callChild();
		
		me.trigger('destroy');
		me.clearListeners();
		me.getEl().remove();
		me.destroyed=true;
		
		if(me.parent){
			me.parent.remove(me);
		}
		//注销组件
		me.manager.unregister(me);
		delete me.params;
		delete me.settings;
		delete me._container;
		delete me.renderTo;
		delete me._listeners;
		delete me.children;
		me.afterDestroy();
	}
	/**
	 * 销毁后工作
	 */
	function fAfterDestroy(){
		this.trigger('afterDestroy');
	}
	
	return View;
	
});