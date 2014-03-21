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
		ajax         : fAjax,        //ajax方法
		beforeSend   : $H.noop,      //发送前处理
		error        : $H.noop,      //错误处理
		success      : $H.noop,      //成功处理
		get          : fGet,         //获取数据
		set          : fSet,         //设置数据
		remove       : fRemove,      //删除数据
		sync         : fSync         //同步数据
	});
	
	/**
	 * ajax
	 * @method ajax
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
	 * @param {Object}oOptions 选项{
	 * 		{string=}method:操作方法(get/set/remove)，默认是get,
	 * 		{string=}type:存储类型(local/remote),默认是remote
	 * 		{*=}data:数据，
	 * 		{Object}param:参数
	 * }
	 * @return {*} 如果是get操作，返回指定的数据
	 */
	function fSync(oOptions){
		var me=this;
		oOptions=oOptions||{};
		var sMethod=oOptions.method||'get';
		var sType=oOptions.type||'remote';
		var oParam=oOptions.param;
		if(sType=='remote'){
			me.ajax(oParam);
		}else{
			LS[sType+'Item'](oParam);
		}
	}
	
	return AbstractDao;
	
});