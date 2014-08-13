/**
 * String工具类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add("String",function(){
	
	var String={
		stripTags		: fStripTags,       // 删除标签
		escape   		: fEscape    ,      // html编码
		unescape    	: fUnescape,        // html解码
		encodeHTML		: fEncodeHTML,	    // html编码
		decodeHTML		: fDecodeHTML,	    // html解码
		htmlToTxt       : fHtmlToTxt,       // htlm转换为纯文本
		TxtToHtml       : fTxtToHtml,       // 纯文本转换为html
		trim			: fTrim,            // 删除字符串两边的空格
		check			: fCheck,		    // 检查特殊字符串
		len				: fLen,         	// 计算字符串打印长度,一个中文字符长度为2
		left			: fLeft,			// 截断left
		isNumStr		: fIsNumStr,        // 字符串是否是数字
		hasChn          : fHasChn,          // 字符是否包含中文
		isChn           : fIsChn            // 字符是否是中文
	}
	/**
	 * 删除标签字符串
	 * @method  stripTags
	 * @param  {string} sStr 需要操作的字符串
	 * @return {string} 删除标签后的字符串 
	 */
	function fStripTags(sStr){
		return sStr.replace(/<\/?[^>]+>/gi, '');
	};
	/**
	 * html编码,escape方式
	 * @param  {string} sStr 需要操作的字符串
	 * @return  {string} 编码后的html代码
	 */
	function fEscape(sStr){
		if(!sStr){
			return sStr;
		}
		var oDiv = document.createElement('div');
		var oText = document.createTextNode(sStr);
		oDiv.appendChild(oText);
		return oDiv.innerHTML;
	};

	/**
	 * html解码,escape方式
	 * @param  {string} sStr	需要操作的字符串
	 * @return {string}  	解码后的html代码  
	 */
	function fUnescape(sStr){
		var oDiv = document.createElement('div');
		oDiv.innerHTML = String.stripTags(sStr);
		return oDiv.childNodes[0].nodeValue;
	};
	/**
	 * html编码，替换<>等为html编码
	 * @method  encodeHTML
	 * @param  {string} sStr 需要操作的字符串
	 * @return {string} sStr 编码后的html代码  
	 */
	function fEncodeHTML(sStr){
		sStr = sStr.replace(/&/gi,"&amp;");
		sStr = sStr.replace(/</gi,"&lt;");
		sStr = sStr.replace(/>/gi,"&gt;");
		sStr = sStr.replace(/\"/gi,"&quot;");
		sStr = sStr.replace(/\'/gi,"&apos;");
		sStr = sStr.replace(/\n/gi,"</br>");
		sStr = sStr.replace(/ /gi,"&nbsp;");
		return sStr;
	};
	/**
	 * html解码，替换掉html编码
	 * @method  decodeHTML
	 * @param  {string} sStr 需要操作的字符串
	 * @return {string} sStr 解码后的html代码  
	 */
	function fDecodeHTML(sStr){
		sStr = sStr.replace(/&lt;/gi,"<");
		sStr = sStr.replace(/&gt;/gi,">");
		sStr = sStr.replace(/&quot;/gi,"\"");
		sStr = sStr.replace(/&apos;/gi,"\'");
		sStr = sStr.replace(/<\/?br>/gi,"\n");
		sStr = sStr.replace(/&amp;/gi,"&");
		sStr = sStr.replace(/&nbsp;/gi," ");
		return sStr;
	};
	/**
	 * html转换为纯文本
	 * @param {string}sContent 参数html
	 * @param {boolean}bIgnore 是否忽略换行
	 * @return {string} 返回纯文本
	 */
	function fHtmlToTxt(sContent){
		sHtml = sHtml.replace(/\n/ig, "");
		sHtml = sHtml.replace(/\\s+/ig, "");
		if(!bIgnore){
			// 替换块级标签为换行符
			sHtml = sHtml.replace(/<\/(address|blockquote|center|dir|div|dl|fieldset|form|hr|h[1-6]|isindex|iframe|menu|ol|p|pre|table|ul)>/gi,"\n");
			// 替换换行符
			sHtml = sHtml.replace(/<br>/gi, "\n");
		}
		// 处理列表
		sHtml = sHtml.replace(/<li>/gi, " . ");
		// 消除遗留html标签
		sHtml = sHtml.replace(/<[^>]+>/g, "");
		// 处理转义字符
		sHtml = String.decodeHTML(sHtml);
		return sHtml;
	}
	/**
	 * 纯文本转换为html
	 * @param {string}sContent 参数纯文本
	 * @return {string} 返回hmlt片段
	 */
	function fTxtToHtml(sContent){
		return String.encodeHTML(sContent);
	}
	/**
	 * 去掉字符串两边的空格
	 * @method  trim
	 * @param  {string} sStr 需要操作的字符串
	 * @return {string} sStr 去掉两边空格后的字符串  
	 */
	function fTrim(sStr){
		sStr = sStr.replace(/(^(\s|　)+)|((\s|　)+$)/g, ""); 
		return sStr;
	}

	/**
	 * 检查字符串是否含有"% \' \" \\ \/ "的字符
	 * @method  check
	 * @param  {string} sStr 需要操作的字符串
	 * @param   {Object}rKey 需要寻找的字符正则匹配	
	 * @return  {boolean} 如果没有特殊字符返回false,否则返回true
	 */
	function fCheck(sStr,rKey){
		if(!rKey){
			rKey=/[,%\'\"\/\\;|\<\>\^]/;
		}
		return sStr.search(rKey)>-1;
	};
	/**
	 * 计算字符串打印长度,一个中文字符长度为2
	 * @method  len
	 * @param  {string} sStr 需要操作的字符串
	 * @return {number} 字符串的长度    
	 */
	function fLen(sStr){
		return sStr.replace(/[^\x00-\xff]/g,"**").length;
	};
	/**
	 * 截取字符串左边n位
	 * @method  left
	 * @param  {string} sStr 需要操作的字符串
	 * @param  {number} nLength	要截取的位数
	 * @param  {number|boolean} nEllipsisLength	省略号长度
	 * @return {string} 被截取后的字符串
	 */
	function fLeft(sStr,nLength,nEllipsisLength){
		if(String.len(sStr)>nLength){
			// 如果传递的是boolean，并且为true，默认为两个字符的缩略
			if(nEllipsisLength===true){
				nEllipsisLength = 2;
			// 非大于0的变量，设置为0
			}else if(!(nEllipsisLength>0)){
				nEllipsisLength = 0;
			}
			var i = 0;
			var j = 0;
			nLength = nLength-nEllipsisLength;
			while(j<nLength){
				if(sStr.charCodeAt(i)>255){
					j += 2;
				}else{
					j ++;
				}
				i ++;
			}
			sStr = sStr.substring(0,i);
			for(var i=0;i<nEllipsisLength;i++){
				sStr+='.';
			}
		}
		return sStr;
	};
	/**
	 * 判断是否数字
	 * @method  isNumStr
	 * @param  {string} sStr 需要操作的字符串
	 * @return  {boolean} 返回是否数字   
	 */
	function fIsNumStr(sStr){
		return (sStr.search(/^\d+$/g) == 0);
	}
	/**
	 * 判断是否包含中文
	 * @method  hasChn
	 * @param  {string} sStr 需要操作的字符串
	 * @return  {boolean} 返回是否包含中文   
	 */
	function fHasChn(sStr){
		return /[\u4E00-\u9FA5]+/.test(sStr);
	}
	/**
	 * 判断是否是中文
	 * @method  isChn
	 * @param  {string} sStr 需要操作的字符串
	 * @return  {boolean} 返回是否是中文
	 */
	function fIsChn(sStr){
		return /^[\u4E00-\u9FA5]+$/.test(sStr);
	}
	
	return String;
});