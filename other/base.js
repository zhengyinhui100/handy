/****************************************************************
* Filename:		base.js								   			*
* Author:		郑银辉												*
* Email:		zhengyinhui@corp.netease.com					*
* Created:		2012-03-14										*
* Copyright:	1997-2012 Netease.com Inc. All rights reserved.	*
*****************************************************************/
/** 
 * 该文件为人脸识别项目基础库
 * 代码注释使用YUI Doc{http://developer.yahoo.com/yui/yuidoc/}标准。
 * @author  郑银辉 (zhengyinhui@corp.netease.com)
 * @version 1.0 
 */
 
 //根据id获取元素
$=function(sId){
	return document.getElementById(sId);
} 
/**
* 对象的属性扩展
*
* @param {object} oDestination 需要扩展的对象
* @param {object} oSource 源属性的对象
* @param {boolean} bVoidCover 不覆盖原有属性方法
* @return {object} 扩展后的对象
*/
function fExtend(oDestination, oSource, bVoidCover) {
    for (var property in oSource) {
		if(property == "prototype") {
			continue; // opera下会把prototype遍历出来
		}
        try {
            if (!bVoidCover || !this.has(oDestination, property)) {
				oDestination[property] = oSource[property];
            }
        } catch (exp) { }
    }
	
    // toString单独处理
    try {
        if (oSource.toString != oSource.constructor.prototype.toString) {
            if (!bVoidCover) {
                oDestination.toString = oSource.toString;
            }
        }
    } catch (exp) { }
    return oDestination;
};
//事件类
var Ev={};
fExtend(Ev,{
	getTarget		    : fGetTarget,			// 获取target
    getEvent			: fGetEvent,			// 获取event
	stopEvent		    : fStopEvent,			// 取消事件和事件冒泡
	stopPropagation   	: fStopPropagation,		// 取消事件冒泡
	preventDefault	    : fPreventDefault,		// 取消事件
	pointerX			: fPointerX,			// 鼠标x位置
	pointerY			: fPointerY			    // 鼠标y位置
});
/**
 * 获取事件的触发元素
 * Returns the event's target element
 * @param {Event} ev Event对象
 * @param {boolean} resolveTextNode when set to true the target's
 *                  parent will be returned if the target is a 
 *                  text node
 * @return {HTMLElement} 返回事件的触发元素，如果是文本则返回父元素
 */
function fGetTarget(ev, resolveTextNode){
	if(!ev) ev = this.getEvent();
	var t = ev.target || ev.srcElement;

	if (resolveTextNode && t && "#text" == t.nodeName) {
		return t.parentNode;
	} else {
		return t;
	}
}
/**
 * 获取event对象
 * @param {Event} event对象
 * @return {Event} event对象
 */
function fGetEvent (e) {
	var ev = e || window.event || top.event;
	
	if (!ev) {
		var aCaller = [];
		var c = this.getEvent.caller;
		while (c) {
			ev = c.arguments[0];
			if (ev && Event == ev.constructor) {
				break;
			}
			
			var b = false;
			for(var i=0;i<aCaller.length;i++){
				if(c == aCaller[i]){
					b = true;
					break;
				}
			}
			if(b){
				break;
			}else{
				aCaller.push(c);
			}
			c = c.caller;
		}
	}

	return ev;
}

/**
 * 阻止事件冒泡触发以及阻止默认事件触发
 * @param {Event} ev event对象
 * @return {void}
 */
function fStopEvent(ev) {
	if(!ev){
		ev = this.getEvent();
	}
	this.stopPropagation(ev);
	this.preventDefault(ev);
}

/**
 * 阻止事件冒泡触发
 * @param {Event} ev event对象
 * @return {void}
 */
function fStopPropagation(ev) {
	if(!ev){
		ev = this.getEvent();
	}
	if (ev.stopPropagation) {
		ev.stopPropagation();
	}else{
		ev.cancelBubble = true;
	}
}

/**
 * 阻止默认事件触发
 * @param {Event} ev event对象
 * @return {void}
 */
