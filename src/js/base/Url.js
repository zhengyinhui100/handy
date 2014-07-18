/**
 * Url工具类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add("Url",function(){
	
	var Url={
		getParam        : fGetParam,        //获取url里的参数
		addParam		: fAddParam		    // 在url后面增加get参数
	}
	/**
	 * 获取url里的参数
	 * @param {string=}sName 参数名，不传表示获取所有的参数表
	 * @return {*} 返回参数值
	 */
	function fGetParam(sName){
		var sUrl=location.href;
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