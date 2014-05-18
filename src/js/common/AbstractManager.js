/**
 * 视图管理类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-10
 */
//"handy.common.AbstractManager"
$Define("CM.AbstractManager", function() {

	var AbstractManager = $H.createClass();
	
	$H.extend(AbstractManager.prototype, {
	    _types        : {},               //存储类
	    _all          : {},               //存储所有实例
		type          : 'manager',        //被管理对象的类型，也用于生成标记被管理对象的class
		registerType  : fRegisterType,    //注册视图类
		getClass      : fGetClass,        //根据xtype获取视图类
		register      : fRegister,        //注册视图
		unregister    : fUnRegister,      //注销视图
		eachInEl      : fEachInEl,        //循环指定节点里的被管理对象
		generateId    : fGenerateId,      //生成视图的id
		get           : fGet              //根据id或cid查找视图
	});
	
	/**
	 * 注册视图类型
	 * @method registerType
	 * @param {string}sXType 视图类型
	 * @param {object}oClass 视图类
	 */
	function fRegisterType(sXtype,oClass){
		var me=this;
		me._types[sXtype]=oClass;
		oClass.prototype.xtype=sXtype;
	}
	/**
	 * 根据xtype获取视图类
	 * @method getClass
	 * @param {string|Class}xtype 视图类型或命名空间或视图类
	 * @return {object} 返回对应的视图类
	 */
	function fGetClass(xtype){
		if($H.isClass(xtype)){
			return xtype;
		}
		return this._types[xtype]||$H.ns(xtype);
	}
	/**
	 * 注册视图
	 * @method register
	 * @param {object}oView 视图对象
	 */
	function fRegister(oView,oParams){
		var me=this;
		var sCid=oView.cid=oParams.cid||$H.uuid();
		var sId=oView._id=me.generateId(sCid);
		me._all[sId]=oView;
	}
	/**
	 * 注销视图
	 * @method unRegister
	 * @param {object}oView 视图对象
	 */
	function fUnRegister(oView){
		var oAll=this._all;
		var sId=oView.getId();
		//执行update时，如果id没有改变，这里不需要删除，因为已经新对象被覆盖了
		if(oAll[sId]==oView){
			delete oAll[sId];
		}
	}
	/**
	 * 遍历指定节点里的所有视图
	 * @method eachInEl
	 * @param {jQuery}oEl 指定的节点
	 * @param {function(Component)}fCall
	 */
	function fEachInEl(oEl,fCall){
		var me=this;
		//获取视图el
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
	 * 生成视图的id
	 * @method generateId
	 * @param {string=}sCid cid
	 * @param {boolean=}bNotChk 仅当为true时不检查id是否重复
	 */
	function fGenerateId(sCid,bNotChk){
		var me=this;
		var sId=$H.expando+"_"+me.type+"_"+(sCid||$H.uuid());
		if(bNotChk!=true&&me._all[sId]){
			$D.error('id重复:'+sId);
		}else{
			return sId;
		}
	}
	/**
	 * 根据id或cid查找视图
	 * @method get
	 * @param {string}sId 视图id或者cid
	 */
	function fGet(sId){
		var me=this;
		var all=me._all;
		return all[sId]||all[me.generateId(sId,true)];
	}

	return AbstractManager;
	
});