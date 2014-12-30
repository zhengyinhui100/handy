/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-12-20										*
*****************************************************************/
//handy.module.AbstractNavigator
define("M.AbstractNavigator",["B.Object",'B.Class'],function (Obj,Class) {
	/**
	 * 模块导航效果基类
	 * 
	 * @class AbstractNavigator
	 */
	var AbstractNavigator = Class.createClass();
	
	Obj.extend(AbstractNavigator.prototype, {
		navigate      : function(){}      //显示导航效果，参数是当前进入的模块实例和模块管理类实例，此方法返回true表示不需要模块管理类的导航功能
	});
	
	return AbstractNavigator;
});