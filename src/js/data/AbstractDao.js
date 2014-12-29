/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2014-01-25										*
*****************************************************************/
/**
 * 数据访问对象抽象类，模块的dao都要继承此类，dao内的方法只可以使用此类的方法进行数据操作，以便进行统一的管理
 */
//handy.data.AbstractDao
define('D.AbstractDao',
[
'B.LocalStorage',
'B.Class'
],
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
		parseParam       : $H.noop,      //预处理请求参数
		beforeSend       : fBeforeSend,  //发送前处理
		complete         : fComplete,    //发送完处理
		error            : $H.noop,      //错误处理
		success          : $H.noop,      //成功处理
		showLoading      : $H.noop,      //显示/隐藏loading提示
		get              : fGet,         //获取数据
		set              : fSet,         //设置数据
		remove           : fRemove,      //删除数据
		sync             : fSync         //同步数据
	});
	
	/**
	 * 发送ajax请求，这里回调函数的设计师为了方便统一处理公共的逻辑，比如登录超时等，同时又能保证各模块能够自行处理回调而避开公共处理逻辑
	 * @param {Object}oParams{
	 * 			{function=}beforeSucc 成功回调函数，在公共this.success方法前执行，若beforeSucc返回false则不继续执行this.success方法
	 * 			{function=}success 成功回调函数，在公共this.success方法后执行，如果公共方法已经作出了处理并返回false，则此方法不执行
	 * 			{function=}beforeErr 执行机制类似beforeSucc
	 * 			{function=}error 执行机制类似success
	 * }
	 * 
	 */
	function fAjax(oParams){
		var me=this;
		//处理参数
		oParams=me.parseParam(oParams);
		//包装回调函数
		var fError=$H.intercept(oParams.error,me.error);
		oParams.error=$H.intercept(fError,oParams.beforeErr);
		var fSucc=$H.intercept(oParams.success,me.success);
		oParams.success=$H.intercept(fSucc,oParams.beforeSucc);
		oParams.beforeSend=$H.intercept($H.bind(me.beforeSend,me,oParams),oParams.beforeSend);
		oParams.complete=$H.intercept($H.bind(me.complete,me,oParams),oParams.complete);
		return $.ajax(oParams);
	}
	/**
	 * 发送前处理
	 */
	function fBeforeSend(oParams){
		this.showLoading(true,oParams);
	}
	/**
	 * 发送完处理
	 */
	function fComplete(oParams){
		this.showLoading(false,oParams);
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
		var sStoreType=oOptions.storeType||'remote';
		//ajax请求参数
		var oParam={type: 'POST'||me._ajaxMethodMap[sMethod], dataType: 'json'};
		if(!oOptions.url){
		    oParam.url =oModel.getUrl();
		}
	    if (oOptions.data == null && oModel && (sMethod === 'create' || sMethod === 'update' || sMethod === 'patch')) {
	        //oParam.contentType = 'application/json';
	        oParam.data = oOptions.attrs || oModel.toJSON(oOptions);
	    }
	    var result;
		if(sStoreType=='remote'){
			//服务端存储
			oParam.url+='/'+sMethod+'.do';
			$H.extend(oParam,oOptions);
			result=me.ajax(oParam);
		}else{
			//本地存储
			result=LS[me._localMethodMap[sMethod]](oParam);
		}
		oModel.trigger('request', oModel, oOptions);
		return result;
	}
	
	return AbstractDao;
	
});