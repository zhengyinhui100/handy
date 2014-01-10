/**
 * 组件管理类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-10
 */
 
$Define("handy.component.ComponentManager", function() {

	var ComponentManager = $HO.createClass();

	// 静态方法
	$HO.extend(ComponentManager, {
			register      : fRegister,        //注册组件
			unRegister    : fUnRegister,      //注销组件
			get           : fGet              //查找组件
	});
	
	/**
	 * 注册组件
	 * @method register
	 * @param 
	 */
	function fRegister(){
	}
	/**
	 * 注销组件
	 * @method unRegister
	 * @param 
	 */
	function fUnRegister(){
	}
	/**
	 * 查找组件
	 * @method get
	 * @param 
	 */
	function fGet(){
	}

	return ComponentManager;
	
});