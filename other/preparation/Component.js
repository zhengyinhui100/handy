//组件基类


(function(){
	
	var Component=$H.createClass("handy.component.Component");
	
	//静态方法
	$HO.extend(Component,{
		
		_expando   : "_handy_", // 组件id前缀
		_template  : '<div id="<%=this.id%>"><%=this.html%></div>', // 组件html模板, 模板必须有一个最外层的容器
		
		
		/**
		 * 
		 * @param {object}settings 初始化参数 {
		 * 			{any}data 数据
		 * }
		 */
		render:function(settings){
			return new this(settings);
		},
		/**
		 * 
		 * @param {object}settings 初始化参数 {
		 * 			{any}data 数据
		 * }
		 */
		html:function(settings,parentComponent){
			settings.notListener=true;
			settings.notRender=true;
			var component=new this(settings);
			if(parentComponent){
				parentComponent.children.push(component);
			}
			return component.getHtml();
		}
	});
	
	//类方法
	$HO.extend(Component.prototype,{
		
		ctype:'component',
		
		/**
		 * 
		 * @param {object}settings 初始化参数 {
		 * 			{any}data 数据
		 * }
		 */
		initialize:function(settings){
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
		},
		
		doConfig:function(settingParams){
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
		},
		
		getId:function(){
			
		},
		
		initHtml:function(){
		},
		
		getHtml:function(){
			return this.html;
		},
		
		initListener:function(){
			var that=this;
			//缓存容器
			that.container=that.container||$("#"+that.id);
			var children=that.children;
			for(var i=0,len=children.length;i<len;i++){
				if(children.settings.notListener){
					children.initListener();
				}
			}
		},
		
		find:function(selector){
			return this.container.find(selector);
		},
		
		hide:function(){
			this.container.hide();
		},
		
		destroy:function(){
			this.container.remove();
		}
		
	});
	
})();

