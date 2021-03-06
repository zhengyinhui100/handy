/**
 * 调试类，方便各中环境下调试及测试，控制面板可以在不能显示控制台的环境下显示日志信息及执行代码，
 * 在发布时统一可以考虑删除调试代码，所有的输出和调试必须使用此类的方法，不得使用console等原生方法
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
define("L.Debug",['L.Json','L.Browser'],function(Json,Browser){
	
	var Debug=window.$D={
		level	            : $H.isDev?0:5,  //当前调试调试日志级别，只有级别不低于此标志位的调试方法能执行
		LOG_LEVEL	        : 1,            //日志级别
		DEBUG_LEVEL         : 2,            //调试级别
		INFO_LEVEL          : 3,            //信息级别
		WARN_LEVEL          : 4,            //警告级别
		ERROR_LEVEL	        : 5,            //错误级别
		//是否强制在页面上输出调试信息，true表示在页面中显示控制面板，'record'表示只有error日志会弹出控制面板，
		//其它类型日志会记录在面板里但不显示面板，false表示既不显示也不记录
		//开发环境下连续点击4次也可弹出控制面板
		//PS：原则上开发环境和测试环境必须将所有的错误信息展示出来，而线上环境不能暴露给用户控制面板，
		//所以为了收集错误，需要自行实现error日志的debugLog接口，可以想服务器发送错误信息
		showInPage          : $H.isOnline?false:'record',        
		_out                : _fOut,        //直接输出日志，私有方法，不允许外部调用
		log			        : fLog,		    //输出日志
		debug		        : fDebug,   	//输出调试
		info		        : fInfo,		//输出信息
		warn                : fWarn,        //输出警告信息
		error		        : fError,		//输出错误信息
		time                : fTime,        //输出统计时间,info级别
		trace               : fTrace,       //追踪统计时间
		count               : fCount,       //统计调用次数
		debugLog            : $H.noop,      //线上错误处理
		throwExp            : fThrowExp,            //处理异常
		listenCtrlEvts      : fListenCtrlEvts       //监听连续点击事件打开控制面板
	}
	
	//手动开启控制面板
	Debug.listenCtrlEvts();
	
	var _oTime={};
	
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
	function _fOut(oVar,bShowInPage,sType){
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
				+'<input id="'+sInputId+'" style="width:100%;padding:0.5em;font-size:1em;" type="text"/>';
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
				//命令行工具
				var oInput=oDocument.getElementById(sInputId);
				_fListen(oInput,'keypress',function(oEvt){
					oEvt=oEvt||window.event;
					var nKeyCode=oEvt.keyCode;
					//回车执行
					if(nKeyCode==10||nKeyCode==13){
						var sValue=oInput.value;
						try{
							Debug._out(sValue,true,'cmd');
							var result=eval(sValue);
							oInput.value='';
							Debug._out(result,true,'cmd');
						}catch(e){
							Debug._out(e,true,'error');
						}
					}
				});
			}
			//record时要弹出error，方便观察bug
			if((bShowInPage===true||Debug.showInPage===true)||sType=='error'){
				oDebugDiv.style.display ='block';
			}
			var oAppender=oDebugDiv.getElementsByTagName('DIV')[0];
			oVar=oVar instanceof Error?(oVar.stack||oVar.message):oVar;
			//这里原生的JSON.stringify有问题(&nbsp;中最后的'p;'会丢失)，统一强制使用自定义方法
			var sMsg=typeof oVar=='string'?oVar:Json.stringify(oVar, null, '&nbsp;&nbsp;&nbsp;&nbsp;',true);
			sMsg=sMsg&&sMsg
			.replace(/</gi,"&lt;")
			.replace(/>/gi,"&gt;")
			.replace(/\"/gi,"&quot;")
            .replace(/\'/gi,"&apos;")
            .replace(/ /gi,"&nbsp;")
            .replace(/\n|\\n/g,'<br/>');
			var sStyle;
			if(sType=='log'){
				sStyle='';
			}else{
				sStyle=' style="color:'+(sType=='error'?'red':sType=='warn'?'yellow':'green');
			}
			//自动保持滚动到底部
			var bStayBottom=true;
			//当手动往上滚动过时，保持滚动位置不变
			if(oAppender.scrollHeight-oAppender.scrollTop-oAppender.clientHeight>10){
				bStayBottom=false;
			}
			oAppender.innerHTML += '<div'+sStyle+'">'+sType+":<br/>"+sMsg+"</div><br/><br/>";
			if(bStayBottom){
				oAppender.scrollTop=oAppender.scrollHeight;
			}
		}
		try{
			//尝试获取调用位置
			var fCaller=arguments.callee.caller;
			if(!fCaller.$owner){
				//TODO:ipad mini2会发生错误：function.caller used to retrieve strict caller，所以需要catch住，原因待研究
				//fCaller=fCaller.caller;
			}
			
			//如果是类方法，输出方法定位信息
			if(typeof console!='undefined'){
				if(fCaller&&fCaller.$owner){
					console[sType]('['+fCaller.$owner.$ns+'->'+fCaller.$name+']');
				}
				console[sType](oVar);
			}
		}catch(e){
			$D.error(e.message);
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
		Debug._out(oVar,!!bShowInPage,'log');
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
		Debug._out(oVar,!!bShowInPage,'log');
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
		Debug._out(oVar,!!bShowInPage,'info');
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
		Debug._out(oVar,!!bShowInPage,'warn');
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
		Debug._out(oVar,!!bShowInPage,"error");
		if($H.isDev){
			if(oVar instanceof Error){
				//抛出异常，主要是为了方便调试，如果异常被catch住的话，控制台不会输出具体错误位置
				typeof console!=='undefined'&&console.error(oVar.stack)
				throw oVar;
			}
		}else{
			//线上自行实现log接口
			Debug.debugLog(oVar);
		}
	}
	/**
	 * 输出统计时间
	 * @param {boolean=}bOut 为true时，计算时间并输出信息，只有此参数为true时，后面两个参数才有意义
	 * @param {string=}sName 统计名
	 * @param {boolean=}bShowInPage 参照Debug.showInPage
	 */
	function fTime(bOut,sName,bShowInPage){
		if(Debug.level>Debug.INFO_LEVEL){
			return;
		}
		var nTime=window.performance&&window.performance.now?window.performance.now():(new Date().getTime());
		if(typeof bOut==='string'){
			sName=bOut;
			bOut=false;
		}
		if(bOut){
			if(typeof sName=='boolean'){
				bShowInPage=sName;
				sName='';
			}
			Debug._out((sName?sName+':':'')+(nTime-(_oTime[sName||'_lastTime']||0)),!!bShowInPage);
		}else{
			_oTime[[sName||'_lastTime']]=nTime;
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
	 * 统计调用次数
	 * @return {number} 返回统计次数
	 */
	function fCount(){
		if(!Debug._times){
			Debug._times=0;
		}
		return ++Debug._times;
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
				//连续点击5次(开发环境下)弹出控制面板
				if(nTimes>($H.isDev?3:6)){
					Debug._out('open console',true);
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