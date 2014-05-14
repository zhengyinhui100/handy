/**
 * 简单模板类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('SimpleTmpl',['B.String','B.Debug'],function(String,Debug,$H){
		
	var T={
		//配置
		openTag         : '<%',            //模板语法开始标签
		closeTag        : '%>',            //模板语法结束标签
		isEscape        : true,            //是否开启js变量输出转义
		
		registerHelper  : fRegisterHelper, //添加辅助函数
		tmpl            : fTmpl            //渲染模板
	};
	
	var _cache={},                //缓存
		_valPreReg=/^=/,          //简单替换正则
		_isNewEngine = ''.trim,   // '__proto__' in {}
		//辅助函数
		_helpers={
			escape:String.escapeHTML,
			trim:String.trim
		},
		//辅助函数内部定义语句
		_helpersDefine='var oHelpers=arguments.callee.$helpers,escape=oHelpers.escape,trim=oHelpers.trim,';
		
	/**
	 * 设置变量
	 * @method _fSetValue
	 * @param  {string}sTmpl 模板字符串
	 * @param  {Object}oData     	数据
	 * @return {string}          返回结果字符串
	 */
	function _fSetValue(sTmpl,oData){
		return sTmpl.replace(_valPreReg,function(){
			return oData&&oData[arguments[1]]||'';
		});
	}
	/**
	 * 结果函数添加一行字符串
	 * @method _fAddLine
	 * @param {string}sCode 要添加的代码
	 * @return {string} 返回添加好的代码
	 */
	function _fAddLine(sCode){
		//旧浏览器使用数组方式拼接字符串
        return _isNewEngine?'$r+='+sCode+';\n':'$r.push('+sCode+');\n';
	}
	/**
	 * 处理html
	 * @method _fParseHtml
	 * @param {string}sHtml html字符串
	 * @return {string} 返回处理过的html
	 */
	function _fParseHtml(sHtml){
		sHtml=sHtml
			// 引号与反斜杠转义
            .replace(/("|\\)/g, '\\$1')
            // 换行符转义(windows + linux)
            .replace(/\r/g, '\\r')
            .replace(/\n/g, '\\n')
		var sCode=_fAddLine('"'+sHtml+'"');
		return sCode;
	}
	/**
	 * 处理脚本
	 * @method _fParseScript
	 * @param {string}sScript script字符串
	 * @return {string} 返回处理过的脚本
	 */
	function _fParseScript(sScript){
		sScript=sScript.replace(/this/g,'$data');
		//输出内容
		if(sScript.indexOf('=')==0){
			var sExp="("+sScript.replace(_valPreReg,'')+")";
			sExp=sExp+'==undefined?"":'+sExp;
			sScript=_fAddLine(sExp);
		}
		return sScript+"\n";
	}
	/**
	 * 编译模板
	 * @method _fCompile
	 * @param  {string}sTmpl 模板字符串
	 * @return {string}      返回结果字符串
	 */
	function _fCompile(sTmpl){
		//旧浏览器使用数组方式拼接字符串
		var sCode=_helpersDefine+'$r='+(_isNewEngine?'""':'[]')+';\n';
		var oMatch;
		//循环处理模板，分离html和script部分
		$H.Object.each(sTmpl.split(T.openTag),function(i,sValue){
			var aCode=sValue.split(T.closeTag);
			//[html]
			if(aCode.length==1){
				sCode+=_fParseHtml(aCode[0]);
			}else{
				//[script,html]
				sCode+=_fParseScript(aCode[0]);
				if(aCode[1]){
					sCode+=_fParseHtml(aCode[1]);
				}
			}
		})
		sCode+='return '+(_isNewEngine?'$r;':'$r.join("");');
		try{
			var fRender=new Function('$data',sCode);
		}catch(e){
			Debug.log(sCode);
			Debug.error(e);
			return;
		}
		fRender.$helpers=_helpers;
		return fRender;
	}
	/**
	 * 添加辅助函数
	 * @param {string}sName 辅助函数名
	 * @param {Function}fHelper 辅助函数
	 */
	function fRegisterHelper(sName,fHelper){
		if(!_helpers[sName]){
			_helpersDefine+=sName+'=oHelpers.'+sName+',';
		}
		_helpers[sName]=fHelper;
	}
	/**
	 * 执行模板
	 * @method tmpl
	 * @param {object|string|Array}tmpl 当tmpl为字符串或字符串数组时，表示模板内容，为对象时如下：
	 * {
	 * 		{string}id : 模板的id，要使用缓存，就必须传入id
	 * 		{string|Array=}tmpl : 模板字符串，以id为缓存key，此参数为空时，表示内容为根据id查找到的script标签的内容
	 * }
	 * @param {object}oData 数据
	 * @return {function|string} 当oData为空时返回编译后的模板函数，不为空时返回渲染后的字符串
	 */
	function fTmpl(tmpl,oData){
		var sTmpl,fTmpl,sId;
		if(typeof tmpl=='string'){
			sTmpl=tmpl;
		}else if(tmpl.length!=undefined){
			sTmpl=tmpl.join('');
		}else{
			sTmpl=tmpl.tmpl;
			if(sId=tmpl.id){
			    if (_cache[sId]) {
			        fTmpl = _cache[sId];
			    } else if(!sTmpl) {
			    	//从script标签获取模板
			        var oEl = document.getElementById(sId);
			        if (oEl) {
			            sTmpl = (oEl.value || oEl.innerHTML).replace(/\s/g, '');
			        }
			    }
			}
		}
		if(!fTmpl){
			if(!sTmpl){
				$H.Debug.error('模板未定义');
				return;
			}
			fTmpl=_fCompile(sTmpl);
			//根据id缓存
			if(sId){
				_cache[sId]=fTmpl;
			}
		}
		//渲染数据
		if(oData){
			return fTmpl(oData);
		}else{
			return fTmpl;
		}
	}
	
	return T;
	
});