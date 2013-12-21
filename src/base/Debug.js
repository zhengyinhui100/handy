/**
 * 调试类，方便个浏览器下调试，在发布时统一删除调试代码
 * //TODO 快捷键切换调试等级
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add("Debug",['Json'],function($H){
	
	var Debug={
		level	    : 0,            //当前调试调试日志级别，只有级别不低于此标志位的调试方法能执行
		LOG_LEVEL	: 1,            //日志级别
		INFO_LEVEL  : 2,            //信息级别
		WARN_LEVEL  : 3,            //警告级别
		ERROR_LEVEL	: 4,            //错误级别
		DEBUG_LEVEL : 5,            //调试级别
		showInPage  : !("console" in window),        //是否强制在页面上输出调试信息，主要用于不支持console的浏览器，如：IE6，或者ietester里面
		log			: fLog,		    //输出日志
		info		: fInfo,		//输出信息
		warn        : fWarn,        //输出警告信息
		error		: fError,		//输出错误信息
		time        : fTime,        //输出统计时间,info级别
		debug		: fDebug		//出现调试断点
	}
	/**
	 * 输出信息
	 * @method _fOut
	 * @param {Object} oVar	需要输出的变量
	 * @param {boolean} bShowInPage 是否需要创建一个DIV输出到页面
	 * @param {string} sType 日志类型：log,info,error
	 */
	function _fOut(oVar,bShowInPage,sType){
		sType = sType||'log';
		//输出到页面
		if(bShowInPage||Debug.showInPage){
			var sDivId = $H.expando+'debugDiv';
			var oDocument = top.document;
			var oDebugDiv = oDocument.getElementById(sDivId);
			if(!oDebugDiv){
				oDebugDiv = oDocument.createElement("DIV");
				oDebugDiv.id = sDivId;
				oDebugDiv.innerHTML = '<a href="javascript:void(0)" onclick="this.parentNode.style.display=\'none\'">关闭</a>&nbsp;<a href="javascript:void(0)" onclick="this.parentNode.getElementsByTagName(\'DIV\')[0].innerHTML=\'\';">清空</a>&nbsp;<a href="javascript:void(0)" onclick="this.parentNode.style.height=\''+oDocument.body.offsetHeight+'px\';">全屏</a>&nbsp;<a href="javascript:void(0)" onclick="this.parentNode.style.height=\'100px\';">收起</a><div style="padding-top:5px"></div>';
				oDebugDiv.style.position = 'absolute';
				oDebugDiv.style.width = (oDocument.body.offsetWidth-20)+'px';
				oDebugDiv.style.left = 0;
				oDebugDiv.style.top = 0;
				oDebugDiv.style.right = 0;
				oDebugDiv.style.height = '100px';
				oDebugDiv.style.backgroundColor = '#aaa';
				oDebugDiv.style.fontSize = '12px';
				oDebugDiv.style.padding = '10px';
				oDebugDiv.style.overflow = 'auto';
				oDebugDiv.style.zIndex = 9999999;
				oDebugDiv.style.opacity=0.5;
				oDebugDiv.style.filter="alpha(opacity=50)";
				oDocument.body.appendChild(oDebugDiv);
			}else{
				oDebugDiv.style.display = 'block';
			}
			var oVarDiv = oDocument.createElement("DIV");
			//TODO JSON
			oVarDiv.innerHTML = sType+":<br/>"+JSON.stringify(oVar, null, '<br/>');
			var oAppender=oDebugDiv.getElementsByTagName('DIV')[0];
			oAppender.innerHTML = oAppender.innerHTML+oVarDiv.innerHTML+"<br/>";
		}
		try{
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
		_fOut(oVar,!!bShowInPage,'log');
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
		_fOut(oVar,!!bShowInPage,'info');
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
		_fOut(oVar,!!bShowInPage,'warn');
	}
	/**
	 * 输出错误
	 * @method error
	 * @param {Object} oVar	需要输出的变量
	 * @param {boolean} bShowInPage 是否需要创建一个DIV输出到页面
	 */
	function fError(oVar,bShowInPage){
		if(Debug.level>Debug.ERROR_LEVEL){
			return;
		}
		_fOut(oVar,!!bShowInPage,"error");
	}
	/**
	 * 输出统计时间
	 * @method time
	 * @param {string}sMsg 输出的信息
	 * @param {boolean}bOut 为true时，计算时间并输出信息
	 * @param {boolean}bShowInPage 是否需要创建一个DIV输出到页面
	 */
	function fTime(sMsg,bOut,bShowInPage){
		if(Debug.level>Debug.INFO_LEVEL){
			return;
		}
		sMsg=sMsg||'';
		if(bOut){
			_fOut(sMsg+", 消耗时间:"+(new Date().getTime()-(Debug.lastTime||0)),!!bShowInPage)
		}else{
			Debug.lastTime=new Date().getTime();
		}
	}
	/**
	 * 添加调试断点
	 * @method debug
	 * @param {Object} fCondiction	输出断点的条件就判断是否返回true，也可以不传，不传为默认debug
	 */
	function fDebug(fCondiction){
		if(Debug.level>Debug.DEBUG_LEVEL){
			return;
		}
		if(typeof fCondiction != 'undefined'){
			if(!fCondiction()){
				return;
			}
		}
		debugger;
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
	
})