function fPreventDefault(ev) {
	if(!ev){
		ev = this.getEvent();
	}
	if (ev.preventDefault) {
		ev.preventDefault();
	} else {
		ev.returnValue = false;
	}
}

/**
 * 事件触发鼠标x坐标
 * @param {event}ev event对象
 * @return {number}返回x坐标
 */
function fPointerX(ev) {
	if(!ev){
		ev = this.getEvent();
	}
	var doc = document;
	return ev.pageX || (ev.clientX +
	  (doc.documentElement.scrollLeft || doc.body.scrollLeft));
}

/**
 * 事件触发鼠标x坐标
 * @param {event}ev event对象
 * @return {number}返回y坐标
 */
function fPointerY(ev) {
	if(!ev){
		ev = this.getEvent();
	}
	var doc = document;
	return ev.pageY || (ev.clientY +
	  (doc.documentElement.scrollTop || doc.body.scrollTop));
}

//浏览器识别类
var Browser={};
fExtend(Browser,{
	_os				: 'unknown',			// 操作系统
	_appName		: 'unknown',			// 浏览器名称
	_version		: 'unknown',			// 浏览器版本号
	_shell			: '',					// 针对国内模仿主流浏览器的外壳，判断额外属性，包括sogou,maxthon,tencenttraveler,theworld,360
	_screenWidth	: null,					// 分辨率宽
	_screenHeight	: null,					// 分辨率高
	_hasFlash		: null,					// 是否安装了flash插件
	_flashVersion	: null,					// flash的版本
	_isInited		: false,				// 是否已经初始化了各种属性了
	_init			: _fBrowserInit,		// 初始化flash参数
	getInfo			: fBrowserGetInfo,		// 获得浏览器信息
	getVersion		: fBrowserGetVersion,	// 获得version的数组
	isIE			: fBrowserIsIE,			// 判断是否是IE浏览器
	ie				: fBrowserIe,			// 返回IE版本号，或者undefined
	firefox			: fBrowserFirefox,		// 返回Firefox版本号，或者undefined
	chrome			: fBrowserChrome,		// 返回Chrome版本号，或者undefined
	safari			: fBrowserSafari,		// 返回Safari版本号，或者undefined
	opera			: fBrowserOpera 		// 返回Opera版本号，或者undefined
});
/**
 * 初始化浏览器信息，并保存在Browser属性中
 *
 * @method _init
 * @return {void}
 * @for Browser
 */
