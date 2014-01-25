/****************************************************************
* Author:		郑银辉											*
* Email:		zhengyinhui100@gmail.com						*
* Created:		2013-12-15										*
*****************************************************************/
/**
 * 历史记录类，用于记录和管理浏览历史
 * @class handy.module.History
 */
//handy.module.History
$Define("m.History",
'handy.base.HashChange',
function(HashChange){

	var History=$HO.createClass();
	
	var _nIndex=0;
	
	$HO.extend(History.prototype,{
		initialize         : fInitialize,      //历史记录类初始化
		stateChange        : fStateChange,     //历史状态改变
		saveState          : fSaveState,       //保存当前状态
		getHashParam       : fGetHashParam,    //获取当前hash参数
		getCurrentState    : fGetCurrentState, //获取当前状态
		getPreState        : fGetPreState,     //获取前一个状态
		back               : fBack             //后退一步
	});
	/**
	 * 历史记录类初始化
	 * @method initialize
	 * @param {?string} sKey历史记录类的key，用于区分可能的多个history实例
	 */
	function fInitialize(sKey){
		var me=this;
		me.key=sKey||'handy';
		me.states=[];
		HashChange.listen($H.Function.bind(me.stateChange,me));
	}
	/**
	 * 历史状态改变
	 * @method stateChange
	 */
	function fStateChange(){
		var me=this;
		var oHashParam=me.getHashParam();
		var sKey=oHashParam.hKey;
		var aStates=me.states;
		//跟当前状态一致，不需要调用stateChange，可能是saveState触发的hashchange
		if(sKey==aStates[aStates.length-1]){
			//return;
		}
		var oState=aStates[sKey];
		if(oState){
			oState.onStateChange(oState.param,true);
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
		var me=this;
		var sHistoryKey=me.key+(++_nIndex);
		me.states.push(sHistoryKey);
		me.states[sHistoryKey]=oState;
		var oHashParam={
			hKey    : sHistoryKey,
			param : oState.param
		};
		$HU.setHash("#"+JSON.stringify(oHashParam));
	}
	/**
	 * 获取当前hash参数
	 * @method getHashParam
	 * @return {object} 返回当前hash参数
	 */
	function fGetHashParam(){
		var me=this;
		try{
			var sHash=$HU.getHash().replace("#","");
			var oHashParam=JSON.parse(sHash);
			return oHashParam;
		}catch(e){
			$H.Debug.warn("History.getCurrentState:parse hash error:"+e.message);
		}
	}
	/**
	 * 获取当前状态
	 * @method getCurrentState
	 * @return {object} 返回当前状态
	 */
	function fGetCurrentState(){
		var me=this;
		try{
			var oHashParam=me.getHashParam();
			return me.states[oHashParam.hKey];
		}catch(e){
			$H.Debug.warn("History.getCurrentState:parse hash error:"+e.message);
		}
	}
	/**
	 * 获取前一个状态
	 * @method getPreState
	 * @return {object} 返回前一个状态
	 */
	function fGetPreState(){
		var me=this;
		try{
			var oHashParam=JSON.parse($HU.getHash().replace("#",""));
			var sHKey=oHashParam.hKey;
			var aStates=me.states;
			var nLen=aStates.length;
			for(var i=0;i++;i<nLen){
				if(aStates[i]==sHKey){
					return i>0?aStates[aStates[--i]]:null;
				}
			}
		}catch(e){
			$H.Debug.error("History.getPreState error:"+e.message);
		}
	}
	/**
	 * 后退一步
	 * @method back
	 */
	function fBack(){
		var me=this;
		var oState=me.getPreState();
		if(oState){
			oState.onStateChange(oState.param);
		}
	}
	
	return History;
	
});