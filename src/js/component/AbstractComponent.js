/**
 * 组件基类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2013-12-28
 */

$Define("handy.component.AbstractComponent","handy.component.ComponentManager",function(CM){
	
	var AC=$HO.createClass(),
	_oIdReg=/^(<[a-zA-Z]+)/,
	_oClsReg=/(class=")/;
	
	//静态方法
	$HO.extend(AC,{
		define              : fDefine,           //定义组件
		html                : fHtml              //静态生成组件html
	});
	
	//实例方法
	$HO.extend(AC.prototype,{
		
		xtype               : 'AbstractComponent',       //组件类型
		
		//默认配置
		renderTo            : null,              //渲染节点
		hidden              : false,             //是否隐藏
		disabled            : false,             //是否禁用
		hideMode            : 'display',         //隐藏方式
		autoRender          : true,              //是否默认就进行渲染
		renderBy            : 'append',          //默认渲染方式
		notListen           : false,             //不自动初始化监听器
		extCls              : '',                //组件附加class
		activeCls           : 'w-active',        //激活样式
//		defItem             : null,              //默认子组件配置
		////通用效果
		radius              : null,         	 //圆角，null：无圆角，little：小圆角，normal：普通圆角，big：大圆角
		shadow              : false,        	 //外阴影
		shadowInset         : false,        	 //内阴影
		isMini              : false,       	     //小号
		isActive            : false,             //是否激活
		isFocus             : false,        	 //聚焦
		isInline            : false,             //是否内联(宽度自适应)
		
		//属性
//		params              : null,              //初始化时传入的参数
//		_id                 : null,              //组件id
//		tmpl                : [],                //组件模板
//		tmplStr             : '',                //组件模板字符串
		html                : null,              //组件html
//		rendered            : false,             //是否已渲染
//		children            : [],                //子组件
		isSuspend           : false,             //是否挂起事件
//		_container          : null,              //组件容器节点
//		_listeners          : {},                //事件池  
		_customEvents       : [                  //自定义事件,可以通过参数属性的方式直接进行添加
			'beforeRender','afterRender','show','hide','destroy'
		],  
		_defaultEvents      : [                  //默认事件，可以通过参数属性的方式直接进行添加
			'click','mouseover','focus'
		],
		
		initialize          : fInitialize,       //初始化
		doConfig            : fDoConfig,         //初始化配置
		getId               : fGetId,            //获取组件id
		getEl               : fGetEl,            //获取组件节点
		getHtml             : fGetHtml,          //获取html
		getChildrenHtml     : fGetChildrenHtml,  //获取所有子组件拼接后的html
		getExtCls           : fGetExtCls,        //生成通用样式
		afterRender         : fAfterRender,      //渲染后续工作
		find                : fFind,             //查找子元素
		hide                : fHide,             //隐藏
		show                : fShow,             //显示
//		update
		enable              : fEnable,           //启用
		disable             : fDisable,          //禁用
		active              : fActive,           //激活
		unactive            : fUnactive,         //不激活
		
//		mask
//		unmask
		fire                : fFire,             //触发组件自定义事件
		listen              : fListen,           //绑定事件
		unlisten            : fUnlisten,         //解除事件
		initListeners       : fInitListeners,    //初始化所有事件
		clearListeners      : fClearListeners,   //清除所有事件
		suspendListeners    : fSuspendListeners, //挂起事件
		resumeListeners     : fResumeListeners,  //恢复事件
		
		each                : fEach,             //遍历子组件
		index               : fIndex,            //获取本身的索引，如果没有父组件则返回null
		callChild           : fCallChild,        //调用子组件方法
		add                 : fAdd,              //添加子组件
		remove              : fRemove,           //删除子组件
		parseItem           : function(){},      //分析子组件，由具体组件类实现
		parseItems          : fParseItems,       //分析子组件列表
		destroy             : fDestroy           //销毁
	});
	
	/**
	 * 定义组件
	 * @method define
	 * @param {string}sXtype 组件类型
	 * @return {class}组件类对象
	 */
	function fDefine(sXtype){
		var Component=$HO.createClass();
		$HO.inherit(Component,AC,null,null,{ignore:['define']});
		CM.registerType(sXtype,Component);
		return Component;
	}
	/**
	 * 静态生成组件html
	 * @method html
	 * @param {object}oSettings 初始化参数
	 */
	function fHtml(oSettings){
		oSettings.autoRender=false;
		var component=new this(oSettings);
		return component.getHtml();
	}
		
	/**
	 * 初始化
	 * @method initialize
	 * @param {object}oSettings 初始化参数
	 */
	function fInitialize(oSettings){
		var me=this;
		//初始化配置
		me.doConfig(oSettings);
		//分析处理子组件
		me.parseItems();
		//由模板生成组件html
		var sHtml=$H.Template.tmpl({id:me.xtype,tmpl:me.tmplStr||(me.tmplStr=me.tmpl.join(''))},me);
		var sId=me.getId();
		//添加id
		sHtml=sHtml.replace(_oIdReg,'$1 id="'+sId+'"');
		//添加附加class
		sHtml=me.html=sHtml.replace(_oClsReg,'$1'+me.getExtCls());
		me.fire('beforeRender');
		if(me.autoRender!=false){
			me.renderTo[me.renderBy](sHtml);
			//渲染后续工作
			me.afterRender();
		}
		//注册组件
		CM.register(me);
	}
	/**
	 * 初始化配置
	 * @method doConfig
	 * @param {object} oParams
	 */
	function fDoConfig(oParams){
		var me=this;
		me.params=oParams;
		//生成对象的监听器列表
		var aListeners=me.listeners||[];
		if(oParams.listeners){
			me._listeners=aListeners.concat(oParams.listeners);
		}else{
			me._listeners=aListeners.concat();
		}
		//只覆盖已声明的基本类型的属性
		$HO.extend(me,oParams,{notCover:function(sProp){
			var value=me[sProp];
			//默认事件，可通过参数属性直接添加
			var bIsCustEvt=$HO.contain(me._customEvents,sProp);
			var bIsDefEvt=$HO.contain(me._defaultEvents,sProp);
			if(bIsCustEvt||bIsDefEvt){
				me._listeners.push({
					type:sProp,
					notEl:bIsCustEvt,
					handler:oParams[sProp]
				});
			}
			if((value!=null&&typeof value=='object')||$HO.isFunction(value)){
				return true;
			}
		}});
		if(oParams.renderTo){
			me.renderTo=$(oParams.renderTo);
		}else{
			me.renderTo=$(document.body);
		}
		me.children=[];
	}
	/**
	 * 获取组件id
	 * @method getId
	 * @return {string}返回组件id
	 */
	function fGetId(){
		var me=this;
		return me._id||(me._id=CM.generateId(me.cid));
	}
	/**
	 * 获取组件节点
	 * @method getEl
	 * @return {jQuery} 返回组件节点
	 */
	function fGetEl(){
		return this._container;
	}
	/**
	 * 获取html
	 * @method getHtml
	 */
	function fGetHtml(){
		return this.html;
	}
	/**
	 * 获取所有子组件拼接后的html
	 * @method getChildrenHtml
	 * @return {string} 返回子组件html
	 */
	function fGetChildrenHtml(){
		var aChildren=this.children;
		var aHtml=[];
		for(var i=0;i<aChildren.length;i++){
			aHtml.push(aChildren[i].getHtml());
		}
		return aHtml.join('');
	}
	/**
	 * 生成通用样式
	 * @method getExtCls
	 * @return {string} 返回通用样式
	 */
	function fGetExtCls(){
		var me=this;
		var aCls=[];
		if(me.extCls){
			aCls.push(me.extCls);
		}
		if(me.disabled){
			aCls.push('w-disable');
		}
		if(me.radius){
			aCls.push('w-radius-'+me.radius);
		}
		if(me.isMini){
			aCls.push('w-mini');
		}
		if(me.shadow){
			aCls.push('w-shadow');
		}
		if(me.shadowInset){
			aCls.push('w-shadow-inset');
		}
		if(me.isActive){
			aCls.push(me.activeCls);
		}
		if(me.isFocus){
			aCls.push('w-focus');
		}
		if(me.isInline){
			aCls.push('w-inline');
		}
		return aCls.length>0?aCls.join(' ')+' ':'';
	}
	/**
	 * 渲染后续工作
	 * @method afterRender
	 */
	function fAfterRender(){
		var me=this;
		//缓存容器
		me._container=$("#"+me.getId());
		me.rendered=true;
		if(me.notListen!=true){
			me.initListeners();
		}
		if(me.disabled){
			me.suspendListeners();
		}
		me.fire('afterRender');
		delete me.html;
	}
	/**
	 * 查找子元素或子组件
	 * @method
	 */
	function fFind(selector){
		return this.getEl().find(selector);
	}
	/**
	 * 隐藏
	 * @method hide
	 */
	function fHide(){
		var me=this;
		me.getEl().hide();
		me.fire('hide');
	}
	/**
	 * 显示
	 * @method show
	 */
	function fShow(){
		var me=this;
		me.getEl().show();
		me.fire('show');
	}
	/**
	 * 启用
	 * @method enable
	 */
	function fEnable(){
		var me=this;
		me.resumeListeners();
		me.getEl().removeClass("w-disable");
	}
	/**
	 * 禁用
	 * @method disable
	 */
	function fDisable(){
		var me=this;
		me.suspendListeners();
		me.getEl().addClass("w-disable");
	}
	/**
	 * 激活
	 * @method active
	 */
	function fActive(){
		var me=this;
		me.getEl().addClass(me.activeCls);
	}
	/**
	 * 不激活
	 * @method unactive
	 */
	function fUnactive(){
		var me=this;
		me.getEl().removeClass(me.activeCls);
	}
	/**
	 * 触发组件自定义事件
	 * @method fire
	 * @param {string}sType 事件类型
	 */
	function fFire(sType){
		var me=this;
		for(var i=me._listeners.length-1;i>=0;i--){
			var oListener=me._listeners[i]
			if(oListener.type==sType){
				var fDelegation=oListener.delegation;
				fDelegation({obj:me,data:oListener.data});
			}
		}
	}
	/**
	 * 绑定事件
	 * @method listen
	 * @param {object}事件对象{
	 * 			{string}type      : 事件名
	 * 			{function}handler : 监听函数
	 * 			{any=}data        : 数据
	 * 			{jQuery=}el       : 绑定事件的节点，不传表示组件容器节点
	 * 			{boolean=}notEl    : 为true时是自定义事件
	 * 			{string=}selector : 选择器
	 * 			{any=}scope       : 监听函数执行的上下文对象，默认是组件对象
	 * 			{string=}method   : 绑定方式，默认为"bind"
	 * }
	 */
	function fListen(oEvent){
		var me=this,
			sType=oEvent.type,
			aListeners=me._listeners,
			oEl=oEvent.el,
			sMethod=oEvent.method||"bind",
			sSel=oEvent.selector,
			oData=oEvent.data,
			fFunc=oEvent.delegation=function(){
				if(me.isSuspend!=true){
					return oEvent.handler.apply(oEvent.scope||me,arguments);
				}
			};
		oEl=oEl?typeof oEl=='string'?me.find(oEl):oEl:me.getEl();
		if(!oEvent.notEl){
			if(sSel){
				if(oData){
					oEl[sMethod](sSel,sType,oData,fFunc);
				}else{
					oEl[sMethod](sSel,sType,fFunc);
				}
			}else{
				if(oData){
					oEl[sMethod](sType,oData,fFunc);
				}else{
					oEl[sMethod](sType,fFunc);
				}
			}
		}
		aListeners.push(oEvent)
	}
	/**
	 * 解除事件
	 * @method unlisten
	 * @param {object}事件对象{
	 * 			{string}type      : 事件名
	 * 			{function}handler : 监听函数
	 * 			{jQuery=}el       : 绑定事件的节点，不传表示组件容器节点
	 * 			{boolean=}notEl    : 为true时是自定义事件
	 * 			{string=}selector : 选择器
	 * 			{string=}method   : 绑定方式，默认为"bind"
	 * }
	 */
	function fUnlisten(oEvent){
		var me=this,
			sType=oEvent.type,
			oEl=oEvent.el||me.getEl(),
			sMethod=oEvent.method=="delegate"?"undelegate":"unbind",
			sSel=oEvent.selector,
			fDelegation;
		for(var i=me._listeners.length-1;i>=0;i--){
			var oListener=me._listeners[i]
			if(oListener.handler==oEvent.handler){
				fDelegation=oListener.delegation;
				me._listeners.splice(i,1);
				break;
			}
		}
		if(!oEvent.notEl){
			if(sSel){
				oEl[sMethod](sSel,sType,fDelegation);
			}else{
				oEl[sMethod](sType,fDelegation);
			}
		}
	}
	/**
	 * 初始化所有事件
	 * @method initListeners
	 */
	function fInitListeners(){
		var me=this;
		//缓存容器，autoRender为false时需要此处获取容器
		me._container=me._container||$("#"+me._id);
		var aListeners=me._listeners;
		me._listeners=[];
		for(var i=aListeners.length-1;i>=0;i--){
			me.listen(aListeners[i]);
		}
		me.callChild('initListeners');
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
		me.callChild('clearListeners');
	}
	/**
	 * 挂起事件
	 * @method suspendListeners
	 */
	function fSuspendListeners(){
		var me=this;
		me.isSuspend=true;
		me.callChild('suspendListeners');
	}
	/**
	 * 恢复事件
	 * @method resumeListeners
	 */
	function fResumeListeners(){
		var me=this;
		me.isSuspend=false;
		me.callChild('resumeListeners');
	}
	/**
	 * 遍历子组件
	 * @method each
     * @param {function}fCallback 回调函数:fCallback(i,oChild)|fCallback(args)this=oChild,返回false时退出遍历
     * @param {*}args  回调函数的参数
	 */
	function fEach(fCallback, args){
		$HO.each(this.children,fCallback, args);
	}
	/**
	 * 获取本身的索引，如果没有父组件则返回null
	 * @method index
	 * @return {number} 返回对应的索引
	 */
	function fIndex(){
		var me=this;
		var oParent=me.parent;
		if(!oParent){
			return null;
		}else{
			var nIndex;
			oParent.each(function(i,oCmp){
				if(oCmp==me){
					nIndex=i;
					return false;
				}
			});
			return nIndex;
		}
	}
	/**
	 * 调用子组件方法
	 * @method callChild
	 * @param {string}sMethod 调用的子组件的方法名
	 */
	function fCallChild(sMethod){
		var aChildren=this.children;
		for(var i=0,len=aChildren.length;i<len;i++){
			aChildren[i][sMethod]();
		}
	}
	/**
	 * 添加子组件
	 * @method add
	 * @param {object}oCmp 组件对象
	 */
	function fAdd(oCmp){
		var me=this;
		me.children.push(oCmp);
		oCmp.parent=me;
	}
	/**
	 * 删除子组件
	 * @method remove
	 * @param {object}oCmp 组件对象
	 * @return {boolean} true表示删除成功
	 */
	function fRemove(oCmp){
		var me=this;
		var aChildren=me.children;
		var bResult=false;
		for(var i=0,len=aChildren.length;i<len;i++){
			if(aChildren[i]==oCmp){
				aChildren.splice(i,1);
				oCmp.destroy();
				bResult=true;
			}
		}
		return bResult;
	}
	/**
	 * 分析子组件列表
	 * @method parseItems
	 */
	function fParseItems(){
		var me=this;
		var aItems=me.params.items;
		if(!aItems){
			return;
		}
		aItems=aItems.length?aItems:[aItems];
		//逐个初始化子组件
		for(var i=0,len=aItems.length;i<len;i++){
			var oItem=aItems[i];
			//默认子组件配置
			if(me.defItem){
				$HO.extend(oItem,me.defItem,{notCover:true});
			}
			//具体组件类处理
			me.parseItem(oItem);
			var Component=CM.getClass(oItem.xtype);
			oItem.autoRender=false;
			var oCmp=new Component(oItem);
			me.add(oCmp);
		}
	}
	/**
	 * 销毁组件
	 * @method destroy
	 */
	function fDestroy(){
		var me=this;
		//注销组件
		CM.unregister(me);
		me.fire('destroy');
		me.clearListeners();
		me.callChild('destroy');
		me.getEl().remove();
		delete me._listeners;
		delete me._contianer;
		delete me.children;
	}
		
	return AC;
	
});