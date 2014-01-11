/**
 * 组件管理类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-10
 */
 
$Define("handy.component.ComponentManager", function() {

	var ComponentManager = $HO.createClass(),
	//存储所有组件实例
	_all={};

	// 静态方法
	$HO.extend(ComponentManager, {
		register      : fRegister,        //注册组件
		unRegister    : fUnRegister,      //注销组件
		destroy       : fDestroy,         //销毁组件，主要用于删除元素时调用
		get           : fGet              //查找组件
	});
	
	/**
	 * 注册组件
	 * @method register
	 * @param {object}oComponent 组件对象
	 */
	function fRegister(oComponent){
		_all[oComponent.getId()]=oComponent;
	}
	/**
	 * 注销组件
	 * @method unRegister
	 * @param {object}oComponent 组件对象
	 */
	function fUnRegister(oComponent){
		delete _all[oComponent.getId()];
	}
	/**
	 * 销毁组件，主要用于删除元素时调用
	 * @method destroy
	 * @param 
	 */
	function fDestroy(){
	}
	/**
	 * 查找组件
	 * @method get
	 * @param {string}sId 组件id
	 */
	function fGet(sId){
		return _all[sId];
	}

	return ComponentManager;
	
});