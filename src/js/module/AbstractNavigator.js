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
		/**
		 * 导航效果
		 * @param {Object}oShowMod  当前要进入到模块
		 * @param {Object}oHideMod 要离开的模块
		 * @param {Object}oModManager 模块管理对象
		 * @param {boolean}bIsOut 是否是退出模块操作（返回父模块）
		 * @return {boolean=} 返回false屏蔽默认的模块切换动作
		 */
		navigate      : $H.noop      
	});
	
	return AbstractNavigator;
});