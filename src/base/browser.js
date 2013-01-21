/**
 * 浏览器环境类，分析浏览器类型、版本号、操作系统、内核类型、壳类型、flash版本
 * 浏览器版本，$Browser.ie/firefox/chrome/opera/safari(),如果浏览器是IE的，$.Browser.ie()的值是浏览器的版本号，!$.Browser.ie()表示非IE浏览器
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
HANDY.add("Browser",["Object"],function($){

	var oInfo={};
	
	var Browser={};
	
	//归纳生成方法，如：Browser.ie()返回ie的版本号(默认返回整型，传入true参数时返回实际版本号，如：'20.0.1132.43')，Browser.windows()返回是否是windows系统
	$.Object.genMethod(Browser,[
			'ie','firefox','chrome','safari','opera',   //浏览器版本，@return{string}
			'windows','linux','mac',                    //操作系统，@return{boolean}
			'trident','webkit','gecko','presto',        //浏览器内核类型，@return{boolean}
			'sogou','maxthon','tt','theWorld','is360',  //浏览器壳类型，@return{boolean}
			'flash'                                     //flash版本，@return{string}
		],
		function(sName){
			
			return function(bNotInt){
				var sValue=oInfo[sName];
				return !bNotInt&&typeof sValue==='string'?parseInt(sValue):sValue;
			}
		}
	);
		
	/**
	 * 初始化
	 * @method _fInit
	 * @param {void}
	 * @return {void}
	 */
	function _fInit(){
		var userAgent = window.navigator.userAgent;
		_fParseBrowser(userAgent);
		_fParseOs(userAgent);
	    _fParseKernel(userAgent);
		_fParseShell(userAgent);
		_fParseFlash();
	}
	/**
	 * 分析浏览器类型及版本
	 * @method _fParseBrowser
	 * @param {string}userAgent 浏览器userAgent
	 * @return {void}
	 */
	function _fParseBrowser(userAgent){
		var ua =userAgent;
		var matcher;
		// 使用正则表达式在userAgent中提取浏览器版本信息
		(matcher = ua.match(/MSIE ([\d.]+)/)) ? oInfo.ie = matcher[1] :
		(matcher = ua.match(/Firefox\/([\d.]+)/))? oInfo.firefox = matcher[1]: 
		(matcher = ua.match(/Chrome\/([\d.]+)/))? oInfo.chrome = matcher[1]: 
		(matcher = ua.match(/Opera.([\d.]+)/))? oInfo.opera = matcher[1]: 
		(matcher = ua.match(/Version\/([\d.]+).*Safari/))? oInfo.safari = matcher[1]: 0;
	}
	/**
	 * 分析浏览器类型及版本
	 * @method _fParseOs
	 * @param {string}userAgent 浏览器userAgent
	 * @return {void}
	 */
	function _fParseOs(userAgent){
		var os;
		// 读取分析操作系统
		/windows|win32/i.test(userAgent)?oInfo.windows=true:
		/linux/i.test(userAgent)?oInfo.linux=true:
		/macintosh/i.test(userAgent)?oInfo.mac=true:0;
	}
	/**
	 * 分析浏览器内核类型
	 * @method _fParseKernel
	 * @param {string}userAgent 浏览器userAgent
	 * @return {void}
	 */
	function _fParseKernel(userAgent){
		var ua =userAgent;
		var matcher;
		// 使用正则表达式在userAgent中提取浏览器版本信息
		/trident/i.test(ua) ? oInfo.trident = true :
		/webkit/i.test(ua)? oInfo.webkit = true: 
		/gecko/i.test(ua)? oInfo.gecko = true: 
		/presto/i.test(ua)? oInfo.presto = true: 0;
	}
	/**
	 * 分析浏览器壳类型
	 * @method _fParseShell
	 * @param {string}userAgent 浏览器userAgent
	 * @return {void}
	 */
	function _fParseShell(userAgent){
		var matcher;
		var ua=userAgent;
		// 使用正则表达式在userAgent中提取浏览器壳信息
		/MetaSr/i.test(ua) ? oInfo.sogou = true :
		/Maxthon/i.test(ua)? oInfo.maxthon = true: 
		/TencentTraveler/i.test(ua)? oInfo.tt = true: 
		/TheWorld/i.test(ua)? oInfo.theWorld = true: 
		/360[S|E]E/i.test(ua)? oInfo.is360 = true: 0;
	}
	/**
	 * 分析浏览器flash版本
	 * @method _fParseFlash
	 * @param {void}
	 * @return {void}
	 */
	function _fParseFlash(){
		var flashVersion;
		try{
			// 如果是ie浏览器
			if(oInfo.ie){
				// 创建一个activeobject
				var oFlash = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
				if(oFlash){
					flashVersion = oFlash.getVariable("$version").split(" ")[1];
				}
			// 其他浏览器
			}else{
				if(navigator.plugins && navigator.plugins.length > 0){
					var oFlash=navigator.plugins["Shockwave Flash"];
					if(oFlash){
						var aInfo = oFlash.description.split(" ");
						for(var i=0,m=aInfo.length;i<m;i++){
							if(parseInt(aInfo[i])>0){
								flashVersion = aInfo[i];
								break;
							}
						}
					}
				}
			}
		}catch(e){
		}
		oInfo.flash = !!flashVersion?flashVersion:null;
	}
	
	_fInit();
	return Browser;
	
});