/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-12-15										*
*****************************************************************/
/**
 * 历史记录类，用于记录和管理浏览历史
 * @class handy.module.History
 */
$Define("handy.module.History",
['handy.base.Object','handy.base.HashChange'],
function(aDeps){

	var Object=aDeps[0],HashChange=aDeps[1];
	
	var History=Object.createClass();
	
	Object.extend(History.prototype,{
		initialize         : fInitialize,      //历史记录类初始化
		saveState          : fSaveState,       //保存当前状态
		getCurrentState    : fGetCurrentState  //获取当前状态
	});
	/**
	 * 历史记录类初始化
	 * @method initialize
	 * @param {?string} sKey历史记录类的key，用于区分可能的多个history实例
	 */
	function fInitialize(sKey){
		var that=this;
		that.key=sKey||'handy';
		HashChange.listen(function(sHash){
			var oState=JSON.parse(sHash);
			oState.callback.call(oState.param,oState.scope);
		});
	}
	/**
	 * 保存当前状态
	 * @method saveState
	 * @param {object} oState
	 */
	function fSaveState(oState){
		
		HashChange.setHash(JSON.stringify(oState));
	}
	/**
	 * 获取当前状态
	 * @method getCurrentState
	 * @return {object} 返回当前状态
	 */
	function fGetCurrentState(){
		return JSON.parse(HashChange.getHash());
	}
	
	
	return History;
	
});