/**
 * 抽象视图类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-05-17
 */
 //"handy.common.AbstractView"
$Define('CM.AbstractView',
[
'CM.ViewManager',
'CM.AbstractEvents'
],
function(ViewManager,AbstractEvents){
	
	var AbstractView=AbstractEvents.derive({
		xtype               : 'View',            //类型
		//配置
//		cid                 : '',                //客户id，是id去除视图前缀后的部分，在视图内唯一，方便使用
//		renderTo            : null,              //渲染节点
		renderBy            : 'append',          //默认渲染方式
		autoRender          : true,              //是否默认就进行渲染
//		manager             : null,              //视图管理对象
		//属性
//		_config             : null,              //配置模型对象
//		_id                 : null,              //id
//		inited              : false,             //是否已经初始化
//		initParam           : null,              //保存初始化时传入的参数
//		_container          : null,              //试图对象容器节点
//		rendered            : false,             //是否已渲染
		
		initialize          : fInitialize,       //初始化
		init                : $H.noop,           //初始化，一般留给具体项目，方便开发
		doConfig            : fDoConfig,         //初始化配置
		getId               : fGetId,            //获取id
		getCid              : fGetCid,           //获取cid
		getEl               : fGetEl,            //获取容器节点
		initHtml            : fInitHtml,         //初始化html
		getHtml             : fGetHtml,          //获取html
		parseItems          : $H.noop,           //分析子视图
		render              : fRender,           //渲染
		destroy             : fDestroy           //销毁
	});
	
	var _oTagReg=/^(<[a-zA-Z]+)/;
	var _oHasClsReg=/^[^>]+class=/;
	var _oClsReg=/(class=")/;
	
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
		//注册视图管理
		me.manager=me.constructor.manager||$H.getSingleton(ViewManager);
		//注册视图，各继承类自行实现
		me.manager.register(me,oParams);
		//初始化配置
		me.doConfig(oParams);
		//初始化，一般留给具体项目实现，方便开发
		me.init(oParams);
		//分析子视图
		me.parseItems();
		//渲染
		if(me.autoRender!=false){
			me.render();
		}
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
		var oParams=oSettings||{};
		
		$H.extend(me,oParams);
		var renderTo;
		if(renderTo=oParams.renderTo){
			me.renderTo=$(renderTo);
		}else{
			me.renderTo=$(document.body);
		}
	}
	/**
	 * 获取id
	 * @method getId
	 * @return {string}返回id
	 */
	function fGetId(){
		return this._id;
	}
	/**
	 * 获取cid
	 * @method getCid
	 * @return {string}返回id
	 */
	function fGetCid(){
		return this.cid;
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
	 * 初始化html
	 * @method initHtml
	 * @return {string} 返回html
	 */
	function fInitHtml(){
		var me=this;
		//编译模板，一个类只需执行一次
		var tmpl=me.tmpl;
		if(!$H.isFunc(tmpl)){
			me.tmpl=me.constructor.prototype.tmpl=$H.tmpl(tmpl);
		}
		//由模板生成html
		var sHtml=me.tmpl(me._config);
		return sHtml;
	}
	/**
	 * 获取html
	 * @method getHtml
	 */
	function fGetHtml(){
		var me=this;
		var sId=me.getId();
 		var sHtml=me.initHtml();
		var bHasCls=_oHasClsReg.test(sHtml);
		var sExtCls='js-'+me.manager.type+" "+'js-'+me.xtype+" "+me.extCls+" ";
		if(bHasCls){
			//添加class
			sHtml=sHtml.replace(_oClsReg,'$1'+sExtCls);
		}
		//添加id和style
		sHtml=sHtml.replace(_oTagReg,'$1 id="'+sId+'"'+(bHasCls?'':' class="'+sExtCls+'"'));
		return sHtml;
	}
	/**
	 * 渲染
	 * @method render
	 * @return {boolean=} 仅当没有成功渲染时返回false
	 */
	function fRender(){
		var me=this;
		var sHtml=me.getHtml();
		me.renderTo[me.renderBy](sHtml);
		//缓存容器
		me._container=$("#"+me.getId());
	}
	/**
	 * 销毁
	 * @method destroy
	 * @return {boolean=} 成功返回true，失败返回false，如果之前已经销毁返回空
	 */
	function fDestroy(){
		var me=this;
		if(me.destroyed){
			return;
		}
		me.clearListeners();
		me.getEl().remove();
		me.destroyed=true;
		
		//注销组件
		me.manager.unregister(me);
		delete me._container;
		delete me.renderTo;
		return true;
	}
	
	return AbstractView;
	
});