function _fBrowserInit(){
	if(!this._isInited){
		var fTrim = function(){
		  return this.replace(/(^\s*)|(\s*$)/g, "").replace(/(^　*)|(　*$)/g, "");
		};
		
		var sUserAgent = window.navigator.userAgent;
		var sOs = "";
		var sAppName = "";
		var sVersion = "";
		var sShell = "";
		var sFlashVersion = "";
		
		// 读取分析操作系统
		if ((/windows|win32/i).test(sUserAgent)) {
			sOs = 'windows';
		} else if ((/linux/i).test(sUserAgent)) {
			sOs = 'linux';
		} else if ((/macintosh/i).test(sUserAgent)) {
			sOs = 'macintosh';
		} else if ((/rhino/i).test(sUserAgent)) {
			sOs = 'rhino';
		} else if((/ipad/i).test(sUserAgent)) {
			sOs = 'ipad';
		}else if((/iphone/i).test(sUserAgent)) {
			sOs = 'iphone';
		}else if((/ipod/i).test(sUserAgent)) {
			sOs = 'ipod';
		}else if((/android/i).test(sUserAgent)) {
			sOs = 'android';
		}else if((/adobeair/i).test(sUserAgent)){
			sOs = 'adobeair';
		}else{
			try{
				sOs = navigator.platform.toLowerCase();
			}catch(exp){}
		}
		this._os = sOs;

		// 读取分析浏览器信息
		try{
			_fPraseBrowser();
		}catch(exp){}
		// 读取分析浏览器外壳
		try{
			_fParseShell();
		}catch(exp){}

		this._appName = fTrim.call(sAppName).toLowerCase(); // 浏览器类型
		this._version = fTrim.call(sVersion).toLowerCase(); // 版本号
		this._shell = fTrim.call(sShell).toLowerCase(); // 版本号

		// 分辨率信息
		this._screenWidth = window.screen.width;
		this._screenHeight = window.screen.height;

		try{
			_fPraseFlash();
		}catch(exp){}

		this._hasFlash = !!sFlashVersion;
		this._flashVersion = sFlashVersion;


		this._isInited = true;
	}

	function _fPraseBrowser(){
		// match的结果
		var m;
		// 判断IE
		m = sUserAgent.match(/MSIE\s([^;]*)/);
		if (m && m[1]) {
			sAppName = "MSIE";
			sVersion = m[1];
			return;
		}
		// 判断Firefox		
		m = sUserAgent.match(/Firefox\/([^\s]*)/);
		if(m&&m[1]){
			sAppName = "Firefox";
			sVersion = m[1];
			return;
		}
		// 判断Chrome
		m = sUserAgent.match(/Chrome\/([^\s]*)/);
		if(m&&m[1]){
			sAppName = "Chrome";
			sVersion = m[1];
			return;
		}
		// 判断Safari
		m = sUserAgent.match(/Version\/([^\s]*).+Safari/);
		if(m&&m[1]){
			sAppName = "Safari";
			sVersion = m[1];
			return;
		}
		// 判断Opera
		m = sUserAgent.match(/Opera.+Version[\s\/]([^\s]*)/);
		if (m && m[1]) {
			sAppName = "Opera";
			sVersion = m[1];
			m = sUserAgent.match(/Opera Mini[^;]*/);
			if (m) {
				sAppName = m[0];
			}
			return;
		}
		// 判断AppleWebKit
		m = sUserAgent.match(/AppleWebKit\/([^\s]*)/);
		if (m && m[1]){
			sAppName = "AppleWebKit";
			sVersion = m[1];
			return;
		}
		/*
		// 判断KHTML
		if ((/KHTML/).test(sUserAgent)) {
			sAppName = "webkit";
			return;
		}
		// 判断Gecko
		m = sUserAgent.match(/Gecko\/([^\s]*)/);
		if (m && m[1]) {
			sAppName = "Gecko";
			sVersion = m[1]; // Gecko detected, look for revision
			m = sUserAgent.match(/rv:([^\s\)]*)/);
			if (m[1]) {
				sVersion = m[1];
			}
			return;
		}
		*/
	}
	
	function _fParseShell(){
		// match的结果
		var m;
		// 判断搜狗浏览器
		m = sUserAgent.match(/MetaSr/i);
		if (m) {
			sShell = 'Sogou';
			return;
		}
		var m;
		// 判断遨游浏览器
		m = sUserAgent.match(/Maxthon/i);
		if (m) {
			sShell = 'Maxthon';
			return;
		}
		// 判断腾讯TT浏览器
		m = sUserAgent.match(/TencentTraveler/i);
		if (m) {
			sShell = 'TencentTraveler';
			return;
		}
		// 判断世界之窗浏览器
		m = sUserAgent.match(/TheWorld/i);
		if (m) {
			sShell = 'TheWorld';
			return;
		}
		// 判断世界之窗浏览器
		m = sUserAgent.match(/360[S|E]E/i);
		if (m) {
			sShell = '360';
			return;
		}
	}

	function _fPraseFlash(){
		// 读取分析flash信息
		// 如果是ie浏览器
		if(sAppName=="MSIE"){
			// 创建一个activeobject
			var oFlash = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
			if(oFlash){
				sFlashVersion = oFlash.getVariable("$version").split(" ")[1];
			}
		// 其他浏览器
		}else{
			if(navigator.plugins && navigator.plugins.length > 0){
				var oFlash=navigator.plugins["Shockwave Flash"];
				if(oFlash){
					var aInfo = oFlash.description.split(" ");
					for(var i=0,m=aInfo.length;i<m;i++){
						if(parseInt(aInfo[i])>0){
							sFlashVersion = aInfo[i];
							break;
						}
					}
				}
			}
		}
	}

}
/**
 * 获得浏览器信息
 *
 * @method getInfo
 * @return {object}获得一个对象，里面包含了 appName,version,screenWidth,screenHeight,hasFlash,flashVersion六个属性
 * @for Browser
 */
