/**
 * Cookie工具类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('Cookie',function(){
	
	var Cookie={
		getCookie     : fGetCookie,    //获取cookie
		setCookie     : fSetCookie,    //设置cookie
		delCookie     : fDeleteCookie  //删除cookie
	}
	
	/**
	 * 获取cookie
	 * @param   {string}sName cookie的name
	 * @param   {boolean}bNotUnescape 不解码
	 */
	function fGetCookie(sName,bNotUnescape) {
		var sSearch = sName + "=";
		var sValue = "";
		var sCookie = document.cookie;
		if(sCookie.length > 0){
			var nOffset = sCookie.indexOf(sSearch);
			if(nOffset != -1){
				nOffset += sSearch.length;
				var sEnd = sCookie.indexOf(";", nOffset);
				if(sEnd == -1){
					sEnd = sCookie.length;
				}
				sValue = sCookie.substring(nOffset, sEnd);
				//需要解码
				if(!bNotUnescape){
					sValue = unescape(sValue);
				}
			}
		}
		return sValue;
	}
	/**
	 * 设置cookie
	 * @method  setCookie(sName, sValue[,oOptions])
	 * @param {string}sName cookie的name
	 * @param {string}sValue cookie的value
	 * @param {Object}oOptions{
	 * 		{string}path    : cookie的path,根目录为"/",
	 * 		{string}domain  : cookie的domain,
	 * 		{string}expires : cookie的expires,值为GMT(格林威治时间)格式的日期型字符串,如：new Date().toGMTString(),
	 *      {boolean}secure : 是否有secure属性
	 * }
	 */
	function fSetCookie(sName, sValue, oOptions) {
		var aParam = [];
		if(sName!=undefined&&sValue!=undefined){
			aParam.push(sName + "=" + escape(sValue));
		}
		if(oOptions){
			if(oOptions.path!=undefined){
				aParam.push("path=" + oOptions.path);
			}
			if(oOptions.domain!=undefined){
				aParam.push("domain=" + oOptions.domain);
			}
			if(oOptions.expires!=undefined){
				aParam.push("expires=" + oOptions.expires);
			}
			if(oOptions.secure){
				aParam.push("secure");
			}
		}
		document.cookie = aParam.join(";");
	}
	/**
	 * 删除cookie
	 * @param {string}sName cookie的name
	 */
	function fDeleteCookie(sName){
		//当前时间
	    var oDate = new Date();
	    //设置为过期时间
	    oDate.setTime(oDate.getTime() - 1);
	    document.cookie = sName + "=;expires=" + oDate.toGMTString();
	}
	
	return Cookie;
});