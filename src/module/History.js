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
'handy.base.HashChange',
function(HashChange){

	var History=$HO.createClass();
	
	var _nIndex=0;
	
	$HO.extend(History.prototype,{
		initialize         : fInitialize,      //历史记录类初始化
		stateChange        : fStateChange,     //历史状态改变
		saveState          : fSaveState,       //保存当前状态
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
		var that=this;
		that.key=sKey||'handy';
		that.states=[];
		//TODO 由于jQuery mobile bug，设置hashListeningEnabled无效，所以这里暂时使用jqm的hashchange
		//HashChange.listen($H.Function.bind(that.stateChange,that));
		$(window).hashchange($H.Function.bind(that.stateChange,that));
	}
	/**
	 * 历史状态改变
	 * @method stateChange
	 */
	function fStateChange(){
		var that=this;
		var oState=that.getCurrentState();
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
		var that=this;
		var sHistoryKey=that.key+(++_nIndex);
		that.states.push(sHistoryKey);
		that.states[sHistoryKey]=oState;
		var oHashParam={
			hKey    : sHistoryKey,
			param : oState.param
		};
		$HU.setHash("#"+JSON.stringify(oHashParam));
	}
	/**
	 * 获取当前状态
	 * @method getCurrentState
	 * @return {object} 返回当前状态
	 */
	function fGetCurrentState(){
		var that=this;
		try{
			var oHashParam=JSON.parse($HU.getHash().replace("#",""));
			return that.states[oHashParam.hKey];
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
		var that=this;
		try{
			var oHashParam=JSON.parse($HU.getHash().replace("#",""));
			var sHKey=oHashParam.hKey;
			var aStates=that.states;
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
		var that=this;
		var oState=that.getPreState();
		if(oState){
			oState.onStateChange(oState.param);
		}
	}
	
	return History;
	
});