function fBrowserGetInfo(){
	this._init();
	return {
		"os" : this._os,
		"appName" : this._appName,
		"version" : this._version,
		"shell" : this._shell,
		"screenWidth" : this._screenWidth,
		"screenHeight" : this._screenHeight,
		"hasFlash" : this._hasFlash,
		"flashVersion" : this._flashVersion
	};
}
/**
 * 获得浏览器版本信息
 *
 * @method getVersion
 * @return {array}获得版本信息
 * @for Browser
 */
function fBrowserGetVersion(){
	this._init();
	var sVersion = this._version;
	var aVersion = sVersion.split(".");
	for(var i=0,m=aVersion.length;i<m;i++){
		aVersion[i] = parseInt(aVersion[i],10);
	}
	return aVersion;
}
/**
 * 判断是否是IE
 *
 * @method isIE
 * @return {boolean} 是否是ie
 * @for Browser
 */
function fBrowserIsIE(){
	this._init();
	return this._appName == "msie";
}
/**
 * 返回IE版本号
 *
 * @method ie
 * @return {string} ie的版本信息
 * @for Browser
 */
function fBrowserIe(){
	this._init();
	var sVersion = this._version;
	return this._appName == "msie" ? sVersion : undefined;
}


/**
 * 返回Firefox版本号
 *
 * @method firefox
 * @return {string} firefox的版本信息
 * @for Browser
 */
function fBrowserFirefox(){
	this._init();
	var sVersion = this._version;
	return this._appName == "firefox" ? sVersion : undefined;
}
/**
 * 返回Chrome版本号
 *
 * @method chrome
 * @return {string} chrome的版本信息
 * @for Browser
 */
function fBrowserChrome(){
	this._init();
	var sVersion = this._version;
	return this._appName == "chrome" ? sVersion : undefined;
}
/**
 * 返回safari版本号
 *
 * @method safari
 * @return {string} safari的版本信息
 * @for Browser
 */
function fBrowserSafari(){
	this._init();
	var sVersion = this._version;
	return this._appName == "safari" ? sVersion : undefined;
}
/**
 * 返回Opera版本号
 *
 * @method opera
 * @return {string} opera的版本信息
 * @for Browser
 */
function fBrowserOpera(){
	this._init();
	var sVersion = this._version;
	return this._appName == "opera" ? sVersion : undefined;
}

//ajax类
var Ajax={};
fExtend(Ajax,{
	request        : fRequest//发送ajax请求
});
/**
 * 发送ajax请求
 * @method request
 * @param {object}oParam
 * 				{
 * 					{string}method   : 请求方式，默认是get
 * 					{string}url      : 请求地址,
 * 					{object}head     : 需要添加的请求头
 * 					{string}body     : 请求附加内容
 *                  {boolean}notCall : 是否不需要回调
 * 					{function}call   : 回调函数
 * 					{function}error  : 错误回调函数
 * 				}
 * @return {void}
 * @for Ajax
 */
