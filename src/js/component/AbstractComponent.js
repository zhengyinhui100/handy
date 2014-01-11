/**
 * 组件基类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2013-12-28
 */

$Define("handy.component.AbstractComponent","handy.component.ComponentManager",function(CM){
	
	var AC=$HO.createClass();
	
	//静态方法
	$HO.extend(AC,{
		
		_expando            : $H.expando+"_cp_",             // 组件id前缀
		_template           : '<div id="<%=this.id%>"><%=this.html%></div>', // 组件html模板, 模板必须有一个最外层的容器
		
		html                : fHtml             //静态生成组件html
	});
	
	//实例方法
	$HO.extend(AC.prototype,{
		
		ctype               : 'component',       //组件类型
		
		//默认配置
		renderTo            : null,              //渲染节点
		hidden              : false,             //是否隐藏
		disable             : false,             //是否禁用
		hideMode            : 'display',         //隐藏方式
		autoRender          : true,              //是否默认就进行渲染
		renderBy            : 'append',          //默认渲染方式
//		autoShow            : true,              //是否显示
		
		//属性
//		_id                 : null,              //组件id
		html                : null,              //组件html
		rendered            : false,             //是否已渲染
//		_container          : null,              //组件容器节点
		
		initialize          : fInitialize,
		doConfig            : fDoConfig,
		getId               : fGetId,            //获取组件id
		getEl               : fGetEl,            //获取组件节点
		initHtml            : function(){},      //初始化组件html
		getHtml             : fGetHtml,
		find                : fFind,
		hide                : fHide,             //隐藏
		show                : fShow,             //显示
//		update
		enable              : fEnable,           //启用
		disable             : fDisable,          //禁用
//		mask
//		unmask
		listen              : fListen,           //绑定事件
		unlisten            : fUnlisten,         //解除事件
		initListeners       : fInitListeners,    //初始化所有事件
		clearListeners      : fClearListeners,   //清除所有事件
		suspendListeners    : fSuspendListeners, //挂起事件
		resumeListeners     : fResumeListeners,  //恢复事件
		destroy             : fDestroy           //销毁
	});
	
	
	/**
	 * 静态生成组件html
	 * @method html
	 * @param {object}oSettings 初始化参数
	 */
	function fHtml(oSettings,parentComponent){
		oSettings.notListener=true;
		oSettings.notRender=true;
		var component=new this(oSettings);
		if(parentComponent){
			parentComponent.children.push(component);
		}
		return component.getHtml();
	}
		
	/**
	 * 初始化
	 * @method initialize
	 * @param {object}oSettings 初始化参数
	 */
	function fInitialize(oSettings){
		var that=this;
		that.doConfig(oSettings);
		//组件html
		that.initHtml(oSettings);
		var sHtml=that.html;
		//如果组件自己实现了模板，则不使用基类的模板
		var template=cHtml.indexOf('<%=this.id%>')>-1?cHtml:AC._template;
		var sId=that.getId();
		sHtml=that.html=$H.Template.compile(template,{
			id:sId,
			html:that.html
		});
		if(oSettings.autoRender!=false){
			that.renderTo[that.renderBy](sHtml);
			//缓存容器
			that._container=$("#"+sId);
		}
		
		if(oSettings.notListener!=true){
			if(that.delayInitListener){
				setTimeout(function(){
					that.initListener();
				});
			}else{
				that.initListener();
			}
		}
		//注册组件
		CM.register(that);
	}
	/**
	 * 初始化配置
	 * @method doConfig
	 * @param {object} oParams
	 */
	function fDoConfig(oParams){
		var that=this;
		$HO.extend(that,oParams);
		if(oParams.renderTo){
			that.renderTo=$(oParams.renderTo);
		}else{
			that.renderTo=$(document.body);
		}
		that.children=[];
	}
	/**
	 * 获取组件id
	 * @method getId
	 * @return {string}返回组件id
	 */
	function fGetId(){
		var that=this;
		return that._id||(that._id=AC._expando+that.ctype+"_"+$H.Util.getUuid());
	}
	/**
	 * 获取组件节点
	 * @method getEl
	 * @return {jQuery} 返回组件节点
	 */
	function fGetEl(){
		return this._container;
	}
	
	function fGetHtml(){
		return this.html;
	}
	/**
	 * 绑定事件
	 * @method listen
	 * @param {object}事件对象{
	 * 			{string}name : 事件名
	 * 			{string}selector : 选择器
	 * 			{function}func : 监听函数
	 * }
	 */
	function fListen(oEvent){
		var that=this;
		that.getEl().delegate(oEvent.selector,oEvent.name,oEvent.func);
	}
	/**
	 * 解除事件
	 * @method unlisten
	 * @param {object}事件对象{
	 * 			{string}name : 事件名
	 * 			{string}selector : 选择器
	 * 			{function}func : 监听函数
	 * }
	 */
	function fUnlisten(oEvent){
		var that=this;
		that.getEl().delegate(oEvent.selector,oEvent.name,oEvent.func);
	}
	/**
	 * 初始化所有事件
	 */
	function fInitListeners(){
		var that=this;
		//缓存容器
		that._container=that._container||$("#"+that._id);
		var children=that.children;
		for(var i=0,len=children.length;i<len;i++){
			if(children.oSettings.notListener){
				children.initListener();
			}
		}
	}
	/**
	 * 清除所有事件
	 */
	function fClearListeners(){
	}
	/**
	 * 查找子元素或子组件
	 * @method
	 */
	function fFind(selector){
		return this._container.find(selector);
	}
	/**
	 * 隐藏
	 * @method hide
	 */
	function fHide(){
		this._container.hide();
	}
	/**
	 * 显示
	 * @method show
	 */
	function fShow(){
		this._container.show();
	}
	/**
	 * 启用
	 * @method enable
	 */
	function fEnable(){
		
	}
	/**
	 * 禁用
	 * @method disable
	 */
	function fDisable(){
		
	}
	/**
	 * 销毁组件
	 * @method destroy
	 */
	function fDestroy(){
		var that=this;
		that._container.remove();
		//注销组件
		CM.unregister(that);
	}
		
	
});