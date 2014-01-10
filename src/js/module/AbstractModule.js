/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-12-14										*
*****************************************************************/

$Define("handy.module.AbstractModule","handy.base.Object",function (Object) {
	/**
	 * 模块基类
	 * 
	 * @class AbstractModule
	 */
	var AbstractModule = Object.createClass();
	
	Object.extend(AbstractModule.prototype, {
		isLoaded       : false,          //{boolean}模块是否已载入
		isActived      : false,          //{boolean}模块是否是当前活跃的
		//container    : null,           //{jQuery}模块的容器对象
		useCache       : true,           //{boolean}是否使用cache
		//name         : null,           //{string}模块名
		//chName       : null,           //{string}模块的中文名称
		//getData      : null,           //{function()}获取该模块的初始化数据
		//clone        : null,           //{function()}克隆接口
		//getHtml      : null,           //{function():string}获取该模块的html
		cache          : function(){},   //显示模块缓存
		init           : function(){},   //初始化函数, 在模块创建后调用（在所有模块动作之前）
		beforeRender   : function(){},   //模块渲染前调用
		render         : function(){},   //模块渲染
		afterRender    : function(){},   //模块渲染后调用
		reset          : function(){},   //重置函数, 在该模块里进入该模块时调用
		exit           : function(){return true},   //离开该模块前调用, 返回true允许离开, 否则不允许离开
		initialize     : fInitialize     //模块类创建时初始化
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
	
	return AbstractModule;
});