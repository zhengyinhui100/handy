/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-12-15										*
*****************************************************************/
/**
 * 历史记录类，用于记录和管理浏览历史
 * @class handy.module.History
 */
$Define("handy.module.History",function(){

	var History=$HO.createClass();
	
	$HO.extend(History.prototype,{
		initialize         : fInitialize      //历史记录类初始化
		
	});
	/**
	 * 历史记录类初始化
	 */
	function fInitialize(){
		
	}
	
	return History;
	
})