/**
 * 组件基类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2013-12-28
 */

$Define("handy.component.Component",function(){
	
	var Component=$HO.createClass();
	
	//静态方法
	$HO.extend(Component,{
		
		_expando   : $H.expando, // 组件id前缀
		_template  : '<div id="<%=this.id%>"><%=this.html%></div>', // 组件html模板, 模板必须有一个最外层的容器
		
		render     : fRender,
		html       : fHtml
//		find
	});
	
	//实例方法
	$HO.extend(Component.prototype,{
		ctype               : 'component',
		
		initialize          : fInitialize,
		doConfig            : fDoConfig,
		getId               : fGetId,
		getEl               : fGetEl,
		initHtml            : fInitHtml,
		getHtml             : fGetHtml,
		findChildren        : fFindChildren,
		hide                : fHide,
		show                : fShow,
//		update
//		enable
//		disable
//		mask
//		unmask
		initListener        : fInitListener,
//		addListener
		destroy             : fDestroy
	});
	/**
	 * 
	 * @param {object}settings 初始化参数 {
	 * 			{any}data 数据
	 * }
	 */
	function fRender(settings){
		return new this(settings);
	}
	/**
	 * 
	 * @param {object}settings 初始化参数 {
	 * 			{any}data 数据
	 * }
	 */
	function fHtml(settings,parentComponent){
		settings.notListener=true;
		settings.notRender=true;
		var component=new this(settings);
		if(parentComponent){
			parentComponent.children.push(component);
		}
		return component.getHtml();
	}
		
	/**
	 * 初始化
	 * @method initialize
	 * @param {object}settings 初始化参数 {
	 * 			{any}data 数据
	 * }
	 */
	function fInitialize(settings){
		var that=this;
		that.doConfig(settings);
		//组件html
		that.initHtml(settings);
		var cHtml=that.chtml;
		var template=cHtml.indexOf('<%=this.id%>')>-1?cHtml:Component._template;
		var html=that.html=$H.Template.compile(template,{
			id:that.id,
			html:that.chtml
		});
		if(settings.notRender!=true){
			that.renderTo.append(html);
			//缓存容器
			that.container=$("#"+that.id);
		}
		
		if(settings.notListener!=true){
			if(that.delayInitListener){
				setTimeout(function(){
					that.initListener();
				});
			}else{
				that.initListener();
			}
		}
	}
	/**
	 * @method doConfig
	 */
	function fDoConfig(settingParams){
		var that=this;
		var settings=that.settings={};
		$HO.extend(settings,settingParams);
		if(settings.renderTo){
			that.renderTo=$(settings.renderTo);
		}else{
			that.renderTo=$(document.body);
		}
		that.children=[];
		//组件id
		that.id=Component._expando+that.constructor.ctype+"_"+$H.Util.getUuid();
	}
	
	function fGetId(){
		
	}
	function fGetEl(){
	}
	
	function fInitHtml(){
	}
	
	function fGetHtml(){
		return this.html;
	}
	
	function fInitListener(){
		var that=this;
		//缓存容器
		that.container=that.container||$("#"+that.id);
		var children=that.children;
		for(var i=0,len=children.length;i<len;i++){
			if(children.settings.notListener){
				children.initListener();
			}
		}
	}
	
	function fFind(selector){
		return this.container.find(selector);
	}
	
	function fHide(){
		this.container.hide();
	}
	function fShow(){
		this.container.show();
	}
	
	function fDestroy(){
		this.container.remove();
	}
		
	
});

