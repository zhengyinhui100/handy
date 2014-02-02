/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-12-14										*
*****************************************************************/
//handy.module.AbstractModule
$Define("m.AbstractModule","handy.base.Object",function (Object) {
	/**
	 * 模块基类
	 * 
	 * @class AbstractModule
	 */
	var AbstractModule = Object.createClass();
	
	Object.extend(AbstractModule.prototype, {
		
//		_container     : null,           //{jQuery}模块的容器对象
//		isLoaded       : false,          //{boolean}模块是否已载入
//		isActived      : false,          //{boolean}模块是否是当前活跃的
//		renderTo       : null,           //自定义模块容器，{jQuery}对象或选择器
		                                 //模块初始化后以_container为准，获取需用getEl方法
		useCache       : true,           //{boolean}是否使用cache
//		name           : null,           //{string}模块名
//		chName         : null,           //{string}模块的中文名称
		
//		getData        : null,           //{function()}获取该模块的初始化数据
//		clone          : null,           //{function()}克隆接口
		cache          : function(){},   //显示模块缓存
		init           : function(){},   //初始化函数, 在模块创建后调用（在所有模块动作之前）
		beforeRender   : function(){},   //模块渲染前调用
		render         : function(){},   //模块渲染
		afterRender    : function(){},   //模块渲染后调用
		reset          : function(){},   //重置函数, 在该模块里进入该模块时调用
		exit           : function(){return true},   //离开该模块前调用, 返回true允许离开, 否则不允许离开
		destroy        : function(){},   //模块销毁
		initialize     : fInitialize,    //模块类创建时初始化
		getHtml        : fGetHtml,       //获取该模块的html
		getEl          : fGetEl          //获取模块的容器节点
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
	/**
	 * 获取模块的容器节点
	 * @method getEl
	 */
	function fGetEl(){
		return this._container;
	}
	
	return AbstractModule;
});