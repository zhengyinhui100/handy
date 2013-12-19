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
function(Object,HashChange){

	var History=Object.createClass();
	
	var _nIndex=0;
	
	Object.extend(History.prototype,{
		initialize         : fInitialize,      //历史记录类初始化
		saveState          : fSaveState,       //保存当前状态
		getCurrentState    : fGetCurrentState, //获取当前状态
		stateChange        : fStateChange      //历史状态改变
	});
	/**
	 * 历史记录类初始化
	 * @method initialize
	 * @param {?string} sKey历史记录类的key，用于区分可能的多个history实例
	 */
	function fInitialize(sKey){
		var that=this;
		that.key=sKey||'handy';
		that.states=[];
		HashChange.listen(that.stateChange.bind(that));
	}
	/**
	 * 历史状态改变
	 * @method stateChange
	 */
	function fStateChange(){
		var that=this;
		var oState=that.getCurrentState();
		if(oState){
			oState.onStateChange(oState.param);
		}
	}
	/**
	 * 保存当前状态
	 * @method saveState
	 * @param {object} oState{
	 * 				{object}param            : 进入模块的参数
	 * 				{function}onStateChange  : 历史状态变化时的回调函数
	 * 	}
	 */
	function fSaveState(oState){
		var that=this;
		var sHistoryKey=that.key+(++_nIndex);
		that.states.push(sHistoryKey);
		that.states[sHistoryKey]=oState;
		var oHashParam={
			hKey    : sHistoryKey,
			param : oState.param
		};
		HashChange.setHash("#"+JSON.stringify(oHashParam));
	}
	/**
	 * 获取当前状态
	 * @method getCurrentState
	 * @return {object} 返回当前状态
	 */
	function fGetCurrentState(){
		var that=this;
		try{
			var oHashParam=JSON.parse(HashChange.getHash().replace("#",""));
			return that.states[oHashParam.hKey];
		}catch(e){
			$H.Debug.warn("History.getCurrentState:parse hash error:"+e.message);
		}
	}
	
	
	return History;
	
});