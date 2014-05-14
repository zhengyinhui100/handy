/**
 * 模板类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('Template',['B.Object','B.String','B.Debug','B.Function'],function(Object,String,Debug,Function,$H){
		
	var T={
		//配置
		openTag         : '{{',            //模板语法开始标签
		closeTag        : '}}',            //模板语法结束标签
		isTrim          : true,            //是否过滤标签间空白和换行
		isEscape        : true,            //是否开启js变量输出转义
		
		registerHelper  : fRegisterHelper, //添加辅助函数
		tmpl            : fTmpl            //编译/渲染模板
	};
	
	
	var _cache={},                //缓存
		_aCode,                   //存储用于生成模板函数的代码字符串
		_valPreReg=/^=/,          //简单替换正则
		_isNewEngine = ''.trim,   // '__proto__' in {}
		//字符拼接的声明及收尾
		_aJoinDefine=[           
			'var $r='+(_isNewEngine?'""':'[]')+',$tmp,helper;',
			'return '+(_isNewEngine?'$r;':'$r.join("");')
		],
		//辅助函数
		_helpers={
			'if':_fIf,
			'unless':_fUnless,
			'each':_isNewEngine?_fEach:_fEachOld,
			escape:String.escapeHTML,
			trim:String.trim
		};
		
	/**
	 * if辅助函数
	 * @param {string|function}conditional 条件语句
	 * @param {object}oOptions 选项{
	 * 		{boolean=}inverse:true时表示条件反转
	 * 		{function}fn:回调函数
	 * }
	 * @return {string=} 返回生成的html
	 */
	function _fIf(conditional, oOptions){
		if (Object.isFunc(conditional)) { 
			conditional = conditional.call(this); 
		}
		if(conditional||(!conditional&&oOptions.inverse)){
			return oOptions.fn(this);
		}
	}
	/**
	 * unless辅助函数
	 * 同if辅助函数
	 */
	function _fUnless(conditional, oOptions){
		oOptions.inverse=true;
		return _helpers['if'].call(this, conditional, oOptions);
	}
	/**
	 * each辅助函数，新式浏览器里使用，chrome下性能大约提升一倍
	 * @param {array|object}data 可遍历数据对象
	 * @param {object}oOptions 选项{
	 * 		{function}fn:回调函数
	 * }
	 * @return {string=} 返回生成的html
	 */
	function _fEach(data,oOptions){
		var fn=oOptions.fn,r='';
		//这里为了优化性能，使用原生循环，比换成Object.each整体性能提升5~10%左右
		if(!data){
			return;
		}
		if(data.length!=undefined){
			for(var i=0,l=data.length;i<l;i++){
				r+=fn(data[i]);
			}
		}else{
			for(var i in data){
				r+=fn(data[i]);
			}
		}
		return r;
	}
	/**
	 * each辅助函数，使用数组拼接字符串，在旧式浏览器中使用
	 * 同上个each
	 */
	function _fEachOld(data,oOptions){
		var fn=oOptions.fn,aResult=[];
		//这里为了优化性能，使用原生循环，比换成Object.each整体性能提升5~10%左右
		if(!data){
			return;
		}
		if(data.length!=undefined){
			for(var i=0,l=data.length;i<l;i++){
				aResult.push(fn(data[i]));
			}
		}else{
			for(var i in data){
				aResult.push(fn(data[i]));
			}
		}
		return aResult.join('');
	}
	/**
	 * 结果函数添加一行字符串
	 * @method _fAddLine
	 * @param {string}sCode 要添加的代码
	 * @return {string} 返回添加好的代码
	 */
	function _fAddLine(sCode){
		//旧浏览器使用数组方式拼接字符串
        return _isNewEngine?'$r+='+sCode+';':'$r.push('+sCode+');';
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
		return _fAddLine('"'+sHtml+'"');
	}
	/**
	 * 处理脚本
	 * @method _fParseScript
	 * @param {object}oScript AST的script元素
	 * @return {string} 返回处理过的脚本
	 */
	function _fParseScript(oScript){
		var sExp=oScript.exp;
		var sHelper=oScript.helper;
		var aChildren=oScript.children;
		var nNumber=oScript.num;
		var sCode;
		var sAdd='\nif($tmp||$tmp===0){'+_fAddLine('$tmp')+'}';
		//辅助函数
		if(sHelper){
			var sProgramName='$program'+nNumber;
			sCode='$tmp = $helpers.'+sHelper+'.call($data, ($data && $data.'+sExp+'), {fn:'+sProgramName
					+(oScript.inverse?',inverse:true':'')+'});'+sAdd;
			if(aChildren){
				var aCode=_fCompileAST(aChildren);
				var sCodeInner=_aJoinDefine[0]+'\n'+aCode.join('\n')+'\n'+_aJoinDefine[1];
				//插入到变量声明后
				_aCode.splice(2,0,'\nfunction '+sProgramName+'($data){\n'+sCodeInner+'\n}\n');
			}
		}else{
			//直接表达式
			sCode='if (helper = $helpers.'+sExp+') {\n$tmp = helper.call($data); \n}'+
			  		'else{\nhelper = ($data && $data.'+sExp+'); $tmp = typeof helper === functionType ? helper.call($data) : helper;\n}'+
			  		sAdd;
		}
		return sCode;
	}
	/**
	 * 分析模板，生成基本语法树
	 * @param {string}sTmpl 模板字符串
	 * @param {Object=}oParent 父节点，主要用于递归调用
	 * @param {number=}nNumber 当前节点编号，主要用于递归调用
	 * @return {Object} 返回生成的语法树
	 */
	function _fParseTmpl(sTmpl,oParent,nNumber){
		if(!sTmpl){
			return;
		}
		
		var oRoot=oParent||{},
		nNumber=nNumber||0,
		sOpenTag=T.openTag,
		sCloseTag=T.closeTag,
		nIndex,
		aAst;
		if(oRoot.children){
			aAst=oRoot.children;
		}else{
			oRoot.children=aAst=[];
		}
		
		//查找块结束位置
		function _fSearchEnd(sName,sEndTag,sTmpl){
			//查找匹配的结束标签{{/if}}
			var oMacther,oReg=new RegExp(sOpenTag+'[#\/]'+sName+sCloseTag,'ig'),num=0;
			while(oMacther=oReg.exec(sTmpl)){
				if(oMacther[0]==sEndTag){
					if(num==0){
						return oMacther.index;
					}else{
						num--;
					}
				}else{
					num++;
				}
			}
			return -1;
		}
		
		//'<div>{{#if title}}<div>{{title}}</div>{{else}}<div>empty</div>{{/if}}</div>'
		if((nIndex=sTmpl.indexOf(sOpenTag))>=0){
			//'<div>'
			var sHtml=sTmpl.substring(0,nIndex);
			if(sHtml){
				aAst.push({
					html:sHtml
				});
			}
			//'#if title}}<div>{{title}}</div>{{else}}<div>empty</div>{{/if}}</div>'
			sTmpl=sTmpl.substring(nIndex+sOpenTag.length);
			if(sTmpl.indexOf('#')==0){
				sTmpl=sTmpl.substring(1);
				var aName=sTmpl.match(/^[a-z]+/);
				//['if']
				if(aName){
					var sName=aName[0];
					if(_helpers[sName]){
						
						nIndex=sTmpl.indexOf(sCloseTag);
						//'title'
						var sExp=sTmpl.substring(sName.length+1,nIndex);
						//'<div>{{title}}</div>{{else}}<div>empty</div>{{/if}}</div>'
						sTmpl=sTmpl.substring(nIndex+sCloseTag.length);
						var oCurrent={
							num:++nNumber,
							helper:sName,
							//'item in list'
							exp:sExp
						}
						aAst.push(oCurrent);
						
						//'{{/if}}'
						var sEndTag=sOpenTag+'/'+sName+sCloseTag;
						//查找块结束位置
						nIndex=_fSearchEnd(sName,sEndTag,sTmpl);
						var sContent;
						if(nIndex==-1){
							Debug.error('未找到块结束位置:'+sEndTag);
							return;
						}else{
							//'<div>{{title}}</div>{{else}}<div>empty</div>'
							sContent=sTmpl.substring(0,nIndex);
							//'</div>'
							sTmpl=sTmpl.substring(nIndex+sEndTag.length);
						}
						
						//分析子内容
						_fParseTmpl(sContent,oCurrent,++nNumber);
						
						//检出else
						if(sName=='if'){
							var aChildNodes=oCurrent.children;
							for(var i=0,l=aChildNodes.length;i<l;i++){
								var oChd=aChildNodes[i];
								if(oChd.exp=='else'){
									//把else块提出到if块后面
									oChd.exp=oCurrent.exp;
									oChd.helper='if';
									//nNumber在分析子内容时已加1
									oChd.num=nNumber;
									oChd.inverse=true;
									oChd.children=aChildNodes.slice(i+1);
									aAst.push(oChd);
									oCurrent.children=aChildNodes.slice(0,i);
								}
							}
						}
					}else{
						Debug.error('辅助函数‘'+sName+'’未定义');
						return;
					}
				}else{
					Debug.error('找不到辅助函数:'+sTmpl);
					return;
				}
			}else{
				nIndex=sTmpl.indexOf(sCloseTag);
				aAst.push({
					exp:sTmpl.substring(0,nIndex)
				});
				sTmpl=sTmpl.substring(nIndex+sCloseTag.length);
			}
			//继续处理后续模板
			_fParseTmpl(sTmpl,oRoot,++nNumber);
		}else if(sTmpl){
			aAst.push({
				html:sTmpl
			});
		}
		return oRoot;
	}
	/**
	 * 编译AST
	 * @param  {array}aAST 表达式列表
	 * @return {array}     返回编译好的代码数组
	 */
	function _fCompileAST(aAST){
		var aCode=[];
		if(aAST){
			for(var i=0,len=aAST.length;i<len;i++){
				var oItem=aAST[i];
				if(oItem.html){
					aCode.push(_fParseHtml(oItem.html));
				}else if(oItem.exp){
					aCode.push(_fParseScript(oItem));
				}
			}
		}
		return aCode;
	}
	/**
	 * 编译模板
	 * @method _fCompile
	 * @param  {string}sTmpl 模板字符串
	 * @return {string}      返回结果字符串
	 */
	function _fCompile(sTmpl){
		//过滤无用的空白和换行
		if(T.isTrim){
			var sOpenTag=T.openTag,
			sCloseTag=T.closeTag;
			sTmpl=sTmpl.replace(/^[\s\n]+/,'').replace(/[\s\n]+$/,'').replace(new RegExp('('+sCloseTag+'|\\>)(\\s|\\n)+(?=('+sOpenTag+'|<))','ig'),'$1').
			replace(new RegExp(sCloseTag+'[\\s\\n]+([^\\n]+)[\\s\\n]+(?=('+sOpenTag+'|<))','ig'),sCloseTag+'$1');
		}
		//旧浏览器使用数组方式拼接字符串
		_aCode=[_aJoinDefine[0]];
		_aCode.push('var escape=$helpers.escape,functionType="function";');
		
		var oAst=_fParseTmpl(sTmpl);
		
		var aCode=_fCompileAST(oAst.children);
		
		
		_aCode=_aCode.concat(aCode);
		
		_aCode.push(_aJoinDefine[1]);
		var sCode=_aCode.join('\n');
		try{
			var aParams = ["$T", "$helpers", "$data",sCode];
			var fRender=window.Function.apply(null,aParams);
			//TODO
			Debug.log(fRender);
			Debug.log('\n\n\n\n\n\n\n\n\n\n');
			return function($data){
				return fRender.call(null,T,_helpers,$data);
			}
		}catch(e){
			Debug.log(sCode);
			Debug.error(e);
		}
	}
	/**
	 * 添加辅助函数
	 * @param {string|Object}sName 辅助函数名
	 * @param {Function}fHelper 辅助函数
	 */
	function fRegisterHelper(sName,fHelper){
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
			try{
				return fTmpl(oData);
			}catch(e){
				Debug.log(fTmpl.toString());
				Debug.error(e);
			}
		}else{
			return fTmpl;
		}
	}
	
	return T;
	
});