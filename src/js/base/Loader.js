/**
 * 资源加载类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * 
 */
handy.add("Loader",
["handy.base.Debug","handy.base.Object","handy.base.Function"],
function(Debug,Object,Function,$H){
	
	var _RESOURCE_NOT_FOUND= 'Resource not found: ',
		_eHead=document.head ||document.getElementsByTagName('head')[0] ||document.documentElement,
		_UA = navigator.userAgent,
        _bIsWebKit = _UA.indexOf('AppleWebKit'),
    	_aContext=[],         //请求上下文堆栈
	    _oCache={};           //缓存
	
	var Loader= {
		traceLog                : true,                     //是否打印跟踪信息
//		rootPath                : {
//			'handy'        : 'http://localhost:8081/handy/src',
//			'com.example'  : 'http://example.com:8082/js'
//		},                       //根url，根据命名空间前缀匹配替换，如果没有匹配则是空字符串''；如果rootPath是字符串则直接使用
		timeout                 : 15000,
		skinName                : 'skin',                   //皮肤名称，皮肤css的url里包含的字符串片段，用于检查css是否是皮肤
//		urlMap                  : {
//			'example':{
//				url       : 'http://url',     //url
//				chkExist  : function(){return true}    //验证此资源是否存在的方法
//			}
//		},                       //自定义资源配置   
		
	    showLoading				: function(bIsLoading){},	//加载中的提示，由具体逻辑重写
		define                  : fDefine,                  //定义资源资源
	    require                 : fRequire                  //获取所需资源后执行回调
	}
	
     /**
	 * 检查对应的资源是否已加载
	 * @method _fChkExisted
	 * @param {string|Array}id 被检查的资源id
	 * @return {boolean}返回true表示该资源已经被加载
	 */
    function _fChkExisted(id){
    	function _fChk(sId){
    		//css和js文件只验证是否加载完
    		if(/\.(css|js)$/.test(sId)){
    			return _oCache[sId]&&_oCache[sId].status=='loaded';
    		}else if(Loader.urlMap&&Loader.urlMap[sId]){
    			//自定义资源使用自定义方法验证
    			return Loader.urlMap[sId].chkExist();
    		}else{
    			//标准命名空间规则验证
	    		return Object.namespace(sId);
    		}
    	}
    	if(typeof id=="string"){
    		return _fChk(id);
    	}
    	var aExist=[];
    	for(var i=0,nLen=id.length;i<nLen;i++){
    		var result=_fChk(id[i]);
    		if(!result){
    			return false;
    		}else{
    			aExist.push(result);
    		}
    	}
    	return aExist;
    }
    
    /**
	 * 通过id获取实际url
	 * @method _fGetUrl
	 * @param {string}sId 资源id，可以是命名空间，也可以是url
	 * @return {string}sUrl 实际url
	 */
    function _fGetUrl(sId){
    	var sUrl=Loader.urlMap&&Loader.urlMap[sId]&&Loader.urlMap[sId].url;
    	if(!sUrl){
    		var sRoot='';
    		var rootPath=Loader.rootPath;
    		if(typeof rootPath=='string'){
    			sRoot=rootPath;
    		}else if(typeof rootPath=="object"){
	    		for(var prifix in rootPath){
	    			if(sId.indexOf(prifix)==0){
	    				sRoot=rootPath[prifix];
	    				sId=sId.replace(prifix,'');
	    			}
	    		}
    		}else{
    			sRoot="";
    		}
    		//css文件
    		if(/.css$/.test(sId)){
    			sUrl=sId.indexOf('/')==0?sId:"/css/"+sId;
    		}else if(/.js$/.test(sId)){
    			//js文件
    			sUrl=sId;
    		}else{
    			//命名空间
    			sUrl=sId.replace(/\./g,"/")+".js";
    		}
    		if(sUrl.indexOf('/')!=0){
    			sUrl='/'+sUrl;
    		}
    		sUrl=sRoot+sUrl;
    	}
		return sUrl;
    }
	/**
	 * 获取js脚本
	 * @method _getScript
	 * @param {string}sUrl 请求url
	 * @param {function()}fCallback 回调函数
	 */
    function _fGetScript(sUrl,fCallback) {
    	var eScript=document.createElement("script");
    	//脚本相对于页面的其余部分异步地执行(当页面继续进行解析时，脚本将被执行)
    	eScript.async = "async";
    	eScript.src=sUrl;
    	eScript.type="text/javascript";
    	_fAddOnload(eScript,fCallback);
		_eHead.appendChild(eScript);
		if(Loader.traceLog){
			Debug.info("Loader request:"+sUrl);
   		}
	}
	/**
	 * 获取css
	 * @method _getCss
	 * @param {string}sUrl 请求url
	 * @param {function()}fCallback 回调函数
	 */
    function _fGetCss(sUrl,fCallback) {
    	var aStyles=_eHead.getElementsByTagName("link");
    	//检查是否已经加载，顺便获取皮肤节点
    	for(var i=0;i<aStyles.length;i++){
    		var sHref=aStyles[i].href;
    		if(!Loader.skinNode&&sHref.indexOf(Loader.skinName)>=0){
    			Loader.skinNode=aStyles[i];
    		}
    		//如果已经加载了，直接返回
    		if(sHref.indexOf(sUrl)>=0||sUrl.indexOf(sHref)>=0){
    			return;
    		}
    	}
    	var eCssNode=document.createElement("link");
    	eCssNode.rel="stylesheet";
    	eCssNode.href=sUrl;
    	_fAddOnload(eCssNode,fCallback);
    	//插入到皮肤css之前
    	_eHead.insertBefore(eCssNode,Loader.skinNode);
    	if(Loader.traceLog){
			Debug.info("Loader request:"+sUrl);
   		}
	}
	/**
	 * 为css/script资源添加onload事件，包含超时处理
	 * @method _fAddOnload
	 * @param {element}eNode 节点
	 * @param {function()}fCallback 回调函数
	 */
	function _fAddOnload(eNode,fCallback){
		//onload回调函数
	    function _fCallback() {
	      if (!_fCallback.isCalled) {
	        _fCallback.isCalled = true;
	        clearTimeout(nTimer);
	        fCallback();
	      }
	    }
	    
		if (eNode.nodeName === 'SCRIPT') {
	       _fScriptOnload(eNode, _fCallback);
	    } else {
	       _fStyleOnload(eNode, _fCallback);
	    }
	
	    //超时处理
	    var nTimer = setTimeout(function() {
	      Debug.error('Time is out:', eNode.src);
	      _fCallback();
	    }, Loader.timeout);
	
	}
	/**
	 * script资源onload函数
	 * @method _fScriptOnload
	 * @param {element}eNode 节点
	 * @param {function()}fCallback 回调函数
	 */
	function _fScriptOnload(eNode, fCallback) {
		eNode.onload = eNode.onerror = eNode.onreadystatechange = function() {
			if (/loaded|complete|undefined/.test(eNode.readyState)) {
				// 保证只运行一次回调
				eNode.onload = eNode.onerror = eNode.onreadystatechange = null;
//				//TODO 防止内存泄露
//				if (eNode.parentNode) {
//					try {
//						if (eNode.clearAttributes) {
//							eNode.clearAttributes();
//						} else {
//							Chrome下这里执行后eNode回变为“TypeError”，原因暂不明
//							for (var p in eNode){
//								console.log(p)
//								if(eNode=="TypeError")Debug.debug();
//								delete eNode[p];
//							}
//						}
//					} catch (e) {
//						Debug.error("Loader script onload:"+e.message);
//					}
//				}
				// 移除标签
				_eHead.removeChild(eNode);
				eNode = null;
				// IE10下新加载的script会在此之后才执行，所以此处需延迟执行
				setTimeout(fCallback, 0);
			}
		};
		// 注意:在opera下，当文件是404时，不会发生任何事件，回调函数会在超时的时候执行
	}
	/**
	 * css资源onload函数
	 * 
	 * @method _fStyleOnload
	 * @param {element}eNode
	 *            节点
	 * @param {function()}fCallback
	 *            回调函数
	 */
	function _fStyleOnload(eNode, fCallback) {
	    // IE6-9 和 Opera
	    if (window.hasOwnProperty('attachEvent')) { // see #208
		    eNode.attachEvent('onload', fCallback);
		    // 注意:
		    // 1. 在IE6-9下，当文件是404时，onload会被触发，但是在这种情况下，opera下不会被出发，只会出发超时处理；
		    // 2. onerror事件在所有浏览器中均不会触发
	    }else {
	    //Firefox, Chrome, Safari下，采用轮询
	    	//在eNode插入后开始
	        setTimeout(function() {
	        	_fPollStyle(eNode, fCallback);
	      	}, 0); 
	    }
	
	}
	/**
	 * css资源轮询检测
	 * @method _fPollStyle
	 * @param {element}eNode 节点
	 * @param {function()}fCallback 回调函数
	 */
	function _fPollStyle(eNode, fCallback) {
	    if (fCallback.isCalled) {
	        return;
	    }
	    var bIsLoad;
	    if (_bIsWebKit) {
	        if (eNode['sheet']) {
	        	bIsLoad = true;
	        }
	    } else if (eNode['sheet']) {
	    // Firefox
	        try {
	            if (eNode['sheet'].cssRules) {
	          		bIsLoad = true;
	            }
	        } catch (ex) {
	            if (ex.name === 'SecurityError' || // firefox >= 13.0
	                ex.name === 'NS_ERROR_DOM_SECURITY_ERR') { // 旧的firefox
	         	    bIsLoad = true;
	            }
	        }
	    }
	
	    setTimeout(function() {
	        if (bIsLoad) {
	            // 把callback放在这里是因为要给时间给渲染css
	            fCallback();
	        } else {
	            _fPollStyle(eNode, fCallback);
	        }
	    }, 1);
	}
    /**
	 * 请求资源
	 * @method _fRequest
	 * @param {Array}aRequestIds 需要加载的资源id数组
	 */
    function _fRequest(aRequestIds){
    	var bNeedRequest=false;
    	for(var i=0,nLen=aRequestIds.length;i<nLen;i++){
    		var sId=aRequestIds[i];
    		//不处理已经在请求列表里的资源
    		if(!_oCache[sId]){
	    		var sUrl=_fGetUrl(sId);
    			bNeedRequest=true;
	    		_oCache[sId]={
					id:sId,
					status:'loading'
				}
				var _fCallback=Function.bind(_fResponse,null,sId);
	    		if(/.css$/.test(sUrl)){
	    			_fGetCss(sUrl,_fCallback);
	    		}else{
	    			_fGetScript(sUrl,_fCallback) ;
	    		}
    		}
    	}
    	//提示loading
    	if(bNeedRequest){
    		Loader.showLoading(true);
    	}
    }
    /**
	 * 资源下载完成回调
	 * @method _fResponse
	 * @param {string}sId 资源id
	 */
    function _fResponse(sId){
    	Loader.showLoading(false);
    	_oCache[sId].status='loaded';
    	//每次回调都循环上下文列表
   		for(var i=_aContext.length-1;i>=0;i--){
	    	var oContext=_aContext[i];
	    	var aExists=_fChkExisted(oContext.deps);
	    	if(aExists){
	    		_aContext.splice(i,1);
	    		oContext.callback.apply(null,aExists);
	    	}
   		}
   		if(Loader.traceLog){
			Debug.info("Loader Response: "+sId);
   		}
    }
    /**
	 * 定义loader资源
	 * @method define(sId,aDeps=,factory)
	 * @param {string}sId   资源id，可以是id、命名空间，也可以是url地址（如css）
	 * @param {Array=}aDeps  依赖的资源
	 * @param {*}factory  资源工厂，可以是函数，也可以是字符串模板
	 * @return {number}nIndex 返回回调索引
	 */
	function fDefine(sId,aDeps,factory){
		var nLen=arguments.length;
		if(nLen==2){
			factory=aDeps;
			aDeps=[];
		}
		Loader.require(aDeps,function(){
			var resource;
			if(typeof factory=="function"){
				try{
					//考虑到传入依赖是数组，这里回调参数形式依然是数组
					resource=factory.apply(null,arguments);
				}catch(e){
					//资源定义错误
					Debug.error("Loader "+sId+":factory define error:"+e.message);
					return;
				}
			}else{
				resource=factory;
			}
			Object.namespace(sId,resource);
		});
	}
    /**
	 * 加载所需的资源
	 * @method require(id,fCallback=)
	 * @param {string|array}id    资源id（数组）
	 * @param {function()=}fCallback(可选) 回调函数
	 * @return {any}返回最后一个当前已加载的资源，通常用于className只有一个的情况，这样可以立即通过返回赋值
	 */
    function fRequire(id,fCallback){
    	var aIds=typeof id=="string"?[id]:id;
    	//此次required待请求资源数组
    	var aRequestIds=[];
    	//已加载的资源
    	var aExisteds=[];
    	//是否保存到上下文列表中，保证callback只执行一次
    	var bNeedContext=true;
    	for(var i=0,nLen=aIds.length;i<nLen;i++){
    		var sId=aIds[i];
    		var oExisted=_fChkExisted(sId);
    		if(!oExisted){
    			//未加载资源放进队列中
    			aRequestIds.push(sId);
    			if(bNeedContext){
    				bNeedContext=false;
	    			_aContext.push({
	    				deps      : aIds,
	    				callback  : fCallback
	    			});
    			}
    			if(Loader.traceLog){
					Debug.info(_RESOURCE_NOT_FOUND+sId);
		   		}
    		}else{
    			aExisteds.push(oExisted);
    		}
    	}
    	
    	//没有需要加载的资源，直接执行回调或返回资源
    	if(aRequestIds.length==0){
    		fCallback&&fCallback.apply(null,aExisteds);
    		return aExisteds.length==0?aExisteds[0]:aExisteds;
    	}else{
    		//请求资源
    		_fRequest(aRequestIds);
    	}
    }
    
    return Loader;
	
})