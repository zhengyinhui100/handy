/**
 * 组件管理类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-10
 */
//"handy.component.ComponentManager"
$Define("CM.AbstractManager", function() {

	var AbstractManager = $HO.createClass();
	
	$HO.extend(AbstractManager.prototype, {
	    _types        : {},               //存储类
	    _all          : {},               //存储所有实例
		type          : 'manager',        //被管理对象的类型，也用于生成标记被管理对象的class
		registerType  : fRegisterType,    //注册组件类
		getClass      : fGetClass,        //根据xtype获取组件类
		register      : fRegister,        //注册组件
		unregister    : fUnRegister,      //注销组件
		eachInEl      : fEachInEl,        //循环指定节点里的被管理对象
		generateId    : fGenerateId,      //生成组件的id
		get           : fGet              //根据id或cid查找组件
	});
	
	/**
	 * 注册组件类型
	 * @method registerType
	 * @param {string}sXType 组件类型
	 * @param {object}oClass 组件类
	 */
	function fRegisterType(sXtype,oClass){
		this._types[sXtype]=oClass;
		oClass.prototype.xtype=sXtype;
		//快捷别名
		$C[sXtype]=oClass;
	}
	/**
	 * 根据xtype获取组件类
	 * @method getClass
	 * @param {string}sXType 组件类型
	 * @return {object} 返回对应的组件类
	 */
	function fGetClass(sXtype){
		return this._types[sXtype];
	}
	/**
	 * 注册组件
	 * @method register
	 * @param {object}oComponent 组件对象
	 */
	function fRegister(oComponent){
		this._all[oComponent.getId()]=oComponent;
	}
	/**
	 * 注销组件
	 * @method unRegister
	 * @param {object}oComponent 组件对象
	 */
	function fUnRegister(oComponent){
		delete this._all[oComponent.getId()];
	}
	/**
	 * 遍历指定节点里的所有组件
	 * @method eachInEl
	 * @param {jQuery}oEl 指定的节点
	 * @param {function(Component)}fCall
	 */
	function fEachInEl(oEl,fCall){
		var me=this;
		//获取组件el
		var oItemEl=oEl.find(".js-"+me.type);
		oItemEl.each(function(i,oEl){
			oEl=$(oEl);
			var sId=oEl.attr('id');
			var oItem=me.get(sId);
			//如果未被销毁，执行回调
			if(oItem){
				fCall(oItem);
			}
		})
	}
	/**
	 * 生成组件的id
	 * @method generateId
	 * @param {string=}sCid cid
	 * @param {boolean=}bNotChk 仅当为true时不检查id是否重复
	 */
	function fGenerateId(sCid,bNotChk){
		var me=this;
		var sId=$H.expando+"_"+me.type+"_"+(sCid||$H.Util.getUuid());
		if(bNotChk!=true&&me._all[sId]){
			$D.error('id重复:'+sId);
		}else{
			return sId;
		}
	}
	/**
	 * 根据id或cid查找组件
	 * @method get
	 * @param {string}sId 组件id或者cid
	 */
	function fGet(sId){
		var me=this;
		var all=me._all;
		return all[sId]||all[me.generateId(sId,true)];
	}

	return AbstractManager;
	
});