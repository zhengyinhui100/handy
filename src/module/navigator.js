/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-12-20										*
*****************************************************************/

$Define("handy.module.Navigator","handy.base.Object",function (Object) {
	/**
	 * 模块导航效果基类
	 * 
	 * @class ModuleClass
	 */
	var Navigator = Object.createClass();
	
	Object.extend(Navigator.prototype, {
		navigate      : function(){}      //显示导航效果，参数是模块名
	});
	
	return Navigator;
});