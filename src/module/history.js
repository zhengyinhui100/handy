/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-12-15										*
*****************************************************************/
/**
 * 历史记录类，用于记录和管理浏览历史
 * @class handy.module.History
 */
$Define("handy.module.History",'handy.base.HashChange',function($H){

	var History=$HO.createClass();
	
	$HO.extend(History.prototype,{
		initialize         : fInitialize,      //历史记录类初始化
		saveState          : fSaveState,       //
		getCurrentState    : fGetCurrentState  //
		
	});
	/**
	 * 历史记录类初始化
	 */
	function fInitialize(sKey){
		var that=this;
		that.key=sKey||'';
	}
	
	return History;
	
})