function fRequest(oParam) {
	var oRequest;
	if (window.XMLHttpRequest) {
		oRequest = new XMLHttpRequest();
	} else if (window.ActiveXObject) {
		oRequest = new ActiveXObject("Microsoft.XMLHTTP");
	}
	if (oRequest) {
		var sUrl = oParam.url;
		//get|post(默认get)
		var sMethod=oParam.method||"get";
		//默认异步
		var bSync=!(oParam.sync==false);
		//是否不需要回调
		var bNotCallback=oParam.notCall;
		//头部
		var oHead=oParam.head||{};
		//body
		var sBody = oParam.body || "";
		//回调函数
		var fCall=oParam.call||function(){};
		// 如果是POST提交，加上form头，处理请求内容
		if(sMethod=="post"){
			oHead["Content-type"]="application/x-www-form-urlencoded";
			if(typeof sBody != "string"){
				var oParams = sBody;
				var aParams = [];
				for(var sKey in oParams){
					aParams.push(sKey+"="+encodeURIComponent(oParams[sKey]));
				}
				sBody = aParams.join("&");
			}
		}
		//ie下要加上随机数，避免304缓存
		if(Browser.ie()){
			var sAdd="randomTmp="+Math.random();
			if(sUrl.indexOf("?")>=0){
			    sAdd="&"+sAdd;
			}else{
				sAdd="?"+sAdd;
			}
			sUrl+=sAdd;
		}
		oRequest.open(sMethod, sUrl, bSync);
		//异步
		if(bSync){
			oRequest.onreadystatechange = function() {
				if (oRequest.readyState == 4&&!bNotCallback) {
					// 防止内存泄漏
					try{
						oRequest.onreadystatechange = null;
					}catch(exp){
						oRequest.onreadystatechange = function(){};
					}
					try{
						//如果发送了ajax请求，然后又location.href=重定向，这里oRequest.responseText会变为空字符串导致出错
						var oResult=eval("("+oRequest.responseText+")");
						if(oResult.code=="AJAX_NO_LOGIN"){
							fMsgBox({content:"会话超时，请重新登录。"});
						}else{
							fCall(oResult);
						}
					}catch(e){
						fCall({code:"fail",result:"exception"});
						fMsgBox({content:"系统繁忙，请稍后再试。"});
					}
				}else {
				}
			};
		}
		// 设置http头信息
		for(var sKey in oHead){
			oRequest.setRequestHeader(sKey,oHead[sKey]);
		}
		oRequest.send(sMethod=="post" ? sBody : null);
		//同步，立即返回
		if(!bSync){
			fCall(oRequest);
		}
		return oRequest;
	}
}
/**
 * 系统提示框
 * @method  fMsgBox
 * @param {object}oData 提示信息对象
 * @param {object}返回button对象
 * @for Msg
 */
