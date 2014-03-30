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
//		tmpl                : [],                //模板，首次初始化前为数组，初始化后为字符串，ps:模板容器节点上不能带有id属性
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
////	lazyInit            : fLazyInit,         //保留方法：懒加载，初始化时只设置占位标签，以后再进行真正的初始化
		doConfig            : fDoConfig,         //初始化配置
		getEl               : fGetEl,            //获取容器节点
		getId               : fGetId,            //获取id
		initHtml            : fInitHtml,         //初始化html
		getHtml             : fGetHtml,          //获取html
		findHtml            : fFindHtml,         //获取子视图html
		initStyle           : fInitStyle,        //初始化样式
////	layout              : fLayout,           //布局，保留接口
		
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
		if($H.isArray(aParams)){
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
		if(me.inited){
			return;
		}
		me.manager=me.constructor.manager||$H.getSingleton(ViewManager);
		
		//初始化配置
		me.doConfig(oParams);
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
				$H.extend(me[p],val);
				return true;
			}else if(p=='listener'){
				me.listeners=me.listeners.concat($H.isArray(val)?val:[val]);
				return true;
			}else if(p=='items'){
				me.add(val);
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
		if($H.isFunction(oTarget)){
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
			if($H.isFunction(oEl)){
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
	 * @param {number|string|Function(View)}sel 数字表示子组件索引，
	 * 				如果是字符串：多个选择器间用","隔开('sel1,sel2,...')，语法类似jQuery，
	 * 				如：'xtype[attr=value]'、'ancestor descendant'、'parent>child'，
	 * 				'>Button'表示仅查找当前子节点中的按钮，'Button'表示查找所有后代节点中的按钮，
	 * 				如果是函数(参数是当前匹配的视图对象)，则将返回true的结果加入结果集
	 * @param {Array=}aResult 用于存储结果集的数组
	 * @return {Array} 返回匹配的结果，如果没找到匹配的子视图则返回空数组，ps:只有一个结果也返回数组，便于统一接口
	 */
	function fFind(sel,aResult){
		var me=this,aResult=aResult||[];
		if($H.isNumber(sel)){
			var oItem=me.children[sel];
			aResult.push(oItem);
		}else if($H.isString(sel)){
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
		}else if($H.isFunction(sel)){
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
		if($H.isNumber(item)){
			nIndex=item;
			item=aChildren[nIndex];
		}else if($H.isString(item)||$H.isFunction(item)){
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
		aItems=$H.isArray(aItems)?aItems:[aItems];
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
	
});