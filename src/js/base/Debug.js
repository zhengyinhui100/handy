/**
 * 调试类，方便各浏览器下调试，在发布时统一删除调试代码，所有的输出和调试必须使用此类的方法，
 * 不得使用console等原生方法，发布到线上时需要把除了需要反馈给服务器的方法外的方法统一过滤掉
 * //TODO 快捷键切换调试等级
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add("Debug",['handy.base.Json','handy.base.Browser'],function(Json,Browser,$H){
	
	var Debug={
		level	    : $H.isDebug?0:5,  //当前调试调试日志级别，只有级别不低于此标志位的调试方法能执行
		LOG_LEVEL	: 1,            //日志级别
		DEBUG_LEVEL : 2,            //调试级别
		INFO_LEVEL  : 3,            //信息级别
		WARN_LEVEL  : 4,            //警告级别
		ERROR_LEVEL	: 5,            //错误级别
		showInPage  : !("console" in window)||!!Browser.mobile(),        //是否强制在页面上输出调试信息，主要用于不支持console的浏览器，如：IE6，或者ietester里面，或者移动浏览器
		out         : fOut,         //直接输出日志
		log			: fLog,		    //输出日志
		info		: fInfo,		//输出信息
		warn        : fWarn,        //输出警告信息
		error		: fError,		//输出错误信息
		time        : fTime,        //输出统计时间,info级别
		debug		: fDebug		//出现调试断点
	}
	/**
	 * 输出信息
	 * @method fOut
	 * @param {Object} oVar	需要输出的变量
	 * @param {boolean} bShowInPage 是否需要创建一个DIV输出到页面
	 * @param {string} sType 日志类型：log,info,error
	 */
	function fOut(oVar,bShowInPage,sType){
		sType = sType||'log';
		//输出到页面
		if(bShowInPage||Debug.showInPage){
			var sDivId = $H.expando+'debugDiv';
			var oDocument = top.document;
			var oDebugDiv = oDocument.getElementById(sDivId);
			if(!oDebugDiv){
				oDebugDiv = oDocument.createElement("DIV");
				oDebugDiv.id = sDivId;
				oDebugDiv.innerHTML = [
					'<a href="javascript:void(0)" onclick="this.parentNode.style.display=\'none\'">关闭</a>',
					'<a href="javascript:void(0)" onclick="this.parentNode.getElementsByTagName(\'DIV\')[0].innerHTML=\'\';">清空</a>',
					'<a href="javascript:void(0)" onclick="if(this.innerHTML==\'全屏\'){this.parentNode.style.height=\''+oDocument.body.offsetHeight+'px\';this.innerHTML=\'收起\'}else{this.parentNode.style.height=\'100px\';this.innerHTML=\'全屏\';}">全屏</a>',
					'<a href="javascript:void(0)" onclick="var oDv=this.parentNode.getElementsByTagName(\'div\')[0];if(this.innerHTML==\'底部\'){oDv.scrollTop=oDv.scrollHeight;this.innerHTML=\'顶部\';}else{oDv.scrollTop=0;this.innerHTML=\'底部\';}">顶部</a>',
					'<a href="javascript:void(0)" onclick="location.reload();">刷新</a>',
					'<a href="javascript:void(0)" onclick="history.back();">后退</a>'
				].join('&nbsp;&nbsp;&nbsp;&nbsp;')+'<div style="padding-top:5px;height:90%;overflow:auto;"></div>';
				oDebugDiv.style.position = 'fixed';
				oDebugDiv.style.width = (oDocument.body.offsetWidth-20)+'px';
				oDebugDiv.style.left = 0;
				oDebugDiv.style.top = 0;
				oDebugDiv.style.right = 0;
				oDebugDiv.style.height = '150px';
				oDebugDiv.style.backgroundColor = '#aaa';
				oDebugDiv.style.fontSize = '12px';
				oDebugDiv.style.padding = '10px';
				oDebugDiv.style.zIndex = 9999999999;
				oDebugDiv.style.opacity=0.8;
				oDebugDiv.style.filter="alpha(opacity=80)";
				oDocument.body.appendChild(oDebugDiv);
			}else{
				oDebugDiv.style.display = 'block';
			}
			var oAppender=oDebugDiv.getElementsByTagName('DIV')[0];
			//这里原生的JSON.stringify有问题(&nbsp;中最后的'p;'会丢失)，统一强制使用自定义方法
			var sMsg=$H.Json.stringify(oVar, null, '&nbsp;&nbsp;&nbsp;&nbsp;',true).replace(/\n/g,'<br/>');
			oAppender.innerHTML += sType+" : "+sMsg+"<br/>";
			oAppender.scrollTop=oAppender.scrollHeight;
		}
		//尝试获取调用位置
		var fCaller=arguments.callee.caller;
		if(!fCaller.$owner){
			fCaller=fCaller.caller;
		}
		try{
			//如果是类方法，输出方法定位信息
			if(fCaller.$owner){
				console[sType](fCaller.$owner.$ns+'.'+fCaller.$name);
			}
			console[sType](oVar);
		}catch(e){
		}
	}
	/**
	 * 输出日志
	 * @method log
	 * @param {Object} oVar	需要输出的变量
	 * @param {boolean} bShowInPage 是否需要创建一个DIV输出到页面
	 */
	function fLog(oVar,bShowInPage){
		if(Debug.level>Debug.LOG_LEVEL){
			return;
		}
		Debug.out(oVar,!!bShowInPage,'log');
	}
	/**
	 * 输出信息
	 * @method info
	 * @param {Object} oVar	需要输出的变量
	 * @param {boolean} bShowInPage 是否需要创建一个DIV输出到页面
	 */
	function fInfo(oVar,bShowInPage){
		if(this.level>Debug.INFO_LEVEL){
			return;
		}
		Debug.out(oVar,!!bShowInPage,'info');
	}
	/**
	 * 输出信息
	 * @method warn
	 * @param {Object} oVar	需要输出的变量
	 * @param {boolean} bShowInPage 是否需要创建一个DIV输出到页面
	 */
	function fWarn(oVar,bShowInPage){
		if(Debug.level>Debug.WARN_LEVEL){
			return;
		}
		Debug.out(oVar,!!bShowInPage,'warn');
	}
	/**
	 * 输出错误
	 * @method error
	 * @param {Object}oVar	需要输出的变量
	 * @param {boolean=}bShowInPage 是否需要创建一个DIV输出到页面
	 */
	function fError(oVar,bShowInPage){
		if(Debug.level>Debug.ERROR_LEVEL){
			return;
		}
		Debug.out(oVar,!!bShowInPage,"error");
		if(oVar instanceof Error){
			//抛出异常，主要是为了方便调试，如果异常被catch住的话，控制台不会输出具体错误位置
			throw oVar;
		}
	}
	/**
	 * 输出统计时间
	 * @method time
	 * @param {boolean=}bOut 为true时，计算时间并输出信息，只有此参数为true时，后面两个参数才有意义
	 * @param {string=}sMsg 输出的信息
	 * @param {boolean=}bShowInPage 是否需要创建一个DIV输出到页面
	 */
	function fTime(bOut,sMsg,bShowInPage){
		if(Debug.level>Debug.INFO_LEVEL){
			return;
		}
		if(bOut){
			if(typeof sMsg=='boolean'){
				bShowInPage=sMsg;
				sMsg='';
			}
			Debug.out((sMsg||'')+(new Date().getTime()-(Debug.lastTime||0)),!!bShowInPage)
		}else{
			Debug.lastTime=new Date().getTime();
		}
	}
	/**
	 * 添加调试断点
	 * @method debug
	 * @param {boolean}isDebug	仅为false时不进入debug
	 */
	function fDebug(isDebug){
		if(Debug.level>Debug.DEBUG_LEVEL){
			return;
		}
		if(isDebug!==false){
			debugger;
		}
	}
	/**
	 * 处理异常
	 * @method throwExp
	 * @param {Object}oExp 异常对象
	 */
	function fThrowExp(oExp){
		if(Debug.level<=Debug.DEBUG_LEVEL){
			throw oExp;
		}
	}
	
	return Debug;
	
});