function fMsgBox(oData){
	function _fRemove(sId){
		var oEl=$(sId);
		if(oEl){
			oEl.parentNode.removeChild(oEl);
		}
	}
	 // 删除已有的提示框
	_fRemove("dvMsgbox");
	if(oData.height == "max"){
		oData.height = document.body.offsetHeight - 50;
	}
	var sHtml = '<div class="gSys-msg" style="display:block" id="dvMsgbox">' +
		'<div class="gSys-msg-win" style="width:'+ (oData.width ? oData.width : '460') +'px;" id="dvMsgboxChild">' +
		'			<div class="fn-bgx bg-main-2 hd" id="dvMsgHead">' +
		'				<span class="fn-bg rc-l"></span>' +
		'				<h4>'+ (oData.title ? oData.title : '系统提示') +'</h4>' +
		'				<span class="sub txt-14">'+ (oData.quotTitle ? '('+ oData.quotTitle +')' : '') +'</span>' +
		'				<span class="fn-bg rc-r"></span>' +
		'				<a href="javascript:fGoto()" id="lnkClose" class="fn-bg Aclose" hidefocus="true" title="关闭">关闭</a>' +
		'			</div>' +
		'			<div class="cont bdr-c-dark" style="'+ (oData.height ? "height:" + oData.height + "px;": '') +'">$content$</div>' +
		'			<div class="ft bdr-c-dark bg-cont" '+(oData.hideBottom ? 'style="display:none;" ':'') +'>' +
		'				<div class="sup" id="dvMsgBottomDiv" style="margin:8px">'+ (oData.bottom || "") +'</div>' +
		'				<div class="opt">' +
		'					$disbtn$' +
		'					$extbtn$' + '<div id="btnMsgOk" class="btn btn-dft"><span>'+(oData.okText || "确 定")+'</span></div>' + 
		'					$cancel$' +
		'				</div>' +
		'			</div>' +
		'		</div>' +
		(oData.noMask ? '' : '<div class="mask" id="dvMsgMask">&nbsp;</div>') +
		'	</div>';
	var sContent = '<div class="gSys-inner-comm">' +
		'	<b class="ico '+ (oData.icon || "ico-info") +'" title="提示："></b>' +
		'	<div class="ct">'+ oData.content +'</div>' +
		'</div>';
	if(oData.isPrompt){
		sContent = '<div class="gSys-inner-comm"><b class="ico ico-info" title="提示："></b><div class="ct"><table class="gSys-Itab-ipt"><tbody><tr><th><nobr>'+ oData.content +'：</nobr></th><td><input type="'+ (oData.inputType || "text") +'"  id="txtPromptInput" class="ipt-t-dft" onkeydown="if((event.charCode || event.keyCode) == 13){$(\'btnMsgOk\').onclick();}" /><div class="txt-err" id="spnEroMsg"></div><span id="spnMsgBoxExtOption"></span></td></tr></tbody></table></div></div>';
	}
	if(oData.noIcon){// 不显示左侧图标
		sContent = oData.content;
	}
	// 替换内容
	sHtml = sHtml.replace("$content$", sContent);
	// 替换按钮
	var sCancel = "";
	sHtml = sHtml.replace("$cancel$", oData.hasCancel ? '<div id="btnMsgCancel" class="btn btn-dft"><span>'+(oData.cancelText || "取 消")+'</span></div>' : '');
	var sExtbtn = "";
	sHtml = sHtml.replace("$extbtn$", oData.extBtn ? '<div id="btnMsgExt" class="btn btn-dft"><span>'+oData.extBtn.text+'</span></div>' : '');
	// 禁止按钮
	sHtml = sHtml.replace("$disbtn$", oData.disBtn ? '<div id="btnMsgDis" class="btn btn-dft"><span>'+(oData.cancelText || "确 定")+'</span></div>' : '');
	
	var oCon = document.createElement("DIV"); // 顶部生成对话框
	oCon.innerHTML = sHtml;
	document.body.appendChild(oCon.firstChild);
	var oMsgBox = $("dvMsgbox");
	// 如果是提示对话框模式
	if(oData.isPrompt){
		var oTxtPromptInput=$("txtPromptInput");
		oTxtPromptInput.value = oData.defaultValue || ""; // 填充默认值
		// 光标自动定位
		window.setTimeout(function(){
			try{
				oTxtPromptInput.focus();
				oTxtPromptInput.select();
			}catch(exp){}
		}, 0);
	}   
	var oTopDoc = document;
	var oMsgboxChild=$("dvMsgboxChild");
	if(oData.noPos){ // 不设置位置
		oMsgboxChild.style.left = oData.noPos.x + "px";
		oMsgboxChild.style.top = oData.noPos.y + "px";        
	}else{
		// 设置定位坐标
		var h = oMsgboxChild.offsetHeight;
		var w = oMsgboxChild.offsetWidth;
		var sScrollTop = 0; // document.body.scrollTop;			
		var x = ((oTopDoc.documentElement.offsetWidth || oTopDoc.body.offsetWidth) - w)/2;
		var y = ((oTopDoc.documentElement.clientHeight || oTopDoc.body.clientHeight) - h)/2 + sScrollTop;
		y = y < 10 ? window.screen.height/2-200 : y;
		oMsgboxChild.style.left = x + "px";
		oMsgboxChild.style.top = y-(oData.extTop||0) + "px";    
	}
	if($("dvMsgMask")) $("dvMsgMask").style.height = oTopDoc.body.scrollHeight + "px";  
	//TODO
	//fCommonSetWinDragable($("dvMsgHead"), oMsgboxChild); // 设置可以拖动
	// 自动聚焦到确定按钮
	try{
		$("btnMsgOk").focus();
	}catch(e){}
	// 确定按钮点击事件
	$("btnMsgOk").onclick = function(){
		try{
			EV.stopEvent();
		}catch(e){}
		if(!oData.call){// 如果没有确定的call
			oData.cancelCall = null;
			if($("lnkClose")) $("lnkClose").onclick();
		}else{
			var r = null;
			try{
				var param = null;
				if($("txtPromptInput")){// 如果是提示框
					param = $("txtPromptInput").value;
				}
				r = oData.call(param);// 调用call
				if(oData.isPrompt && r){// 返回非false
					$("spnEroMsg").innerHTML = r.msg || r; // 显示返回的错误
					$("txtPromptInput").select();// 聚焦到输入框
					return;
				}
			}catch(e){}
			if(!r){// 返回后关闭
				if(oMsgBox == $("dvMsgbox")){
					oData.cancelCall = null;
					if($("lnkClose")) $("lnkClose").onclick();
				}
			}
		}
	};

	// 确定按钮键盘事件
	$("btnMsgOk").onkeydown = function (){
		var e = EV.getEvent();
		var sKey = e.charCode || e.keyCode;
		if(sKey == 13 || sKey == 32){// enter 或者是space键
			$("btnMsgOk").onclick();
		}
	};
	// 取消按钮点击事件
	($("btnMsgCancel") || {}).onclick = function(){
		try{
			if(oData.cancelCall && oData.cancelCall()){// 调用cancel的call
				return false;
			}
		}catch(e){}
		oData.cancelCall = null;
		if($("lnkClose")) $("lnkClose").onclick();
		return false;
	};
	// 扩展按钮点击事件
	($("btnMsgExt") || {}).onclick = function(){
		try{
			if(oData.extBtn.call && oData.extBtn.call()){
				return false;
			}
		}catch(e){}
		// $("lnkClose").onclick();
		return false;
	};
	var aHideItems = [];
	// 关闭链接点击事件
	$("lnkClose").onclick = function(){
		try{
			if(oData.cancelCall && oData.cancelCall()){
				return false;
			}
		}catch(e){}
		_fRemove("dvMsgbox");// 删除对话框
		// 显示被隐藏的元素
		for(var i=0;i<aHideItems.length;i++){
			aHideItems[i].style.visibility = "visible";
		}
		return false;
	};
	var sIeVersion=Browser.ie();
	var arr = ((sIeVersion == "6")?(["SELECT"]):(((!Browser.ie() || (sIeVersion == "7" || sIeVersion == "8")) || Browser.opera())?[]:["SELECT"]));
	/**
	 * 节点1是否在另外一个节点2中
	 * @param  {object}obj  节点1
	 * @param  {object}ancestor  节点2
	 * @return {boolean} 返回true或者false
	 */
	function _fIsContain(element, ancestor){
		while (element){
			if (element == ancestor) return true;
			element = element.parentNode;
		}
		return false;
	}
	for(var i=0;i<arr.length;i++){
		var aEls=document.getElementsByTagName(arr[i]);
		if(aEls){
			for(var i=0;i<aEls.length;i++){
				var oEl=aEls[i];
				// 不隐藏对话框里面的元素
				if(!_fIsContain(oEl, $("dvMsgbox"))){
					oEl.style.visibility = "hidden";
					aHideItems[aHideItems.length] = oEl;
				}
			}
		}
	}
	return {ok : $("btnMsgOk"), cancel : $("btnMsgCancel"), close : $("lnkClose"), prompt:$("txtPromptInput")};
}
/**
 * 跳转到登录页
 * @method  fGotoLogin
 * @param   {void}
 * @return  {void}
 */
function fGotoLogin(){
	var sDomain;
	var sSearch=location.search;
	var aUid=/uid=[^&]+/.exec(sSearch);
	if(aUid){
		var sUid=aUid[0];
		sDomain=sUid.substring(sUid.indexOf("@")+1);
		//免费邮箱增加"mail."前缀
		if(sDomain.indexOf("vip")<0&&sDomain.indexOf("188")<0){
			sDomain="mail."+sDomain;
		}
	}else{
		sDomain="mail.163.com";
	}
	top.location.href="http://"+sDomain+"/#return";
}
/**
 * 发送统计请求
 * @method  fLog
 * @param   {string}sName 统计名称
 * @return  {void}
 */
function fLog(sName){
	Ajax.request({
		//不需要回调
		notCall:true,
		url:"/faceauth/log.do?name="+sName
	});
}