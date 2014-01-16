/**
 * 模板类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('Template',function($H){
	
	var _cache={},             //缓存
		_valPreReg=/^=/,        //简单替换正则
		_isNewEngine = ''.trim;   // '__proto__' in {}
		
	var T={
		openTag         : '<%',            //模板语法开始标签
		closeTag        : '%>',            //模板语法结束标签
		
		_setValue       : _fSetValue,      //设置变量
		_add            : _fAdd,           //结果函数添加一行字符串
		_parseHtml      : _fParseHtml,     //处理html
		_parseScript    : _fParseScript,   //处理脚本
		_compile        : _fCompile,       //编译模板
		tmpl            : fTmpl            //渲染模板
	};
	/**
	 * 设置变量
	 * @method _setValue
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
	 * @method _add
	 * @param {string}sCode 要添加的代码
	 * @return {string} 返回添加好的代码
	 */
	function _fAdd(sCode){
		//旧浏览器使用数组方式拼接字符串
        return _isNewEngine?'$r+='+sCode+';\n':'$r.push('+sCode+');\n';
	}
	/**
	 * 处理html
	 * @method _parseHtml
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
		var sCode=T._add('"'+sHtml+'"');
		return sCode;
	}
	/**
	 * 处理脚本
	 * @method _parseScript
	 * @param {string}sScript script字符串
	 * @return {string} 返回处理过的脚本
	 */
	function _fParseScript(sScript){
		sScript=sScript.replace(/this/g,'$data');
		if(sScript.indexOf('=')==0){
			sScript=T._add(sScript.replace(_valPreReg,'')+'||""');
		}
		return sScript+"\n";
	}
	/**
	 * 编译模板
	 * @method _compile
	 * @param  {string}sTmpl 模板字符串
	 * @return {string}      返回结果字符串
	 */
	function _fCompile(sTmpl){
		//旧浏览器使用数组方式拼接字符串
		var sCode='var $r='+(_isNewEngine?'""':'[]')+';\n';
		var oMatch;
		//循环处理模板，分离html和script部分
		$H.Object.each(sTmpl.split(T.openTag),function(i,sValue){
			var aCode=sValue.split(T.closeTag);
			//[html]
			if(aCode.length==1){
				sCode+=T._parseHtml(aCode[0]);
			}else{
				//[script,html]
				sCode+=T._parseScript(aCode[0]);
				if(aCode[1]){
					sCode+=T._parseHtml(aCode[1]);
				}
			}
		})
		sCode+='return '+(_isNewEngine?'$r;':'$r.join("");');
		$D.log(sCode)
		return new Function('$data',sCode);
	}
	/**
	 * 执行模板
	 * @method tmpl
	 * @param {object|string}tmpl 当tmpl为字符串时，表示模板内容，为对象时如下：
	 * {
	 * 		{string}id : 模板的id，要使用缓存，就必须传入id
	 * 		{string=}tmpl : 模板字符串，以id为缓存key，此参数为空时，表示内容为根据id查找到的script标签的内容
	 * }
	 * @param {object}oData 数据
	 * @return {function|string} 当oData为空时返回编译后的模板函数，不为空时返回渲染后的字符串
	 */
	function fTmpl(tmpl,oData){
		var sTmpl,fTmpl,sId;
		if(typeof tmpl=='string'){
			sTmpl=tmpl;
		}else{
			sTmpl=tmpl.tmpl;
			if(sId=tmpl.id){
			    if (_cache[sId]) {
			        fTmpl = _cache[sId];
			    } else {
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
			fTmpl=T._compile(sTmpl);
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