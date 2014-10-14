/**
 * Url工具类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
$Define("B.Url",function(){
	
	var Url={
		isUrl           : fIsUrl,           //是否是url
		isAbsUrl        : fIsAbsUrl,        //是否是绝对路径url
		isPic           : fIsPic,           //是否是图片
		getParam        : fGetParam,        //获取url里的参数
		addParam		: fAddParam		    // 在url后面增加get参数
	}
	/**
	 * 是否是url
	 * @param {string}sParam 参数字符串
	 * @return {boolean} true表示是url
	 */
	function fIsUrl(sParam){
		return /^(\w+:\/\/)?(\w+\.\w+)?[\w\/\.]+/.test(sParam);
	}
	/**
	 * 是否是绝对路径url
	 * @param {string}sParam 参数字符串
	 * @return {boolean} true表示是绝对路径url
	 */
	function fIsAbsUrl(sParam){
		return /^(\w+:\/\/)?\w+\.\w+/.test(sParam);
	}
	/**
	 * 是否是图片
	 * @param {string}sParam 参数字符串
	 * @return {boolean} true表示是图片
	 */
	function fIsPic(sParam){
		return /\.(jpg|jpeg|png|bmp|gif)$/.test(sParam);
	}
	/**
	 * 获取url里的参数
	 * @param {string=}sName 参数名，不传表示获取所有的参数表
	 * @param {string=}sUrl 参数url，默认是当前地址栏url
	 * @return {*} 返回参数值
	 */
	function fGetParam(sName,sUrl){
		var sUrl=sUrl||location.href;
		var m;
		if(m=sUrl.match(/\?([^#]+)/)){
			var sParams=m[1];
			var aParams=sParams.split('&');
			var oParams={};
			for(var i=0,len=aParams.length;i<len;i++){
				var o=aParams[i].split('=');
				oParams[o[0]]=o[1];
			}
			if(sName){
				return oParams[sName];
			}
			return oParams;
		}
	}
	/**
	 * 在该字符串中增加get需要的参数，如果改字符串代表的url没有get的参数，需要在后面加?，如果有，需要在后面加&
	 * @method  addParam
	 * @param  {string} sStr 需要操作的字符串
	 * @param  {string} sParam 需要添加到url中的参数
	 * @return {string} sStr 新组成的字符串
	 */
	function fAddParam(sStr, sParam){
		if(sParam){
			sStr += (sStr.indexOf("?")>-1 ? "&" : "?")+sParam;
		}
		return sStr;
	}
	
	return Url;
});