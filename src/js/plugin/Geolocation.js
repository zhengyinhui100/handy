/**
 * PhonegapPlugin模块，提供phonegap功能
 * 
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2013-12-25
 */

//var position = {
//	"coords" : {
//		"latitude" : 23.05027,
//		"longitude" : 113.404926,
//		"accuracy" : 27.5,
//		"altitude" : null,
//		"heading" : null,
//		"speed" : 0,
//		"altitudeAccuracy" : null
//	},
//	"timestamp" : "2013-12-25T17:18:18.663Z"
//}

$Define("P.Geolocation", 
'C.Tips',
function(Tips) {

	var Geolocation = {
		getCurrentPosition     : fGetCurrentPosition,     //获取当前位置
		onSuccess              : fOnSuccess,              //成功回调函数
		onError                : fOnError                 //错误回调函数
	}

	/**
	 * 获取当前位置
	 * @param {Function({Object}oPosition)}fOnSucc 成功回调函数
	 * @param {Function=}fOnError 错误回调函数
	 */
	function fGetCurrentPosition(fOnSucc,fOnError) {
		var me=this;
	    var fSucc=$H.intercept(me.onSuccess,fOnSucc);
	    var fErr=$H.intercept(me.onError,fOnError);
		if(navigator.geolocation){
			navigator.geolocation.getCurrentPosition(fSucc, fErr);
		}else{
			new Tips({
				showPos:'top',
				size:'mini',
				timeout:null,
				theme:'error',
				noMask:true,
				text:'当前设备不支持获取位置'
			});
		}
	}
	/**
	 * 成功回调函数
	 * @param {Object}oPos 当前位置信息
	 */
	function fOnSuccess(oPos){
	}
	/**
	 * 错误回调函数
	 * @param {Object}oError 错误信息
	 */
	function fOnError(oError) {
		var sMsg;
		switch (oError.code) {
			case oError.PERMISSION_DENIED :
				sMsg = "您拒绝了位置请求"
				break;
			case oError.POSITION_UNAVAILABLE :
				sMsg = "位置不可用"
				break;
			case oError.TIMEOUT :
				sMsg = "请求超时"
				break;
			case oError.UNKNOWN_ERROR :
				sMsg = "未知错误"
				break;
		}
		new Tips({
			showPos:'top',
			size:'mini',
			noMask:true,
			text:sMsg,
			theme:'error'
		});
	}

	return Geolocation;

});