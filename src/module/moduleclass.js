/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-12-14										*
*****************************************************************/

$Define("handy.module.ModuleClass",function () {
	/**
	 * 模块基类
	 * 
	 * @class ModuleClass
	 */
	var ModuleClass = $HO.createClass();
	
	Object.extend(ModuleClass.prototype, {
		isLoaded       : false,          //模块是否已载入
		isActived      : false,          //模块是否是当前活跃的
		//container    : null,           //模块的容器对象
		useCache       : true,           //是否使用cache
		//name         : null,           //模块名
		//chName       : null,           //模块的中文名称
		//getData      : null,           //获取该模块的初始化数据
		//clone        : null,           //克隆接口
		//getHtml      : null,           //获取该模块的html
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
	
	return ModuleClass;
});