/**
 * 调试类，方便各浏览器下调试，在发布时统一删除调试代码，所有的输出和调试必须使用此类的方法，
 * 不得使用console等原生方法，发布到线上时需要把除了需要反馈给服务器的方法外的方法统一过滤掉
 * //TODO 快捷键切换调试等级
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
define("L.Debug",['L.Json','L.Browser'],function(Json,Browser){
	
	var Debug=window.$D={
		level	            : $H.isDebug?0:5,  //当前调试调试日志级别，只有级别不低于此标志位的调试方法能执行
		LOG_LEVEL	        : 1,            //日志级别
		DEBUG_LEVEL         : 2,            //调试级别
		INFO_LEVEL          : 3,            //信息级别
		WARN_LEVEL          : 4,            //警告级别
		ERROR_LEVEL	        : 5,            //错误级别
		//是否强制在页面上输出调试信息，true表示在页面中显示，'record'表示记录但不显示控制台面板，false表示既不显示也不记录
		//主要用于不支持console的浏览器，如：IE6，或者ietester里面，或者移动浏览器
		//开发环境下连续点击4次也可弹出控制面板
		showInPage          : $H.isDebug?(!("console" in window)||!!Browser.mobile()?'record':false):false,        
		out                 : fOut,         //直接输出日志
		log			        : fLog,		    //输出日志
		debug		        : fDebug,   	//输出调试
		info		        : fInfo,		//输出信息
		warn                : fWarn,        //输出警告信息
		error		        : fError,		//输出错误信息
		time                : fTime,        //输出统计时间,info级别
		trace               : fTrace,       //追踪统计时间
//		debugLog            : $H.noop,      //线上错误处理
		throwExp            : fThrowExp,            //处理异常
		listenCtrlEvts      : fListenCtrlEvts       //监听连续点击事件打开控制面板
	}
	
	//暂时只能在非线上环境手动开启控制面板
	!$H.isOnline&&Debug.listenCtrlEvts();
	
	/**
	 * 监听事件
	 * @param {element}oTarget 参数节点
	 * @param {string}sName 事件名
	 * @param {function}fHandler 事件函数
	 */
	function _fListen(oTarget,sName,fHandler){
		if(oTarget.addEventListener){
			oTarget.addEventListener(sName,fHandler);
		}else{
			oTarget.attachEvent('on'+sName,fHandler);
		}
	}
	/**
	 * 输出信息
	 * @param {Object} oVar	需要输出的变量
	 * @param {boolean} bShowInPage 参照Debug.showInPage
	 * @param {string} sType 日志类型：log,info,error
	 */
	function fOut(oVar,bShowInPage,sType){
		sType = sType||'log';
		//输出到页面
		if(bShowInPage||Debug.showInPage){
			var sExpando=$H.expando;
			var sDivId = sExpando+'debugDiv';
			var sInputId = sExpando+'debugInput';
			var oDocument = top.document;
			var oDebugDiv = oDocument.getElementById(sDivId);
			if(!oDebugDiv){
				oDebugDiv = oDocument.createElement("DIV");
				oDebugDiv.id = sDivId;
				oDebugDiv.innerHTML = [
					'<a href="javascript:void(0)" onclick="this.parentNode.style.display=\'none\'">关闭</a>',
					'<a href="javascript:void(0)" onclick="this.parentNode.getElementsByTagName(\'DIV\')[0].innerHTML=\'\';">清空</a>',
					'<a href="javascript:void(0)" onclick="if(this.innerHTML==\'全屏\'){this.parentNode.style.height=\''+oDocument.body.offsetHeight+'px\';this.innerHTML=\'收起\'}else{this.parentNode.style.height=\'6.25em\';this.innerHTML=\'全屏\';}">收起</a>',
					'<a href="javascript:void(0)" onclick="var oDv=this.parentNode.getElementsByTagName(\'div\')[0];if(this.innerHTML==\'底部\'){oDv.scrollTop=oDv.scrollHeight;this.innerHTML=\'顶部\';}else{oDv.scrollTop=0;this.innerHTML=\'底部\';}">顶部</a>',
					'<a href="javascript:void(0)" onclick="location.reload();">刷新</a>',
					'<a href="javascript:void(0)" onclick="history.back();">后退</a>'
				].join('&nbsp;&nbsp;&nbsp;&nbsp;')
				+'<div style="padding-top:0.313;height:85%;overflow:auto;font-size:0.75em;word-wrap:break-word;word-break:break-all;"></div>'
				+'<input id="'+sInputId+'" style="width:100%;padding:0.5em;" type="text"/>';
				oDebugDiv.style.display='none';
				oDebugDiv.style.position = 'fixed';
				oDebugDiv.style.width = '100%';
				oDebugDiv.style.left = 0;
				oDebugDiv.style.top = 0;
				oDebugDiv.style.right = 0;
				oDebugDiv.style.height = '100%';
				oDebugDiv.style.backgroundColor = '#aaa';
				oDebugDiv.style.fontSize = '1em';
				oDebugDiv.style.padding = '0.625em';
				oDebugDiv.style.zIndex = 9999999999;
				oDebugDiv.style.opacity=0.95;
				oDebugDiv.style.filter="alpha(opacity=95)";
				oDocument.body.appendChild(oDebugDiv);
				var oInput=oDocument.getElementById(sInputId);
				_fListen(oInput,'keypress',function(oEvt){
					oEvt=oEvt||window.event;
					var nKeyCode=oEvt.keyCode;
					//回车执行
					if(nKeyCode==10||nKeyCode==13){
						var sValue=oInput.value;
						try{
							var result=eval(sValue);
							oInput.value='';
							Debug.out(sValue,true,'cmd');
							Debug.out(result,true,'cmd');
						}catch(e){
							Debug.out(sValue,true,'error');
						}
					}
				});
			}
			if((bShowInPage===true||Debug.showInPage===true)){
				oDebugDiv.style.display ='block';
			}
			var oAppender=oDebugDiv.getElementsByTagName('DIV')[0];
			oVar=oVar instanceof Error?(oVar.stack||oVar.message):oVar;
			//这里原生的JSON.stringify有问题(&nbsp;中最后的'p;'会丢失)，统一强制使用自定义方法
			var sMsg=typeof oVar=='string'?oVar:Json.stringify(oVar, null, '&nbsp;&nbsp;&nbsp;&nbsp;',true);
			sMsg=sMsg&&sMsg.replace(/\n|\\n/g,'<br/>');
			var sStyle;
			if(sType=='log'){
				sStyle='';
			}else{
				sStyle=' style="color:'+(sType=='error'?'red':sType=='warn'?'yellow':'green');
			}
			oAppender.innerHTML += '<div'+sStyle+'">'+sType+":<br/>"+sMsg+"</div><br/><br/>";
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
				console[sType]('['+fCaller.$owner.$ns+'->'+fCaller.$name+']');
			}
			console[sType](oVar);
		}catch(e){
		}
	}
	/**
	 * 输出日志
	 * @param {Object} oVar	需要输出的变量
	 * @param {boolean} bShowInPage 参照Debug.showInPage
	 */
	function fLog(oVar,bShowInPage){
		if(Debug.level>Debug.LOG_LEVEL){
			return;
		}
		Debug.out(oVar,!!bShowInPage,'log');
	}
	/**
	 * 添加调试断点
	 * @param {Object} oVar	需要输出的变量
	 * @param {boolean} bShowInPage 参照Debug.showInPage
	 */
	function fDebug(oVar,bShowInPage){
		if(Debug.level>Debug.DEBUG_LEVEL){
			return;
		}
		Debug.out(oVar,!!bShowInPage,'log');
	}
	/**
	 * 输出信息
	 * @param {Object} oVar	需要输出的变量
	 * @param {boolean} bShowInPage 参照Debug.showInPage
	 */
	function fInfo(oVar,bShowInPage){
		if(this.level>Debug.INFO_LEVEL){
			return;
		}
		Debug.out(oVar,!!bShowInPage,'info');
	}
	/**
	 * 输出信息
	 * @param {Object} oVar	需要输出的变量
	 * @param {boolean} bShowInPage 参照Debug.showInPage
	 */
	function fWarn(oVar,bShowInPage){
		if(Debug.level>Debug.WARN_LEVEL){
			return;
		}
		Debug.out(oVar,!!bShowInPage,'warn');
	}
	/**
	 * 输出错误
	 * @param {Object}oVar	需要输出的变量
	 * @param {boolean=}bShowInPage 参照Debug.showInPage
	 */
	function fError(oVar,bShowInPage){
		if(Debug.level>Debug.ERROR_LEVEL){
			return;
		}
		Debug.out(oVar,!!bShowInPage,"error");
		if($H.isDebug){
			if(oVar instanceof Error){
				//抛出异常，主要是为了方便调试，如果异常被catch住的话，控制台不会输出具体错误位置
				typeof console!=='undefined'&&console.error(oVar.stack)
				throw oVar;
			}
		}else{
			//线上自行实现log接口
			Debug.debugLog&&Debug.debugLog(oVar);
		}
	}
	/**
	 * 输出统计时间
	 * @param {boolean=}bOut 为true时，计算时间并输出信息，只有此参数为true时，后面两个参数才有意义
	 * @param {string=}sMsg 输出的信息
	 * @param {boolean=}bShowInPage 参照Debug.showInPage
	 */
	function fTime(bOut,sMsg,bShowInPage){
		if(Debug.level>Debug.INFO_LEVEL){
			return;
		}
		var nTime=window.performance&&window.performance.now?window.performance.now():(new Date().getTime());
		if(bOut){
			if(typeof sMsg=='boolean'){
				bShowInPage=sMsg;
				sMsg='';
			}
			Debug.out((sMsg||'')+(nTime-(Debug.lastTime||0)),!!bShowInPage);
		}else{
			Debug.lastTime=nTime;
		}
	}
	/**
	 * 追踪统计时间
	 * @param {object}oParams {
	 * 		{string=}name:名称,
	 * 		{boolean=}end:是否结束计时，默认是开始计时,
	 * 		{boolean=}out:true表示输出结果,
	 * 		{string=}method:输出使用的方法，默认是log
	 * }
	 */
	function fTrace(oParams){
		var bOut=oParams.out;
		var oTimes=Debug._traceTimes||(Debug._traceTimes={});
		if(bOut){
			for(var sName in oTimes){
				var oItem=oTimes[sName];
				oItem.average=oItem.total/oItem.num;
			}
			var sMethod=oParams.method||'log';
			Debug[sMethod](oTimes);
			return;
		}
		var sName=oParams.name;
		var bEnd=oParams.end;
		var oItem=oTimes[sName]||(oTimes[sName]={});
		var nTime=window.performance?window.performance.now():(new Date().getTime());
		if(!bEnd){
			oItem.num=(oItem.num||0)+1;
			oItem.start=nTime;
		}else{
			oItem.total=(oItem.total||0)+nTime-oItem.start;
		}
	}
	/**
	 * 处理异常
	 * @param {Object}oExp 异常对象
	 */
	function fThrowExp(oExp){
		if(Debug.level<=Debug.DEBUG_LEVEL){
			throw oExp;
		}
	}
	/**
	 * 监听连续点击事件打开控制面板
	 */
	function fListenCtrlEvts(){
		var oDoc = top.document;
		var sName=Browser.mobile()?'touchstart':'click';
		var nTimes=0;
		var nLast=0;
		_fListen(oDoc,sName,function(){
			var nNow=new Date().getTime();
			if(nNow-nLast<500){
				nTimes++;
				//连续点击4次弹出控制面板
				if(nTimes>2){
					Debug.out('open console',true);
					nTimes=0;
				}
			}else{
				nTimes=0;
			}
			nLast=nNow;
		});
	}
	
	return Debug;
	
});