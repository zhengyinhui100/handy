/**
 * 模块加载类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * 
 * 推荐两种使用方法:
 * 1、隐蔽回调方式——$L,在函数内使用catch中return，如：
 * (function(){
 * 	   try{
 * 		   $L(["Test1","Test2"]);
 * 	   }catch(e){
 *         //注意:推荐在类定义闭包中使用$L时，都在catch里return,因为如果这里后续代码会运用到Test1或Test2,不return的话会报错
 *         return e;
 * 	   }
 *     后续代码...
 * })()
 * 2、显示回调方式——$E:
 * $E("Test",function(){
 * 	   var Test=Test;
 *     后续代码...
 * })
 * 其中，第一种方式适合需要引用的类在类定义中比较常用的情况(如：在后续类定义中需要继承引用类)，先统一请求；
 * 第二种方式适合引用的类不一定用得到的情况(如：点击某处才需要该引用类，则在该点击函数里使用第二种方式，当用户没有点击时就不用加载引用的类)。
 * 另外，加载多个资源时要写成数组的形式(见第一个示例)，如果写成一下形式，资源会变成串行加载，而不是并行加载
 * ...
 * $L("Test1");
 * $L("Test2");
 * ...
 */
HANDY.add("Loader",["Ajax","Debug","Function"],function($){
	
	var _MODULE_NOT_FOUND= 'Module not found',
    	_nCallIndex=0,      //回调索引，用于并行加载多个资源时，保证回调函数执行一次
    	_oCallMap={},       //回调状态映射表，用于并行加载多个资源时，保证回调函数执行一次
    	_aStack=[],         //请求堆栈
	    //TODO 是否可以去掉
	    _oClassStatus={};   //保存请求中的class信息
	    _cache={};          //缓存
	
	var Loader= {
		traceLog                : false,                    //是否打印跟踪信息
		jsRoot                  : '',                       //根url
		skinName                : 'skin',                   //皮肤名称，皮肤css的url里包含的字符串片段，用于检查css是否是皮肤
	    showLoading				: function(bIsLoading){},	//加载中的提示，由具体逻辑重写
		define                  : fDefine,                  //定义模块资源
	    getClass                : fGetClass,                //获取类
	    getScript               : fGetScript,               //获取脚本
	    getCss                  : fGetCss,                  //获取css
	    require                 : fRequire                  //获取所需资源后执行回调
	}
	
    /**
	 * 获取回调索引
	 * @method _fGetCallIndex
	 * @param {void}
	 * @return {number}nIndex 返回回调索引
	 */
    function _fGetCallIndex(){
    	var nIndex=++_nCallIndex;
    	_oCallMap[nIndex]=true;
    	return nIndex;
    }
     /**
	 * 检查对应索引的回调是否可以执行
	 * @method _fCanExec
	 * @param {number}nCallIndex 回调索引
	 * @return {boolean}返回true表示该回调可以执行
	 */
    function _fCanExec(nCallIndex){
    	if(_oCallMap[nCallIndex]){
    		delete _oCallMap[nCallIndex];
    		return true;
    	}
    	return false;
    }
    /**
	 * 通过类名获取js实际url
	 * @method _fGetUrl
	 * @param {string}sClass 类名
	 * @return {string}sUrl 实际url
	 */
    function _fGetUrl(sClass){
    	var sUrl = Loader.jsRoot + sClass.toLowerCase()+".js";
		return sUrl;
    }
    /**
	 * 获取类
	 * @method getClass
	 * @param {string}sClass 类名
	 * @return {class}返回类
	 */
    function fGetClass(sClass){
 		var aPackageName = sClass.split('.'),
	    	nLen = aPackageName.length;
		try{
		    var _package = window;
		    for(var i=0; i < nLen; i++){
		    	_package = _package[aPackageName[i]];
		    }
		    if(typeof _package == 'function') {
		    	//已加载
		    	return _package;
		    }else{
		    	throw _CLASS_NOT_FOUND;
		    }
		}catch(ex){
			throw _CLASS_NOT_FOUND;
		}	
	}
	/**
	 * 获取js脚本
	 * @method getScript
	 * @param {string}sUrl 请求url
	 * @param {function}fCallback 回调函数
	 * @return {void}
	 */
    function fGetScript(sUrl,fCallback) {
    	var eScript=document.createElement("script");
    	//脚本相对于页面的其余部分异步地执行(当页面继续进行解析时，脚本将被执行)
    	eScript.async = "async";
    	eScript.src=sUrl;
    	eScript.type="text/javascript";
    	eScript.onload = eScript.onreadystatechange = function() {
			if (!eScript.readyState||eScript.readyState == "complete" || eScript.readyState == "loaded"){
				eScript.onload = eScript.onreadystatechange = null;
				//IE10下新加载的script会在此之后执行，所以此处需延迟执行
				setTimeout(fCallback,0);
			}
		};
		var eHead = document.head ||document.getElementsByTagName('head')[0] ||document.documentElement;
		eHead.appendChild(eScript);
	}
	/**
	 * 获取css
	 * @method getCss
	 * @param {string}sUrl 请求url
	 * @return {void}
	 */
    function fGetCss(sUrl) {
    	var eHead=document.head ||document.getElementsByTagName('head')[0] ||document.documentElement;
    	var aStyles=eHead.getElementsByTagName("link");
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
    	//插入到皮肤css之前
    	eHead.insertBefore(eCssNode,Loader.skinNode);
	}
    /**
	 * 请求js资源
	 * @method _fRequest
	 * @param {string|array}className 类名
	 * @return {void}
	 */
    function _fRequest(className){
    	var aClasses=typeof className=="string"?[className]:className;
    	for(var i=0;i<aClasses.length;i++){
    		var sClass=aClasses[i];
    		var sUrl=_fGetUrl(sClass);
			$.Debug.info("Request:"+sClass+"->"+sUrl);
    		Loader.getScript(sUrl,$.Function.bind(_fReponse,null,sClass));
    	}
    	Loader.showLoading(true);
    }
    /**
	 * js脚本下载完成回调
	 * @method _fReponse
	 * @param {string}sClassName 类名
	 * @return {void}
	 */
    function _fReponse(sClassName){
    	Loader.showLoading(false);
		$.Debug.info("Loaded:"+sClassName);
    	//标记对应类状态为已加载
    	_oClassStatus[sClassName].loaded=true;
    	//检查依赖类是否已经全部加载
    	function _fCheckDepends(aDepends){
    		for(var i=0;i<aDepends.length;i++){
    			try{
					Loader.getClass(aDepends[i]);
				}catch(e){
    				return false;
				}
    		}
    		return true;
    	}
    	//循环尝试执行堆栈
    	for(var i=_aStack.length-1;i>-1;i--){
    		var oStackItem=_aStack[i];
    		var sClass=oStackItem.className;
    		//如果对应类已经加载，尝试执行该类的上下文
    		if(_oClassStatus[sClass].loaded){
		    	//类上下文堆栈
				var aContexts=oStackItem.contexts;
				try{
					Loader.getClass(sClass);
				}catch(e){
					$.Debug.warn("Loader reponse getClass error:"+sClass,e);
					continue;
				}
				//顺序执行上下文
				while(aContexts.length>0){
					var oContext=aContexts.shift();
					//如果依赖的类都已经加载，并且该回调可以被执行，则执行上下文回调
					if(_fCheckDepends(oContext.depends)&&Loader._canExec(oContext.callIndex)){
						try{
							oContext.call.apply(oContext.thisArg,oContext.args);
						}catch(e){
							$.Debug.error("Loader reponse execute context error:"+className,e);
							$.Debug.throwExp(e);
						}
					}
				}
	    		_aStack.splice(i,1);
	    		delete _oClassStatus[sClass];
    		}
    	}
    }
    /**
	 * 定义loader模块
	 * @method define
	 * @param {string}sId 模块id
	 * @param {array}aDeps  依赖的模块
	 * @param {any}module 模块，可以是函数，也可以是字符串模板
	 * @return {number}nIndex 返回回调索引
	 */
	function fDefine(sId,aDeps,module){
		var that=this;
		that.required(aDeps,function(){
			
			_cache[sId]={
				id:sId,
				deps:aDeps,
				module:module
			}
		});
	}
    /**
	 * 加载所需的资源
	 * @method load(className[,fCallback])
	 * @param {string|array}id 资源id
	 * @param {function}fCallback(可选) 回调函数
	 * @return {any}返回最后一个当前已加载的资源，通常用于className只有一个的情况，这样可以立即通过返回赋值
	 */
    function fRequired(id,fCallback,args,thisArg){
    	var aClasses=typeof className=="string"?[className]:className,
    		fCall=fCallback||arguments.callee.caller,
    		aArgs=(args?($.isArray(args)?args:[args]):fCall.arguments)||[],
    		thisArg=thisArg||window,
    		oClazz,
    		//是否需要加载类
    		bNeedLoad=false,
    		//需要请求的class
    		aRequestClass=[],
    		nCallIndex=Loader._getCallIndex();
	    for(var i=0;i<aClasses.length;i++){
	    	var sClass=aClasses[i];
			try{
	    		var oClazz=Loader.getClass(sClass);
			}catch(e){
				bNeedLoad=true;
				//保存上下文环境
				var context={
					className:sClass,     //类名
					callIndex:nCallIndex,//回调索引
					depends:aClasses,    //回调函数依赖的类
					call:fCall,          //回调函数
					args:aArgs,          //回调函数的参数
					thisArg:thisArg    //回调函数apply的对象
				};
			    //类上下文堆栈
				var oClassStatus=_oClassStatus[sClass];
				if(!oClassStatus){
					var aContext=[context];
					_oClassStatus[sClass]={contexts:aContext};
					//没有加载的类添加到待加载队列
					aRequestClass.push(sClass);
					_aStack.push({
						className : sClass,
						contexts  : aContext
					});
				}else{
					//如果该类已在请求队列里，则直接将请求上下文压入类堆栈
					oClassStatus.contexts.push(context);
				}
				$.Debug.warn(_CLASS_NOT_FOUND+":"+sClass);
			}
	    }
    	//如果全部类都已加载，直接执行回调
    	if(!bNeedLoad){
    		//这里只执行参数回调，不需要执行arguments.callee.caller
	    	fCallback&&fCallback();
    	}else{
    		//发起请求
    		if(aRequestClass.length>0){
	    		_fRequest(aRequestClass);
    		}
    		//抛出异常，中断外部函数执行
			throw _CLASS_NOT_FOUND;
    	}
    	return oClazz;
    }
    
    return Loader;
	
})