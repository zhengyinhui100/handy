/**
 * 支持类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
define('B.Support','L.Browser',function(Browser){
	
	
	var Support={
//		testSvg               : fTestSvg          //检查是否支持svg
		perf                  : fPerf,            //返回设备性能等级，用于移动设备，分为'low'，'middle'，'high'
		testPerf              : fTestPerf,        //测试硬件性能
		ifSupportStyle        : fIfSupportStyle,  //检测样式是否支持
		normalizeEvent        : fNormalizeEvent,  //获取前缀正确的事件名
		mediaQuery            : fMediaQuery       //检查设备并添加class
	}
	
	var _oDoc=document;
	//性能级别
	var _sPerf;
	//准确的事件名称
	var _oNormalizeEvents={
		'animationEnd':1,
		'transitionEnd':1
	};
	var _sPrifix;
	Support.mediaQuery();
	
//	var _supportSvg; //标记是否支持svg
	
	//解决IE6下css背景图不缓存bug
	if(Browser.ie()==6){   
	    try{   
	        _oDoc.execCommand("BackgroundImageCache", false, true);   
	    }catch(e){}   
	}  
	/**
	 * 检查是否支持svg
	 * @param {function(boolean)} fCall 回调函数，如果支持svg则回调参数为true，反之则为false
	 
	function fTestSvg(fCall) {
		if(_supportSvg!=undefined){
			fCall(_supportSvg);
			return;
		}
		//this method is from jquery mobile 1.4.0
		// Thanks Modernizr & Erik Dahlstrom
		var w = window,
		//opera 通过createElementNS方式检测的确不准
			bSvg = !!w._oDoc.createElementNS && !!w._oDoc.createElementNS( "http://www.w3.org/2000/svg", "svg" ).createSVGRect && !( w.opera && navigator.userAgent.indexOf( "Chrome" ) === -1 ),
			support = function( data ) {
				if ( !( data && bSvg ) ) {
					_supportSvg=false;
				}else{
					_supportSvg=true;
				}
				fCall(_supportSvg);
			},
			img = new w.Image();
	
		img.onerror = function() {
			support( false );
		};
		img.onload = function() {
			support( img.width === 1 && img.height === 1 );
		};
		img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
	}
	*/
	/**
	 * 返回设备性能等级，用于移动设备，分为'low'，'middle'，'high'
	 * @return {string} low表示低性能设备，middle表示中等设备，high表示高性能设备
	 */
	function fPerf(){
		if(_sPerf){
			return _sPerf;
		}
		var nScreenWidth=Math.max(_oDoc.body?_oDoc.body.clientWidth:0,window.screen.width);
		var sAndVersion=Browser.android();
		if(Browser.ios()||nScreenWidth>600||(sAndVersion>4.2&&nScreenWidth>500)){
			_sPerf= 'high';
		}else if(sAndVersion>=4&&nScreenWidth>450){
			_sPerf= 'middle';
		}else{
			_sPerf= 'low';
		}
		return _sPerf;
	}
	//TODO
	/**
	 * 测试硬件性能
	 */	
	function fTestPerf(){
		var now = Date.now();
		for(var i = 0; i < 1e9; i++) {
			new Object().toString();
		}
		var performance = 1 / (Date.now() - now);
		$D.log(performance);
	}
	/**
	 * 检测样式是否支持
	 * @param{string}sName 样式名
	 * @param{string}sValue 属性值
	 * @return{boolean} false表示不支持，如果支持，返回对应的样式名（可能有前缀）
	 */
	function fIfSupportStyle(sName,sValue){
		var oEl = _oDoc.createElement('div');
		var sProp;
		var aVendors = 'webkit ms Khtml O Moz '.split(' '),
 		len = aVendors.length;
		sName = sName.substring(0,1).toUpperCase()+sName.substring(1);
		while(len--) {
			if ( aVendors[len] + sName in oEl.style ) {
			    sProp=aVendors[len] + sName;
			    break;
			}
		}
		if(sProp){
			if(sValue===undefined){
				return sProp;
			}
		    oEl.style[sProp] = sValue;
			var sNew=oEl.style[sProp];
			//一些样式设置后会带有空格，如：transform='translate3d(0px, 0px, 0px)'
		    return  sNew.replace(/\s/g,'')=== sValue?sProp:false;
		}
	    return false;
	}
	/**
	 * 获取前缀正确的事件名
	 * @param {string}sEvent 事件名称
	 * @return {string} 返回正确的名称
	 */
	function fNormalizeEvent(sEvent){
		var sNormal=_oNormalizeEvents[sEvent];
		if(!sNormal){
			return sEvent;
		}
		if(sNormal==1){
			if(_sPrifix===undefined){
				var aVenders=['webkit','','o'];
				var oEl = _oDoc.createElement('div');
				var _sPrifix;
				for(var i=0;i<aVenders.length;i++){
					if(oEl.style[aVenders[i]+'TransitionProperty']!== undefined){
						_sPrifix=aVenders[i];
						break;
					}
				}
			}
			sNormal=_oNormalizeEvents[sEvent]=_sPrifix?(_sPrifix+sEvent.substring(0,1).toUpperCase()+sEvent.substring(1)):sEvent.toLowerCase();
		}
		return sNormal;
	}
	/**
	 * 检查设备并添加class
	 */
	function fMediaQuery(){
		var sCls='';
		if(Browser.mobile()){
			sCls="hui-mobile";
		}else{
			sCls="hui-pc";
			var ie=Browser.ie();
			if(ie){
				sCls+=' ie'+ie;
			}
		}
		if(Browser.ios()){
			sCls+=' hui-ios';
		}
		if(Browser.phone()){
			sCls+=' hui-phone';
		}
		if(Browser.tablet()){
			sCls+=' hui-tablet';
		}
		_oDoc.documentElement.className+=" "+sCls+" hui";
	}
	
	return Support;
	
});