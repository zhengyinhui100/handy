/**
 * 设备基本插件模块，提供本地相关的基本功能
 * 
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

define("P.Device", 
function() {

	var Device = {
		isPhonegap     : fIsPhonegap,     //是否是phonegap环境
		getNetType     : fGetNetType,     //获取网络类型
		isWifi         : fIsWifi          //是否是wifi
	}
	/**
	 * 是否是phonegap环境
	 * @return {boolean} true表示是phonegap
	 */
	function fIsPhonegap(){
		return !!window.cordova;
	}
	/**
	 * 获取网络类型
	 * @return {number} 返回类型代码:可与下列值相比较
	 * Connection.UNKNOWN
	 * Connection.ETHERNET
	 * Connection.WIFI
	 * Connection.CELL_2G
	 * Connection.CELL_3G
	 * Connection.CELL_4G
	 * Connection.CELL
	 * Connection.NONE
	 */
	function fGetNetType(){
		var oConnection=navigator.connection;
		return oConnection&&oConnection.type;
	}
	/**
	 * 是否是wifi
	 * @return{boolean} true 表示是wifi
	 */
	function fIsWifi(){
		return typeof Connection!='undefined'&&Device.getNetType()===Connection.WIFI;
	}

	return Device;

});