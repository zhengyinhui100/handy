/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-01-25										*
*****************************************************************/
/**
 * 数据访问对象抽象类，模块的dao都要继承此类，dao内的方法只可以使用此类的方法进行数据操作，以便进行统一的管理
 */
//handy.common.AbstractDao
$Define('CM.AbstractDao',
'B.LocalStorage',
function(LS){
	
	var AbstractDao=$H.createClass();
	
	$H.extend(AbstractDao.prototype,{
		_ajaxMethodMap   : {
			'create': 'POST',
			'update': 'POST',
			'patch':  'PATCH',
			'delete': 'DELETE',
			'read':   'GET'
	    },
	    _localMethodMap  : {
	    	'create': 'setItem',
			'update': 'setItem',
			'patch':  'setItem',
			'delete': 'removeItem',
			'read':   'getItem'
	    },
		ajax             : fAjax,        //ajax方法
		beforeSend       : $H.noop,      //发送前处理
		error            : $H.noop,      //错误处理
		success          : $H.noop,      //成功处理
		get              : fGet,         //获取数据
		set              : fSet,         //设置数据
		remove           : fRemove,      //删除数据
		sync             : fSync         //同步数据
	});
	
	/**
	 * ajax
	 * @param {Object}oParams
	 * 
	 */
	function fAjax(oParams){
		var me=this;
		me.beforeSend(oParams);
		oParams.error=$H.intercept(me.error,oParams.error);
		oParams.success=$H.intercept(me.success,oParams.success);
		return $.ajax(oParams);
	}
	/**
	 * 获取数据
	 */
	function fGet(){
	}
	/**
	 * 设置数据
	 */
	function fSet(){
	}
	/**
	 * 删除数据
	 */
	function fRemove(){
	}
	/**
	 * 同步数据
	 * @param {string}sMethod 操作方法(read/update/delete/create/patch）
	 * @param {Model|Collection}oModel 参数模型或集合对象
	 * @param {Object}oOptions 选项{
	 * 		{string=}storeType:存储类型(local/remote),默认是remote
	 * 		{string=}data:要同步的数据
	 * 		{Object=}attrs:要同步的键值对
	 * }
	 * @return {*} 如果是get操作，返回指定的数据
	 */
	function fSync(sMethod, oModel, oOptions){
		var me=this;
		oOptions=oOptions||{};
		var sToreType=oOptions.storeType||'remote';
		//ajax请求参数
		var oParam={type: 'POST'||me._ajaxMethodMap[sMethod], dataType: 'json'};
		if(!oOptions.url){
		    oParam.url =oModel.getUrl();
		}
	    if (oOptions.data == null && oModel && (sMethod === 'create' || sMethod === 'update' || sMethod === 'patch')) {
	        //oParam.contentType = 'application/json';
	        oParam.data = oOptions.attrs || oModel.toJSON(oOptions);
	    }
	    
		if(sToreType=='remote'){
			//服务端存储
			if(sMethod=='update'){
				sMethod='patch';
			}
			oParam.url+='/'+sMethod+'.do';
			$H.extend(oParam,oOptions);
			me.ajax(oParam);
		}else{
			//本地存储
			LS[me._localMethodMap[sMethod]](oParam);
		}
		oModel.trigger('request', oModel, oOptions);
	}
	
	return AbstractDao;
	
});