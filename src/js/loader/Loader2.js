/**
 * 资源加载类
 * PS：对于循环引用，这里的处理方式是把其中一个资源的循环依赖忽略掉，比如：
 * 1、define('a',['b','c'],function(b,c){});
 * 2、define('b',['a','d'],function(a,d){});
 * Loader检测到循环依赖，会在第二句执行时忽略依赖项a是否已加载，直接以{}替换a，从而使代码继续执行下去，
 * 这时候需要在b模块里异步require('a')来真正使用a模块。
 * 但是,我们应该尽量避免出现显示的循环依赖，遇到相互引用的情况，先尽可能的将依赖后置，
 * 既尽可能使用运行时异步require的方式引入依赖，已化解模块定义时的循环引用
 * 实际上，终归要采用依赖后置才能解决相互引用的问题，我们应该避免显示的相互引用，所以只在的开发模式下检查相互引用以提升性能
 * PS：模块里的同步require('a')方法的依赖会被提取到模块定义时的依赖列表里，如果不希望被提取，可以采用$H.ns方法，
 * 或者var id='a';var a=require(id)的方式
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
define("L.Loader",
["L.Debug"],
function(Debug){
	
	var bIsDev=$H.isDev;
	
	var Loader= {
		traceLog                : false,                     //是否打印跟踪信息
		combine                 : !bIsDev,                   //是否合并请求
		isMin                   : false,                     //是否请求*.min.css和*.min.js
		parseCycle              : false,                     //是否处理循环引用，这里建议不开启或者只在开发模式下开启
		rootPath                : {
			'handyRoot'    : '../../',
			'handy'        : '../'
//			'com.example'  : 'http://example.com:8082/js'
		},                       //根url，根据命名空间前缀匹配替换，如果没有匹配则是空字符串''；如果rootPath是字符串则直接使用
		timeout                 : 15000,
		skinName                : 'skin',                   //皮肤名称，皮肤css的url里包含的字符串片段，用于检查css是否是皮肤
//		sourceMap               : {
//			'example':{
//				url       : 'http://url',     //url
//				chkExist  : function(){return true}    //验证此资源是否存在的方法
//			}
//		},                       //自定义资源配置   
		
	    showLoading				: function(bIsLoading){},	//加载中的提示，由具体逻辑重写
		define                  : fDefine,                  //定义资源资源
	    require                 : fRequire                  //获取所需资源后执行回调
	}
	
	var _LOADER_PRE='[Handy Loader] ',
		_RESOURCE_NOT_FOUND= _LOADER_PRE+'not found: ',
		_eHead=document.head ||document.getElementsByTagName('head')[0] ||document.documentElement,
		_UA = navigator.userAgent,
        _bIsWebKit = _UA.indexOf('AppleWebKit'),
    	_modules=[],          //模块缓存
    	/**
    	 * {
    	 * 		{string}id:模块id,
    	 * 		{*}factory:模块工厂(函数),
    	 * 		{array}args:模块工厂函数执行参数,
    	 * 		{string}status:模块状态：loading(正在加载中)、loaded(已加载)、ready(可以初始化)、inited(已初始化),
    	 * 		{}
    	 * }
    	 */
    	_requestingNum=0,     //正在请求(还未返回)的数量
	    _oExistedCache={};    //已存在的资源缓存，加速读取
	    
	window.define=Loader.define;
	window.require=Loader.require;
	
	/**
	 * 缓存请求上下文
	 * @param {object}oContext 上下文参数{
	 * 		{string} id: 模块id
	 * 		{array} deps: 依赖资源
	 * 		{function} callback: 回调
	 * }
	 */
	function _fSaveContext(oContext){
		_modules[oContext.id]=oContext;
	    _modules.push(oContext);
	}
	/**
	 * 检查是否有循环依赖
	 * @param {string} sId 要检查的id
	 * @param {string=}sDepId 被检查依赖的id，仅用于内部递归的时候
	 * @param {object=}oChked 保存已递归检查的属性，避免死循环，仅用于内部递归的时候
	 * @return {boolean=} 如果有循环依赖返回true
	 */
	function _fChkCycle(sId,sDepId,oChked){
		var sCurId=sDepId||sId;
		var oRefContext=_modules[sCurId];
		var aRefDeps=oRefContext&&oRefContext.deps;
		if(!aRefDeps){
			return;
		}
		oChked=oChked||{};
		for(var i=0,len=aRefDeps.length;i<len;i++){
			sDepId=aRefDeps[i];
			if(sDepId==sId){
				//有循环引用
				Debug.warn(_LOADER_PRE+'cycle depend:'+sCurId+" <=> "+sId);
				return {};
			}else if(!oChked[sDepId]){
				oChked[sDepId]=1;
				//递归检查间接依赖
				var result=_fChkCycle(sId,sDepId,oChked);
				if(result){
					return result;
				}
			}
		}
	}
     /**
	 * 检查对应的资源是否已加载，只要检测到一个不存在的资源就立刻返回
	 * @param {string|Array}id 被检查的资源id
	 * @param {boolean=}bChkCycle 仅当为true时检查循环引用
	 * @return {Object}  {
	 * 		{Array}exist: 存在的资源列表
	 * 		{string}notExist: 不存在的资源id
	 * }
	 */
    function _fChkExisted(id,bChkCycle){
    	var oResult={}
    	var aExist=[];
    	var aNotExist=[];
    	if(typeof id=="string"){
    		id=[id];
    	}
    	for(var i=0,nLen=id.length;i<nLen;i++){
    		var sId=id[i];
    		var result=_oExistedCache[sId];
    		if(!result){
				//css和js文件只验证是否加载完
    			var oModule=_modules[sId];
				if(/\.(css|js)/.test(sId)){
					result= oModule&&oModule.status=='loaded';
				}else if(Loader.sourceMap&&Loader.sourceMap[sId]){
					//自定义资源使用自定义方法验证
					result= Loader.sourceMap[sId].chkExist();
				}else{
					//标准模块
//		    		result= $H.ns({path:sId});
		    		if(oModule.status.inited){
						result=oModule.exports;		    			
		    		}else if(oModule.status.ready){
						result=_fInitModule(oModule);
					}
				}
				if(result===undefined&&bChkCycle){
					//如果有循环依赖，将当前资源放入已存在的结果中，避免执行不下去
					result=_fChkCycle(sId);
				}
				_oExistedCache[sId]=result;
    		}
    		if(!result){
    			aNotExist.push(sId);
    		}else{
    			aExist.push(result);
    		}
    	}
    	oResult.exist=aExist;
    	oResult.notExist=aNotExist;
    	return oResult;
    }
    /**
     * 初始化模块
     */
    function _fInitModule(oModule){
    	var resource;
		if(typeof factory=="function"){
			try{
				if(Loader.traceLog){
					Debug.log(_LOADER_PRE+"define:\n"+sId);
				}
				//考虑到传入依赖是数组，这里回调参数形式依然是数组
				resource=factory.apply(null,arguments);
			}catch(e){
				//资源定义错误
				e.message=_LOADER_PRE+sId+":\nfactory define error:\n"+e.message;
				Debug.error(e);
				return;
			}
		}else{
			resource=factory;
		}
		oModule.status.inited=true;
		
		if(resource){
			$H.ns(sRealId,resource);
			oModule.exports=resource;
			//添加命名空间元数据
			var sType=typeof resource;
			if(sType=="object"||sType=="function"){
				resource.$ns=sId;
				resource.$rns=sRealId;
			}
		}else{
			Debug.warn(_LOADER_PRE+'factory no return:\n'+sId);
		}
		return resource;
    }
    /**
	 * 通过id获取实际url
	 * @param {string}sId 资源id，可以是命名空间，也可以是url
	 * @return {string}sUrl 实际url
	 */
    function _fGetUrl(sId){
    	//url直接返回
    	if(/^(\w+:\/\/)/.test(sId)){
    		return sId;
    	}
    	var sUrl=Loader.sourceMap&&Loader.sourceMap[sId]&&Loader.sourceMap[sId].url;
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
    		if(/\.css$/.test(sId)){
    			sUrl=sId.indexOf('/')==0?sId:"/css/"+sId;
    		}else if(/\.js$/.test(sId)){
    			//js文件
    			sUrl=sId;
    		}else{
    			//命名空间
    			sUrl=sId.replace(/\./g,"/")+".js";
    		}
    		sUrl=sRoot.replace(/\/$/,'')+'/'+sUrl.replace(/^\//,'');
    	}
		if(Loader.isMin){
			sUrl=sUrl.replace(/\.(css|js)$/,'.min.$1');
		}
		return sUrl;
    }
	/**
	 * 获取js脚本
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
	}
	/**
	 * 获取css
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
    	if(Loader.skinNode){
	    	//插入到皮肤css之前
	    	_eHead.insertBefore(eCssNode,Loader.skinNode);
    	}else{
    		//没有皮肤css，直接加到最后
    		_eHead.appendChild(eCssNode);
    	}
	}
	/**
	 * 为css/script资源添加onload事件，包含超时处理
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
	      Debug.error('Time is out:'+ eNode.src);
	      _fCallback();
	    }, Loader.timeout);
	
	}
	/**
	 * script资源onload函数
	 * @param {element}eNode 节点
	 * @param {function()}fCallback 回调函数
	 */
	function _fScriptOnload(eNode, fCallback) {
		var _fCall=function() {
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
//								if(eNode=="TypeError")Debug.debug();
//								delete eNode[p];
//							}
//						}
//					} catch (e) {
//						Debug.error("Loader script onload:"+e.message,e);
//					}
//				}
				// 移除标签
				//_eHead.removeChild(eNode);
				eNode = null;
				// IE10下新加载的script会在此之后才执行，所以此处需延迟执行
				setTimeout(fCallback, 0);
			}
		};
		eNode.onload  = eNode.onreadystatechange = _fCall;
		eNode.onerror=function(){
			Debug.error(_LOADER_PRE+'load script error:\n'+eNode.src);
			_fCall();
		}
		// 注意:在opera下，当文件是404时，不会发生任何事件，回调函数会在超时的时候执行
	}
	/**
	 * css资源onload函数
	 * 
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
	 * @param {Array}aRequestIds 需要加载的资源id数组
	 */
    function _fRequest(aRequestIds){
    	var bNeedRequest=false;
    	var bCombine=Loader.combine,
    	oCombineJs={},
    	oCombineCss={};
    	for(var i=0,nLen=aRequestIds.length;i<nLen;i++){
    		var sId=aRequestIds[i];
    		//不处理已经在请求列表里的资源
    		if(!_modules[sId]){
	    		var sUrl=_fGetUrl(sId);
    			bNeedRequest=true;
	    		_modules[sId]={
					id:sId,
					status:'loading'
				}
				if(!bCombine){
					var _fCallback=(function(id){
						return function(){
							_fResponse(id);
						}
					})(sId);
		    		if(Loader.traceLog){
						Debug.log(_LOADER_PRE+"request:\n"+sUrl);
			   		}
		    		if(/\.css/.test(sUrl)){
		    			_fGetCss(sUrl,_fCallback);
		    		}else{
		    			_fGetScript(sUrl,_fCallback) ;
		    		}
		    		_requestingNum++;
				}else{
					//按照域名整理js和css
					var host=sUrl.match(/([^:]+:\/\/)?[^/]+\/?/);
					host=host&&host[0]||'';
					var sUri=sUrl.substring(host.length);
					if(/\.css/.test(sUrl)){
						var oCss=oCombineCss[host];
		    			if(!oCss){
							oCss=oCombineCss[host]={ids:[],uris:[]};
						}
						oCss.ids.push(sId);
						oCss.uris.push(sUri);
		    		}else{
		    			var oJs=oCombineJs[host];
		    			if(!oJs){
							oJs=oCombineJs[host]={ids:[],uris:[]};
						}
						oJs.ids.push(sId);
						oJs.uris.push(sUri);
		    		}
				}
    		}
    	}
    	//合并请求
    	var _fCmbRequest=function(oCombine){
    		for(var host in oCombine){
				var oItem=oCombine[host];
				var aUris=oItem.uris;
    			var _fCallback=(function(aIds){
    				return function(){
	    				_fResponse(aIds);
    				}
    			})(oItem.ids)
    			var sUrl=host+(aUris.length>1?('??'+aUris.join(',')):aUris[0]);
	    		if(Loader.traceLog){
					Debug.log(_LOADER_PRE+"request:\n"+sUrl);
		   		}
		   		_fGetScript(sUrl,_fCallback) ;
		   		_requestingNum++;
			}
    	}
    	//提示loading
    	if(bNeedRequest){
    		if(bCombine){
    			_fCmbRequest(oCombineJs);
    			_fCmbRequest(oCombineCss);
    		}
    		Loader.showLoading(true);
    	}
    }
    /**
	 * 资源下载完成回调
	 * @param {string|array}id 资源id或数组
	 */
    function _fResponse(id){
    	Loader.showLoading(false);
    	_requestingNum--;
    	id=typeof id==='string'?[id]:id;
    	//标记资源已加载
    	for(var i=0;i<id.length;i++){
	    	_modules[id[i]].status='loaded';
    	}
    	if(Loader.traceLog){
			Debug.log(_LOADER_PRE+"Response:\n"+id.join('\n'));
   		}
    	_fExecContext();
    }
    /**
     * 执行上下文
     */
    function _fExecContext(){
    	//每次回调都循环上下文列表
   		for(var i=_modules.length-1;i>=0;i--){
	    	var oContext=_modules[i];
	    	var oResult=_fChkExisted(oContext.deps,Loader.parseCycle);
	    	if(oResult.notExist.length===0){
	    		_modules.splice(i,1);
	    		oContext.callback.apply(null,oResult.exist);
	    		//定义成功后重新执行上下文
	    		_fExecContext();
	    		break;
	    	}else if(i==0&&_requestingNum==0){
	    		//输出错误分析
	    		for(var i=_modules.length-1;i>=0;i--){
	    			var oContext=_modules[i];
	    			var oResult=_fChkExisted(oContext.deps,true);
	    			var aNotExist=oResult.notExist;
	    			var bHasDepds=false;
	    			for(var j=_modules.length-1;j>=0;j--){
	    				var sId=_modules[j].id;
	    				for(var k=aNotExist.length-1;k>=0;k--){
	    					if(aNotExist[k]===sId){
		    					bHasDepds=true;
		    					break;
	    					}
	    				}
	    				if(bHasDepds){
	    					break;
	    				}
	    			}
	    			if(!bHasDepds){
						Debug.error(_RESOURCE_NOT_FOUND+oContext.id);
	    			}
    				Debug.warn(_LOADER_PRE+oContext.id);
    				Debug.warn(_LOADER_PRE+"----notExist : "+oResult.notExist);
	    		}
	    		Debug.error(_RESOURCE_NOT_FOUND+oResult.notExist);
	    	}
   		}
    }
    /**
	 * 定义loader资源
	 * @method define(sId,deps=,factory)
	 * @param {string}sId   资源id，可以是id、命名空间，也可以是url地址（如css）
	 * @param {Array|string=}deps  依赖的资源
	 * @param {*}factory  资源工厂，可以是函数，也可以是字符串模板
	 * @return {number}nIndex 返回回调索引
	 */
	function fDefine(sId,deps,factory){
		//读取实名
		var sRealId=$H.alias(sId);
		var nLen=arguments.length;
		if(nLen==2){
			factory=deps;
			deps=[];
		}else{
			deps=typeof deps=="string"?[deps]:deps;
		}
		
		//检出factory方法内声明的require依赖，如：var m=require('m');
		if(Object.prototype.toString.call(factory) === "[object Function]"){
			var m,sFactoryStr=factory.toString();
			var r=/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
			while(m=r.exec(sFactoryStr)){
				deps.push(m[1]);
			}
		}
		
		Loader.require(deps,function(){
			var oModule=_modules[sRealId];
			oModule.args=arguments;
			oModule.factory=factory;
		},sRealId);
	}
    /**
	 * 加载所需的资源
	 * @method require(id,fCallback=)
	 * @param {string|array}id    资源id（数组）
	 * @param {function()=}fCallback(可选) 回调函数
	 * @param {string=}sDefineId 当前请求要定义的资源id，这里只是为了检查加载出错时使用，外部使用忽略此参数
	 * @return {any}返回最后一个当前已加载的资源，通常用于className只有一个的情况，这样可以立即通过返回赋值
	 */
    function fRequire(id,fCallback,sDefineId){
    	var aIds=typeof id=="string"?[id]:id;
    	fCallback=fCallback||$H.noop;
    	//此次required待请求资源数组
    	var aRequestIds=[];
    	//已加载的资源
    	var aExisteds=[];
    	//是否保存到上下文列表中，保证callback只执行一次
    	var bNeedContext=true;
    	//在内部，全部先转换为实名
    	for(var i=0,nLen=aIds.length;i<nLen;i++){
    		var sId=aIds[i];
			//替换为实名
			sId=$H.alias(sId);
			aIds.splice(i,1,sId);
    	}
    	for(var i=0,nLen=aIds.length;i<nLen;i++){
    		var sId=aIds[i];
    		var oResult=_fChkExisted(sId);
    		if(oResult.notExist.length>0){
    			//未加载资源放进队列中
    			aRequestIds.push(sId);
    			if(bNeedContext){
    				bNeedContext=false;
	    			_fSaveContext({
	    				id        : sDefineId,
	    				deps      : aIds,
	    				callback  : fCallback
	    			});
    			}
    			if(Loader.traceLog){
					Debug.log(_RESOURCE_NOT_FOUND+sId);
		   		}
    		}else{
    			aExisteds.push(oResult.exist[0]);
    		}
    	}
    	//没有需要加载的资源，直接执行回调或返回资源
    	if(aRequestIds.length==0){
    		fCallback&&fCallback.apply(null,aExisteds);
    		return aExisteds.length==1?aExisteds[0]:aExisteds;
    	}else{
    		//请求资源
    		_fRequest(aRequestIds);
    	}
    }
    
    return Loader;
	
});