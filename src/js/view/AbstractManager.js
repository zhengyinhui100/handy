/**
 * 视图管理类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-10
 */
//"handy.view.AbstractManager"
define("V.AbstractManager", 
[
'B.Class',
'B.Object',
'B.Util'
],
function(Class,Obj,Util) {

	var AbstractManager = Class.createClass();
	
	Obj.extend(AbstractManager.prototype, {
//	    _types        : {},               //存储类
//	    _all          : {},               //存储所有实例
	    initialize    : fInitialize,      //初始化
		type          : 'manager',        //被管理对象的类型，也用于生成标记被管理对象的class
		registerType  : fRegisterType,    //注册视图类
		getClass      : fGetClass,        //根据xtype获取视图类
		register      : fRegister,        //注册视图
		unregister    : fUnRegister,      //注销视图
		eachInEl      : fEachInEl,        //循环指定节点里的被管理对象
		generateId    : fGenerateId,      //生成视图的id
		get           : fGet,             //根据id或cid查找视图
		find          : fFind             //查找视图
	});
	/**
	 * 初始化
	 */
	function fInitialize(){
		var me=this;
		me._types={};
		me._all={};
		me._allForCid={};
	}
	/**
	 * 注册视图类型
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
	 * @param {string|Class}xtype 视图类型或命名空间或视图类
	 * @return {object} 返回对应的视图类
	 */
	function fGetClass(xtype){
		if(Obj.isClass(xtype)){
			return xtype;
		}
		return this._types[xtype]||$H.ns(xtype);
	}
	/**
	 * 注册视图
	 * @param {object}oView 视图对象
	 */
	function fRegister(oView,oParams){
		var me=this;
		var sCid=oView.cid=oParams.cid||Util.uuid();
		var sId=oView._id=me.generateId(sCid,oView.xtype);
		me._all[sId]=oView;
		me._allForCid[sCid]=oView;
	}
	/**
	 * 注销视图
	 * @param {object}oView 视图对象
	 */
	function fUnRegister(oView){
		var oAll=this._all;
		var sId=oView.getId();
		var sCid=oView.getCid();
		//执行update时，如果id没有改变，这里不需要删除，因为已经新对象被覆盖了
		if(oAll[sId]==oView){
			delete oAll[sId];
		}
		var oCids=this._allForCid;
		if(oCids[sCid]==oView){
			delete oCids[sCid];
		}
	}
	/**
	 * 遍历指定节点里的所有视图
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
	 * @param {string=}sCid cid
	 * @param {string}sType 视图xtype
	 */
	function fGenerateId(sCid,sType){
		var me=this;
		var sId=$H.expando+"-"+me.type+"-"+sType+'-'+(sCid||Util.uuid());
		if(me._all[sId]){
			$D.error('id重复:'+sId);
		}else{
			return sId;
		}
	}
	/**
	 * 根据id或cid查找视图
	 * @param {string}sId 视图id或者cid
	 * @return {View} 返回找到的视图
	 */
	function fGet(sId){
		var me=this;
		return me._all[sId]||me._allForCid[sId];
	}
	/**
	 * 查找视图
	 * @param {string}sQuery
	 * @return {array} 返回匹配的结果数组
	 */
	function fFind(sQuery){
		var me=this;
		var all=me._all;
		var r=[];
		for(var id in all){
			var oView=all[id];
			if(!oView.parent){
				if(oView.match(sQuery)){
					r.push(oView);
				}
				var tmp=oView.find(sQuery);
				if(tmp.length>0){
					r=r.concat(tmp);
				}
			}
		};
		return r;
	}

	return AbstractManager;
	
});