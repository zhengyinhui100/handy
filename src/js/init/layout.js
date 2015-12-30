/*
 * 初始化viewport，通过自动计算默认字体大小(1em)来显示应用，让设备使用最佳分辨率进行显示
 */
 
;(function(oWin){
	
	var _sUa=navigator.userAgent,
	_bIsMobile=/mobile/i.test(_sUa),
	_docEl=document.documentElement,
	_eHead=document.head ||document.getElementsByTagName('head')[0] ||document.documentElement;
	
	var Layout={
		init          : fInit,
		initViewport  : fInitViewport,
		setFontsize   : fSetFontsize
	}
	
	function _fAddMeta(sName,sContent){
		var oMeta = document.createElement('meta');
		oMeta.setAttribute('name', sName);
		oMeta.setAttribute('content',sContent);
		_eHead.appendChild(oMeta);
	}
	/**
	 * 
	 */
	function fInit(){
		Layout.initViewport();
	}
	/**
	 * 初始化viewport，通过自动计算默认字体大小(1em)来显示应用，让设备使用最佳分辨率进行显示
	 */
	function fInitViewport() {
		oWin.gZoom=1;
		oWin.gFontSize=16;
		console.log(document.documentElement.getBoundingClientRect().width)
		if(_bIsMobile){
			var sViewPort='user-scalable=no';
			//Android浏览器中添加了initial-scale、width等属性后宽度会变成viewport一般宽度344，
			//而qq手机浏览器等在没设置时宽度是viewport宽度360，所以这里以此条件(_docEl.clientWidth<=450)判断要不要加viewport相关属性
			//TODO:qq浏览器中有时还是不能以最高分辨率显示
			//但是在微博和易信内嵌webview里则例外，必须设置viewport，否则页面会有横向滚动条
			if(_docEl.clientWidth<=450||/(weibo|yixin)/i.test(_sUa)||/windows phone/i.test(_sUa)){
				//web中加上无法显示最高分辨率
				sViewPort+=',initial-scale=1,maximum-scale=1,minimum-scale=1,width=device-width,height=device-height,target-densitydpi=device-dpi';
			}
			var sViewPort='width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0,user-scalable=no';
			_fAddMeta('viewport',sViewPort);
			
			Layout.setFontsize();
			oWin.addEventListener('orientationchange',function(){
				setTimeout(Layout.setFontsize,0);
			});
		}
	}
	
	/**
	 * 窗口发生变化时(旋转，全屏等)，修正viewport
	 */
	function fSetFontsize(){
		//计算默认字体大小
		var nOrigWidth=_docEl.clientWidth;
		var dpr=oWin.devicePixelRatio||1;
		//使用screen.width有时会不准确，比如Android上的chrome36，小米3数值是360
		//var nOrigWidth=oWin.screen.width;
		//屏幕宽高比
		var nScale=oWin.screen.width/oWin.screen.height;
		//是否竖屏
		var nOrient=oWin.orientation;
		//在chrome上模拟移动设备时，oWin.orientation=undefined，所以增加判断条件nScale<1
		var bPortrait=nOrient===0||nOrient===180||(nOrient===undefined&&nScale<1);
		//ios浏览器中，不管横屏还是竖屏，oWin.screen.width和window.screen.height都是固定的
		if(!bPortrait&&nScale<1){
			nScale=1/nScale;
		}
		//平板
		if((/ Mobile\//.test(_sUa) && /iPad/.test(_sUa))
		||(/Android/i.test(_sUa))&&!/Mobile/.test(_sUa)){
			var nActWidth=bPortrait?600:600*nScale;
			gZoom=nOrigWidth/(nOrigWidth>nActWidth?nActWidth:nOrigWidth);
		}else{
			//手机
			var nActWidth=bPortrait?360:360*nScale;
			gZoom=nOrigWidth/(nOrigWidth>nActWidth?nActWidth:nOrigWidth);
		}
		//通知zepto touch，事件边界检测
		oWin.fixDevicePixelRatio=gZoom;
		var nNewSize=Math.ceil(gZoom*16);
		if(gFontSize!=nNewSize){
			gFontSize=nNewSize;
//			alert(nOrient+"\n"+oWin.screen.width+";"+oWin.screen.height+"\n"+_docEl.clientWidth+";"+nActWidth+";"+gFontSize);
			_docEl.style.fontSize=gFontSize+"px";
		}
	}
	
	Layout.init();
	
})(window)