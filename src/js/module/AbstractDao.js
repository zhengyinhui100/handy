/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-01-25										*
*****************************************************************/
/**
 * 数据访问对象抽象类，模块的dao都要继承此类，dao内的方法只可以使用此类的方法进行数据操作，以便进行统一的管理
 */
//handy.module.AbstractDao
$Define('m.AbstractDao',function(){
	
	var AbstractDao=$HO.createClass();
	
	$HO.extend(AbstractDao.prototype,{
		ajax         : fAjax        //ajax方法
	});
	
	/**
	 * ajax
	 * @method
	 * 
	 */
	function fAjax(){
		return ;
	}
	
	return AbstractDao;
	
});