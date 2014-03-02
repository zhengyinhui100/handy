/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-12-14										*
*****************************************************************/
//handy.module.AbstractModule
$Define("m.AbstractModule","cm.AbstractView",function (AbstractView) {
	/**
	 * 模块基类
	 * 
	 * @class AbstractModule
	 */
	var AbstractModule = $HO.createClass();
	
	$HO.inherit(AbstractModule,AbstractView, {
		
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
		reset          : function(){},   //重置函数, 在该模块里进入该模块时调用
		exit           : function(){return true}   //离开该模块前调用, 返回true允许离开, 否则不允许离开
	});
	
	return AbstractModule;
});