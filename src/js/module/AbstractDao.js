/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-01-25										*
*****************************************************************/
/**
 * 数据访问对象抽象类，模块的dao都要继承此类，dao内的方法只可以使用此类的方法进行数据操作，以便进行统一的管理
 */
//handy.module.AbstractDao
$Define('M.AbstractDao',function(){
	
	var AbstractDao=$H.createClass();
	
	$HO.extend(AbstractDao.prototype,{
		ajax         : fAjax,        //ajax方法
		beforeSend   : $H.noop,      //发送前处理
		error        : $H.noop,      //错误处理
		success      : $H.noop       //成功处理
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
		oParams.error=$HF.intercept(me.error,oParams.error);
		oParams.success=$HF.intercept(me.success,oParams.success);
		return $.ajax(oParams);
	}
	
	return AbstractDao;
	
});