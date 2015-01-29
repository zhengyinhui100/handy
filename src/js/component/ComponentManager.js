/**
 * 组件管理类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-10
 */
//"handy.component.ComponentManager"
define("C.ComponentManager", 
[
'B.Class',
'V.AbstractManager',
'V.ViewManager'
],
function(Class,AbstractManager,ViewManager) {

	var ComponentManager = AbstractManager.derive({
		type          : 'component',      //管理类型
		initialize    : fInitialize       //初始化
	});
	/**
	 * 初始化
	 */
	function fInitialize(){
		var me=this;
		var oVm=Class.getSingleton(ViewManager);
		me._types=oVm._types;
		me._all=oVm._all;
	}
	
	//全局快捷别名
	$CM=new ComponentManager();
	
	return ComponentManager;
});