/**
 * 模块加载类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * 
 * 
 */
HANDY.add("Loader",["Debug","Object","Function"],function($){
	
	var _MODULE_NOT_FOUND= 'Module not found: ',
    	_nCallIndex=0,      //回调索引，用于并行加载多个模块时，保证回调函数执行一次
    	_oCallMap={},       //回调状态映射表，用于并行加载多个模块时，保证回调函数执行一次
    	_aContext=[],         //请求上下文堆栈
	    _oCache={};         //缓存
	
	var Loader= {
		traceLog                : true,                     //是否打印跟踪信息
		rootPath                : '',                       //根url
		skinName                : 'skin',                   //皮肤名称，皮肤css的url里包含的字符串片段，用于检查css是否是皮肤
		urlMap                  : {},                       //id-url映射表                     
	    showLoading				: function(bIsLoading){},	//加载中的提示，由具体逻辑重写
		define                  : fDefine,                  //定义模块模块
	    require                 : fRequire                  //获取所需模块后执行回调
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
	 * 检查对应的模块是否已加载
	 * @method _fChkExisted
	 * @param {string|array}id 被检查的模块id
	 * @return {boolean}返回true表示该模块已经被加载
	 */
    function _fChkExisted(id){
    	function _fChk(sId){
    		return _oCache[sId]||$.Object.checkNs(sId);
    	}
    	if(typeof id=="string"){
    		return _fChk(id);
    	}
    	for(var i=0,nLen=id.length;i<nLen;i++){
    		if(!_fChk(id[i])){
    			return false;
    		}
    	}
    	return true;
    }
    
    /**
	 * 通过id获取实际url
	 * @method _fGetUrl
	 * @param {string}sId 模块id
	 * @return {string}sUrl 实际url
	 */
    function _fGetUrl(sId){
    	var sUrl=Loader.urlMap[sId];
    	if(!sUrl){
    		var sRoot=Loader.rootPath;
    		//css文件
    		if(/.css$/.test(sId)){
    			sUrl=sId.indexOf('/')==0?sId:"/css/"+sId;
    		}else if(/.js$/.test(sId)){
    			//js文件
    			sUrl="/"+sId;
    		}else{
    			//命名空间
    			sUrl='/'+sId.replace(/\./g,"/")+".js";
    		}
    		sUrl=sRoot+sUrl;
    	}
		return sUrl;
    }
	/**
	 * 获取js脚本
	 * @method _getScript
	 * @param {string}sUrl 请求url
	 * @param {function}fCallback 回调函数
	 * @return {void}
	 */
    function _fGetScript(sUrl,fCallback) {
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
	 * @method _getCss
	 * @param {string}sUrl 请求url
	 * @return {void}
	 */
    function _fGetCss(sUrl) {
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
	 * 请求模块
	 * @method _fRequest
	 * @param {array}aRequestIds 需要加载的模块id数组
	 * @return {void}
	 */
    function _fRequest(aRequestIds,aExisteds){
    	for(var i=0,nLen=aRequestIds.length;i<nLen;i++){
    		var sId=aRequestIds[i];
    		var sUrl=_fGetUrl(sId);
    		if(/.css$/.test(sUrl)){
    			_fGetCss(sUrl);
    		}else{
    			_fGetScript(sUrl,$.Function.bind(_fResponse,null,sId,aExisteds)) ;
    		}
    	}
    	Loader.showLoading(true);
    }
    /**
	 * 模块下载完成回调
	 * @method _fResponse
	 * @param {string}sId 模块id
	 * @return {void}
	 */
    function _fResponse(sId,aExisteds){
    	Loader.showLoading(false);
    	//每次回调都循环上下文列表
   		for(var i=_aContext.length-1;i>=0;i--){
	    	var oContext=_aContext[i];
	    	if(_fChkExisted(oContext.deps)){
	    		oContext.callback();
	    		_aContext.splice(i,1);
	    	}
   		}
   		if(Loader.traceLog){
			$.Debug.info("Response: "+sId);
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
		var nLen=arguments.length;
		if(nLen==2){
			module=aDeps;
			aDeps=[];
		}
		that.require(aDeps,function(){
			var mod;
			if(typeof module=="function"){
				try{
					mod=module();
				}catch(e){
					//模块定义错误
					return;
				}
			}else{
				mod=module;
			}
			_oCache[sId]={
				id:sId,
				deps:aDeps,
				factory:module,
				module:mod
			}
			$.Object.namespace(sId,mod);
		});
	}
    /**
	 * 加载所需的模块
	 * @method require(id[,fCallback])
	 * @param {string|array}id 模块id（数组）
	 * @param {function}fCallback(可选) 回调函数
	 * @return {any}返回最后一个当前已加载的模块，通常用于className只有一个的情况，这样可以立即通过返回赋值
	 */
    function fRequire(id,fCallback){
    	var aIds=typeof id=="string"?[id]:id;
    	//此次required待请求模块数组
    	var aRequestIds=[];
    	//已加载的模块
    	var aExisteds=[];
    	for(var i=0,nLen=aIds.length;i<nLen;i++){
    		var sId=aIds[i];
    		if(!_fChkExisted(sId)){
    			//未加载模块放进队列中
    			aRequestIds.push(sId);
    			_aContext.push({
    				deps      : aIds,
    				callback  : fCallback
    			});
    			if(Loader.traceLog){
					$.Debug.info(_MODULE_NOT_FOUND+sId);
		   		}
    		}else{
    			aExisteds.push(_oCache[sId].module);
    		}
    	}
    	
    	//没有需要加载的模块，直接执行回调或返回模块
    	if(aRequestIds.length==0){
    		aExisteds=aExisteds.length==1?aExisteds[0]:aExisteds;
    		fCallback&&fCallback(aExisteds);
    		return aExisteds;
    	}else{
    		//请求模块
    		_fRequest(aRequestIds,aExisteds);
    	}
    }
    
    return Loader;
	
})