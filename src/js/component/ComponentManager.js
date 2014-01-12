/**
 * 组件管理类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-10
 */
 
$Define("handy.component.ComponentManager", function() {

	var ComponentManager = $HO.createClass(),
	_expando = $H.expando+"_cmp_",             // 组件id前缀
	//存储组件类
	_types={},
	//存储所有组件实例
	_all={};

	// 静态方法
	$HO.extend(ComponentManager, {
		registerType  : fRegisterType,    //注册组件类
		getClass      : fGetClass,        //根据ctype获取组件类
		register      : fRegister,        //注册组件
		unRegister    : fUnRegister,      //注销组件
		destroy       : fDestroy,         //销毁组件，主要用于删除元素时调用
		generateId    : fGenerateId,      //生成组件的id
		get           : fGet              //查找组件
	});
	
	/**
	 * 注册组件类型
	 * @method registerType
	 * @param {string}sType 组件类型
	 * @param {object}oClass 组件类
	 */
	function fRegisterType(sType,oClass){
		_types[sType]=oClass;
		oClass.prototype.ctype=sType;
	}
	/**
	 * 根据ctype获取组件类
	 * @method getClass
	 * @param {string}sType 组件类型
	 * @return {object} 返回对应的组件类
	 */
	function fGetClass(sType){
		return _types[sType];
	}
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
	 * 生成组件的id
	 * @method generateId
	 * @param {string=}sCid 组件的cid
	 * @param {boolean=}bNotChk 仅当为true时不检查id是否重复
	 */
	function fGenerateId(sCid,bNotChk){
		var sId=_expando+(sCid||$H.Util.getUuid());
		if(bNotChk!=true&&_all[sId]){
			$D.error('id重复:'+sId);
		}else{
			return sId;
		}
	}
	/**
	 * 查找组件
	 * @method get
	 * @param {string}sId 组件id或者cid
	 */
	function fGet(sId){
		return _all[sId]||_all[ComponentManager.generateId(sId,true)];
	}

	return ComponentManager;
	
});