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
$Define("M.History",
['handy.base.HashChange',
'B.Class'],
function(HashChange){

	var History=$H.createClass();
	
	var _nIndex=0;
	
	$H.extend(History.prototype,{
		initialize         : fInitialize,      //历史记录类初始化
		stateChange        : fStateChange,     //历史状态改变
		saveState          : fSaveState,       //保存当前状态
		saveHash           : fSaveHash,        //保存参数到hash
		getHashParam       : fGetHashParam,    //获取当前hash参数
		getCurrentState    : fGetCurrentState, //获取当前状态
		getPreState        : fGetPreState,     //获取前一个状态
		back               : fBack,            //后退一步
		getSafeUrl         : fGetSafeUrl       //获取安全的url(hash有可能被分享组件等截断，所以转化为query:retPage=?)
	});
	/**
	 * 历史记录类初始化
	 * @method initialize
	 * @param {string=}sKey 历史记录类的key，用于区分可能的多个history实例
	 * @param {function=}fError 错误处理函数
	 */
	function fInitialize(sKey,fError){
		var me=this;
		if(typeof sKey=="function"){
			fError=sKey;
			sKey=null;
		}
		me.error=fError||$H.noop;
		me.key=sKey||'handy';
		me.states=[];
		HashChange.listen($H.Function.bind(me.stateChange,me));
	}
	/**
	 * 历史状态改变
	 * @method stateChange
	 */
	function fStateChange(){
		var me=this,oHashParam=me.getHashParam();
		if(!oHashParam){
			return;
		}
		var sKey=oHashParam.hKey,
		 	sCurKey=me.currentKey,
		 	aStates=me.states,
		 	oCurState=aStates[sCurKey];
		//跟当前状态一致，不需要调用stateChange，可能是saveState触发的hashchange
		//&&$H.equals(oHashParam.param,oCurState.param)
		if(sKey==sCurKey){
			return false;
		}
		var oState=aStates[sKey];
		//监听全局hisoryChange，返回false可阻止当前变化
		var bResult=$H.trigger('hisoryChange',oState,oCurState);
		if(bResult!==false){
			if(oState){
				bResult=oState.onStateChange(oState.param,true);
			}else{
				$D.warn("hisory state not found");
				bResult=me.error('stateNotFound',oHashParam);
			}
		}
		//如果调用不成功，则恢复原先的hashstate
		if(bResult===false){
			var oParam=oCurState.param;
			oHashParam=$H.extend({
				hKey    : sCurKey
			},oParam);
			me.saveHash(oHashParam);
		}else{
			//改变当前hkey
			me.currentKey=sKey;
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
		var sHistoryKey=me.currentKey=me.key+(++_nIndex);
		me.states.push(sHistoryKey);
		me.states[sHistoryKey]=oState;
		var oParam=oState.param;
		var oHashParam=$H.extend({
			hKey    : sHistoryKey
		},oParam);
		me.saveHash(oHashParam);
	}
	/**
	 * 保存状态值到hash中
	 * @method saveHash
	 * @param {*}param 要保存到hash中的参数
	 */
	function fSaveHash(param){
		//这里主动设置之后还会触发hashchange，不能在hashchange里添加set方法屏蔽此次change，因为可能不止一个地方需要hashchange事件
		//TODO:单页面应用SEO：http://isux.tencent.com/seo-for-single-page-applications.html
		$H.setHashParam(null,param);
	}
	/**
	 * 获取当前hash参数
	 * @method getHashParam
	 * @return {object} 返回当前hash参数
	 */
	function fGetHashParam(){
		return $H.getHashParam();
	}
	/**
	 * 获取当前状态
	 * @method getCurrentState
	 * @return {object} 返回当前状态
	 */
	function fGetCurrentState(){
		var me=this;
		//获取url模块参数，hash优先级高于query中retPage
		var oUrlParam=$H.getHashParam();
		if($H.isEmpty(oUrlParam)){
			var sRetPage=$H.getQueryParam(null,'retPage');
			try {
				oUrlParam=$H.parseJson(decodeURIComponent(sRetPage));
			} catch (e) {
				$D.warn("parse retPage param from hash error:"
						+ e.message);
			}
		}
		return me.states&&me.states[oUrlParam.hKey]||oUrlParam;
	}
	/**
	 * 获取前一个状态
	 * @method getPreState
	 * @return {object} 返回前一个状态
	 */
	function fGetPreState(){
		var me=this;
		try{
			var oHashParam=me.getHashParam();
			var sHKey=oHashParam.hKey;
			var aStates=me.states;
			var nLen=aStates.length;
			for(var i=1;i<nLen;i++){
				if(aStates[i]==sHKey){
					return i>0?aStates[aStates[--i]]:null;
				}
			}
		}catch(e){
			$H.Debug.error("History.getPreState error:"+e.message,e);
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
	/**
	 * 获取安全的url(hash有可能被分享组件等截断，所以转化为query:retPage=?)
	 * @return {string} 返回安全的url
	 */
	function fGetSafeUrl(){
		var oHashParam=$H.getHashParam();
		delete oHashParam.hKey;
		var oParam={
			retPage:encodeURIComponent($H.stringify(oHashParam))
		}
		var sUrl=$H.setQueryParam(location.href,oParam);
		return sUrl;
	}
	
	return History;
	
});