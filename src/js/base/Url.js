/**
 * Url工具类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
$Define("B.Url","B.Object",function(Object){
	
	var Url={
		isUrl           : fIsUrl,           //是否是url
		isAbsUrl        : fIsAbsUrl,        //是否是绝对路径url
		isPic           : fIsPic,           //是否是图片
		paramToStr      : fParamToStr,      //将对象转化为url参数字符串
		strToParam      : fStrToParam,      //将url参数字符串转化为对象
		getQuery        : fGetQuery,        //获取query字符串
		setQuery        : fSetQuery,        //设置query字符串
		getQueryParam   : fGetQueryParam,   //获取url里的get参数
		setQueryParam   : fSetQueryParam,   //设置url的get参数
		getHash         : fGetHash,         //获取hash
		setHash         : fSetHash,         //设置hash
		getHashParam    : fGetHashParam,    //获取hash参数
		setHashParam    : fSetHashParam     //设置hash参数
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
	 * 将对象转化为url参数字符串
	 * @param {object}oParams 参数对象
	 * @return {string} 返回字符串参数
	 */
	function fParamToStr(oParams){
		var aUrl=[];
		for(var k in oParams){
			aUrl.push(k+'='+oParams[k]);
		}
		return aUrl.join('&');
	}
	/**
	 * 将url参数字符串转化为对象
	 * @param {string}sStr 字符串参数
	 * @return {object}oParams 参数对象
	 */
	function fStrToParam(sStr){
		if(!sStr){
			return {};
		}
		var aParams=sStr.split('&');
		var oParams={};
		for(var i=0,len=aParams.length;i<len;i++){
			var o=aParams[i].split('=');
			oParams[o[0]]=o[1];
		}
		return oParams;
	}
	/**
	 * 获取query字符串
	 * @param {string}sUrl 参数url，传空值表示获取当前地址栏url
	 * @return {string} 返回query(不带"?")
	 */
	function fGetQuery(sUrl){
		var nIndex=sUrl&&sUrl.indexOf('?');
		var sQuery=sUrl?nIndex>-1?sUrl.substring(nIndex+1,sUrl.indexOf('#')):'':top.location.search.substring(1);
		return sQuery;
	}
	/**
	 * 设置query字符串
	 * @param {string}sUrl 参数url，传空值表示设置当前地址栏url
	 * @param {string}sQuery 要设置的query字符串(不带"?")
	 * @return {string} 返回设置好的url
	 */
	function fSetQuery(sUrl,sQuery){
		if(sUrl){
			var nHashIndex=sUrl.indexOf('#');
			sUrl=sUrl.match(/[^\?#]+/)[0]+'?'+sQuery+(nHashIndex>0?sUrl.substring(nHashIndex):'');
			return sUrl;
		}else{
			top.location.search="?"+sQuery;
			return top.location.href;
		}
	}
	/**
	 * 获取query参数
	 * @param {string}sUrl null表示获取地址栏hash
	 * @param {string=}sParam 不传表示获取所有参数
	 * @return {string|object} 返回对应hash参数，sParam不传时返回object类型(所有参数)
	 */
	function fGetQueryParam(sUrl,sParam){
		var sQuery=Url.getQuery(sUrl);
		var oParams=Url.strToParam(sQuery);
		return sParam?oParams[sParam]:oParams;
	}
	/**
	 * 设置query参数
	 * @param {string}sUrl null表示设置地址栏hash
	 * @param {object} oHashParam要设置的hash参数
	 * @return {string=} 传入sUrl时，返回设置过hash参数的url
	 */
	function fSetQueryParam(sUrl,oHashParam){
		var sQuery=Url.getQuery(sUrl);
		var oParams=Url.strToParam(sQuery);
		Object.extend(oParams,oHashParam);
		sQuery=Url.paramToStr(oParams);
		return Url.setQuery(sUrl,sQuery);
	}
	/**
	 * 获取hash字符串
	 * @param {string}sUrl 参数url，传空值表示获取当前地址栏url
	 * @return {string} 返回hash(不带"#")
	 */
	function fGetHash(sUrl){
		var sHash=sUrl?sUrl.substring(sUrl.indexOf('#')+1):top.location.hash.substring(1);
		return sHash;
	}
	/**
	 * 设置hash字符串
	 * @param {string}sUrl 参数url，传空值表示设置当前地址栏url
	 * @param {string}sHash 要设置的hash字符串(不带"#")
	 * @return {string} 返回设置好的url
	 */
	function fSetHash(sUrl,sHash){
		if(sUrl){
			sUrl=sUrl.substring(0,sUrl.indexOf('#')+1)+sHash;
			return sUrl;
		}else{
			top.location.hash="#"+sHash;
			return top.location.href;
		}
	}
	/**
	 * 获取hash参数
	 * @param {string}sUrl 空值表示获取地址栏hash
	 * @param {string=}sParam 不传表示获取所有参数
	 * @return {string|object} 返回对应hash参数，sParam不传时返回object类型(所有参数)
	 */
	function fGetHashParam(sUrl,sParam){
		var sHash=Url.getHash(sUrl);
		var oParams=Url.strToParam(sHash);
		return sParam?oParams[sParam]:oParams;
	}
	/**
	 * 设置hash参数
	 * @param {string}sUrl 空值表示设置地址栏hash
	 * @param {object} oHashParam要设置的hash参数
	 * @return {string=} 传入sUrl时，返回设置过hash参数的url
	 */
	function fSetHashParam(sUrl,oHashParam){
		var sHash=Url.getHash(sUrl);
		var oParams=Url.strToParam(sHash);
		Object.extend(oParams,oHashParam);
		sHash=Url.paramToStr(oParams);
		return Url.setHash(sUrl,sHash);
	}
	
	return Url;
});