/**
 * 模型视图类，实现视图与数据的同步
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-05-11
 */
//"handy.common.ModelView"
$Define('CM.ModelView',
[
'B.Template',
'CM.AbstractView',
'CM.Model',
'CM.Collection'
],
function(Template,AbstractView,Model,Collection){
	
	var ModelView=AbstractView.derive({
		bindType            : 'both',              //绑定类型，‘el’表示绑定节点，‘model’表示绑定模型，‘both’表示双向绑定
//		model               : null,                //模型对象
//		xmodel              : null,                //执行模板时使用的模型对象，本类中与model属性相同
//		modelClass          : null,                //模型类
//		_bindModelNums      : {},				   //保存逻辑块对应编号是否已绑定模型
//		_bindElNums         : {},                  //保存逻辑块对应编号是否已绑定节点
		
		initialize          : fInitialize,         //初始化
		doConfig            : fDoConfig,           //初始化配置
		preTmpl             : fPreTmpl,            //预处理模板
		getTmplFn           : fGetTmplFn,          //初始化模板函数
		getHtml             : fGetHtml,            //初始化html
		ifBind              : fIfBind,             //查询指定逻辑单元是否需要绑定模型对象或节点，检查后设为已绑定，确保每个逻辑单元只绑定一次事件
		updateMetaMorph     : fUpdateMetaMorph,    //更新内容
		wrapMetaMorph       : fWrapMetaMorph,      //包装结果html
		get                 : fGet,                //获取配置属性
    	set                 : fSet,                //设置配置属性
		update              : fUpdate,             //更新数据
		getXmodel           : fGetXmodel           //获取配置对象
	});
	
	//注册自定义辅助函数
	Template.registerHelper('ModelView',{
		'if'       : fIf,
		'unless'   : fUnless,
		'each'     : fEach,
		getValue   : fGetValue,
		parseValue : fParseValue,
		bindAttr   : fBindAttr,
		input      : fInput,
		textarea   : fTextarea
	});
	
	var _bIfPlusJoin=Template.getIfPlusJoin();
	var _oExecAttrs=/((\w+)=['"]?)?([#\w][\s\w\.\?:#-]*)(['"]?)(?!\w*=)/g;
	
	/**
	 * if辅助函数
	 * @param {string|function}condition 条件语句
	 * @param {object}oOptions 选项{
	 * 		{boolean=}inverse:true时表示条件反转,
	 * 		{function}fn:回调函数,
	 * 		{string}exp:表达式,
	 * 		{object}context:模板函数执行上下文对象,
	 * 		{*}data:当前数据对象,
	 * 		{number}num:逻辑编号,
	 * 		{object}helpers:辅助函数表
	 * }
	 * @return {string} 返回生成的html
	 */
	function fIf(condition,oOptions){
		var me=oOptions.context;
		var oData=oOptions.data;
		var sExp=oOptions.exp;
		if ($H.isFunc(condition)) { 
			condition = condition.call(oData); 
		}
		var sHtml;
		if((condition&&!oOptions.inverse)||(!condition&&oOptions.inverse)){
			sHtml=oOptions.fn(oData);
		}
		var nNum=oOptions.num;
		var sMetaId=me.getCid()+'-'+nNum;
		if(me.ifBind(nNum,oData)){
			me.listenTo(oData,'change:'+sExp,function(sName,oModel,sValue){
				var sHtml;
				if((sValue&&!oOptions.inverse)||(!sValue&&oOptions.inverse)){
					var data={};
					data[sExp]=sValue;
					sHtml=oOptions.fn(data);
				}
				me.updateMetaMorph(sMetaId,sHtml);
			});
		}
		return me.wrapMetaMorph(sMetaId,sHtml);
	}
	/**
	 * unless辅助函数
	 * 参数说明同if辅助函数
	 */
	function fUnless(condition, oOptions){
		oOptions.inverse=true;
		return oOptions.helpers['if'].call(this, condition, oOptions);
	}
	/**
	 * each辅助函数，新式浏览器里使用，chrome下性能大约提升一倍
	 * @param {array|object}data 可遍历数据对象
	 * @param {object}oOptions 选项，参数说明同if辅助函数
	 * @return {string} 返回生成的html
	 */
	function fEach(data,oOptions){
		var me=oOptions.context;
		var fn=oOptions.fn,r=_bIfPlusJoin?'':[];
		var nNum=oOptions.num;
		var sMetaId=me.getCid()+'-'+nNum;
		if(!data){
			return;
		}
		var sTmp;
		//集合类型数据
		if(data instanceof Collection){
			data.each(function(i,item){
				sTmp=me.wrapMetaMorph(sMetaId+'-'+item.uuid,fn(item));
				if(_bIfPlusJoin){
					r+=sTmp;
				}else{
					r.push(sTmp);
				}
			});
			if(me.ifBind(nNum,data)){
				me.listenTo(data,'add',function(sEvt,oModel,oCollection,oOptions){
					var sHtml=me.wrapMetaMorph(sMetaId+'-'+oModel.uuid,fn(oModel));
					var at=oOptions.at;
					if(at){
						var oPre=oCollection.at(at-1);
						var n=sMetaId+'-'+oPre.uuid;
						$('#metamorph-'+n+'-end').after(sHtml);
					}else{
						$('#metamorph-'+sMetaId+'-end').before(sHtml);
					}
				});
				me.listenTo(data,'remove',function(sEvt,oModel,oCollection,oOptions){
					var n=sMetaId+'-'+oModel.uuid;
					me.updateMetaMorph(n,'','remove');
				});
			}
		}else if(data.length!==undefined){
			for(var i=0,l=data.length;i<l;i++){
				sTmp=me.wrapMetaMorph(sMetaId+'-'+i,fn(data[i]));
				if(_bIfPlusJoin){
					r+=sTmp;
				}else{
					r.push(sTmp);
				}
			}
		}else{
			for(var i in data){
				sTmp=me.wrapMetaMorph(sMetaId+'-'+i,fn(data[i]));
				if(_bIfPlusJoin){
					r+=sTmp;
				}else{
					r.push(sTmp);
				}
			}
		}
		return me.wrapMetaMorph(sMetaId,_bIfPlusJoin?r:r.join(''));
	}
	/**
	 * 获取值
	 * @param {string}sExp 表达式
	 * @param {object}oData 数据对象
	 * @return {string} 返回值
	 */
	function fGetValue(sExp,oData){
		var sValue=oData.get?oData.get(sExp):oData[sExp];
		return sValue;
	}
	/**
	 * 分析处理值
	 * @param {string}sValue 当前要处理的值
	 * @param {object}oOptions 选项，参数说明同if辅助函数
	 * @return {string} 返回生成的html
	 */
	function fParseValue(sValue,oOptions){
		var me=oOptions.context;
		var oData=oOptions.data;
		var sExp=oOptions.exp;
		var bIsEscape=Template.isEscape;
		var oHelpers=oOptions.helpers;
		var nNum=oOptions.num;
		var sMetaId=me.getCid()+'-'+nNum;
		if(me.ifBind(nNum,oData)){
			me.listenTo(oData,'change:'+sExp,function(sName,oModel,sValue){
				if(bIsEscape){
					sValue=oHelpers.escape(sValue);
				}
				me.updateMetaMorph(sMetaId,sValue);
			});
		}
		if(bIsEscape){
			sValue=oHelpers.escape(sValue);
		}
		return me.wrapMetaMorph(sMetaId,sValue);
	}
	/**
	 * 绑定属性，使用形式如：<input type="text" {{bindAttr id="#input2" disabled?disabled value="value" class="isRed?red:green extCls #static-cls"}}/>
	 * id="#input2"，#开头表示常量，直接输出id=input2;
	 * dis?disabled，当dis字段为真(即：if(dis))时输出，disabled="disabled"，否则输出空字符；
	 * value="value"，如果value的值为my value，输出value="my value"；
	 * isRed?red:green，如果isRed为真，输出red，否则输出green
	 * @param {string}sExp 表达式
	 * @param {object}oOptions 选项，参数说明同if辅助函数，特殊：type表示输入框类型input或textarea
	 * @return {string} 返回生成的html
	 */
	function fBindAttr(sExp,oOptions){
		var me=oOptions.context,
		oData=oOptions.data,
		nNum=oOptions.num,
		sType=oOptions.type,
		sMetaId=me.getCid()+'-'+nNum,
		sId='bindAttr-'+sMetaId,
		m,
		result=[],
		aMatches=[],
		bBindModel=me.ifBind(nNum,oData),
		bBindEl=sType&&me.ifBind(nNum,oData,true);
		
		//循环分析表达式，先找出id属性
		while(m=_oExecAttrs.exec(sExp)){
			if(m[2]=='id'){
				if(m[3].indexOf('this.')==0){
					sId= me[m[3].substring(5)];
				}else{
					sId=_fGetVal(m[3],oData);
				}
			}else{
				aMatches.push(m);
			}
		}
		
		result.push('id="'+sId+'"');
		
		//循环处理表达式
		var expStr,sAttr,aExps,aValues,ret;
		for(var i=0,len=aMatches.length;i<len;i++){
			m=aMatches[i];
			sAttr=m[2];
			expStr=m[3];
			aExps=expStr.split(' ');
			aValues=[];
			//多个表达式用空格分开
			for(var j=0;j<aExps.length;j++){
				ret=fParseAttrExp(me,sId,sAttr,aExps[j],bBindModel,bBindEl,oData);
				if(ret||ret===0){
					aValues.push(ret);
				}
			}
			var sVal=aValues.join(' ');
			//有属性名的绑定
			if(sAttr){
				//传递结果值给输入框辅助函数
				if(sType&&sAttr=='value'){
					oOptions.value=sVal;
				}
				sVal=(m[1]||'')+sVal+m[4];
			}else if(sVal){
				//无属性，如：isChk?checked
				sVal=sVal+'="'+sVal+'"';
			}
			sVal&&result.push(sVal);
		}
		
		return ' '+result.join(' ')+' ';
	}
	/**
	 * 根据表达式获取结果，用于属性绑定
	 * @param {string}sExp 参数表达式
	 * @param {object}oData 当前数据对象
	 * @return {string} 返回结果
	 */
	function _fGetVal(sExp,oData){
		if(!sExp){
			return sExp;
		}
		//#开头表示常量
		if(sExp.indexOf('#')==0){
			return sExp.substring(1);
		}else{
			return fGetValue(sExp,oData);
		}
	}
	/**
	 * 分析处理属性表达式
	 * @param {object}oContext 上下文对象
	 * @param {string}sId 当前节点的id
	 * @param {string}sAttr 要绑定的属性名
	 * @param {string}sExp 表达式
	 * @param {boolean}bListen 是否需要监听事件
	 * @param {object}oData 当前数据对象
	 * @return {string} 返回属性值
	 */
	function fParseAttrExp(oContext,sId,sAttr,sExp,bBindModel,bBindEl,oData){
		var me=oContext,val,
		sId='#'+sId,
		nMark1=sExp.indexOf('?'),
		nMark2=sExp.indexOf(':');
		//三目运算exp1?exp2:exp3、exp1?exp2、exp1:esExp
		if(sExp.indexOf('this.')==0){
			return me[sExp.substring(5)];
		}else if(nMark1>0||nMark2>0){
			var exp1=sExp.substring(0,nMark1>0?nMark1:nMark2);
			var exp2=nMark1<0?'':sExp.substring(nMark1+1,nMark2>0?nMark2:sExp.length);
			var exp3=nMark2<0?'':sExp.substring(nMark2+1,sExp.length);
			val=_fGetVal(exp1,oData);
			if(bBindModel&&exp1.indexOf('#')!=0){
				me.listenTo(oData,"change:"+exp1,function(sName,oModel,sValue){
					var jEl=$(sId);
					if(!sAttr){
						//没有属性值，如：isChk?checked或者isDisabled?disabled
						if(sValue){
							jEl.prop(exp2,true);
						}else{
							jEl.prop(exp2,false);
						}
					}else if(sAttr=='class'){
						if(sValue){
							exp3&&jEl.removeClass(exp3);
							exp2&&jEl.addClass(exp2);
						}else{
							exp2&&jEl.removeClass(exp2);
							exp3&&jEl.addClass(exp3);
						}
					}else{
						jEl.attr(sAttr,sValue?exp2:exp3);
						
					}
				});
			}
			return val?exp2:exp3;
		}else{
			val=_fGetVal(sExp,oData);
			if(sExp.indexOf('#')!=0){
				bBindModel&&me.listenTo(oData,"change:"+sExp,function(sName,oModel,sValue){
					var jEl=$(sId);
					if(sAttr=='class'){
						jEl.removeClass(val);
						jEl.addClass(sValue);
						//更新闭包的值
						val=sValue;
					}else{
						jEl.attr(sAttr,sValue||'');
					}
				});
				if(sAttr=='value'&&bBindEl){
					me.listen({
						name:'input propertychange',
						el:sId,
						handler:function(evt){
							oData.set(sExp,evt.target.value);
						}
					});
				}
			}
			return val;
		}
	}
	/**
	 * input框辅助函数，用于生产input
	 * @param {string}sExp 表达式
	 * @param {object}oOptions 选项，参数说明同if辅助函数
	 */
	function fInput(sExp,oOptions){
		oOptions.type='input';
		var sHtml=fBindAttr(sExp,oOptions);
		return '<input '+sHtml+'/>';
	}
	/**
	 * textarea框辅助函数，用于生产textarea
	 * @param {string}sExp 表达式
	 * @param {object}oOptions 选项，参数说明同if辅助函数
	 */
	function fTextarea(sExp,oOptions){
		oOptions.type='textarea';
		var sHtml=fBindAttr(sExp,oOptions);
		return '<textarea '+sHtml+'>'+oOptions.value+'</textarea>';
	}
	
	/**
	 * 初始化
	 * @method initialize
	 * @param {Object}oParams 初始化参数
	 */
	function fInitialize(oParams){
		var me=this;
		me._bindModelNums={};
		me._bindElNums={};
		me.callSuper();
	}
	/**
	 * 初始化配置
	 * @method doConfig
	 * @param {Object}oSettings 初始化参数
	 */
	function fDoConfig(oSettings){
		var me=this;
		me.callSuper();
		var cModel=me.modelClass||Model;
		if(!me.model){
			me.model=new cModel(me.data);
		}
		me.xmodel=me.model;
	}
	
	var _oTagReg=/[^<]*(<[a-zA-Z]+)/;
	var _oHasClsReg=/^[^>]+class=/;
	var _oClsReg=/class=['"]?([#\w][\s\w\.\?:#-]*)(['"]?)(?!\w*=)/;
	var _oHasBindAttrReg=/^[^>]+{{bindAttr/;
	var _oBindClass=/^[^>]+{{bindAttr((?!}}).)class=/;
	var _oBindAttrReg=/({{bindAttr)/;
	/**
	 * 预处理模板
	 */
	function fPreTmpl(){
		var me=this;
		var tmpl=me.tmpl;
		if($H.isArr(tmpl)){
			tmpl=tmpl.join('');
		}
		//添加视图固定的绑定属性
		var bHasCls=_oHasClsReg.test(tmpl);
		var sExtCls='#js-'+me.manager.type+" "+'#js-'+me.xtype;
		//检出模板现有的class
		if(bHasCls){
			var cls=tmpl.match(_oClsReg)[1];
			//class不在bind属性里，需要添加常量标志#
			if(cls){
				if(!_oBindClass.test(tmpl)){
					cls=cls.replace(/([^\s]+)/g,'#$1');
				}
				sExtCls+=' '+cls;
			}
			tmpl=tmpl.replace(_oClsReg,'');
		}
		//添加id
		var sBindAttr=' id=this._id'+' class="'+sExtCls+'"';
		if(_oHasBindAttrReg.test(tmpl)){
			tmpl=tmpl.replace(_oBindAttrReg,'$1'+sBindAttr);
		}else{
			tmpl=tmpl.replace(_oTagReg,'$1 {{bindAttr'+sBindAttr+'}}');
		}
		me.tmpl=tmpl;
	}
	/**
	 * 获取模板函数
	 * @return {function} 返回编译后的模板函数
	 */
	function fGetTmplFn(){
		var me=this;
		//编译模板，固定模板的类只需执行一次
		var tmpl=me.tmpl,oConstructor=me.constructor;
		if(!$H.isFunc(tmpl)&&!$H.isFunc(tmpl=oConstructor.tmpl)){
			me.preTmpl();
			tmpl=oConstructor.tmpl=$H.tmpl({
				tmpl:me.tmpl,
				ns:'ModelView'
			});
		}
		return me.tmpl=tmpl;
	}
	/**
	 * 初始化html
	 * @return {string} 返回html
	 */
	function fGetHtml(){
		var me=this;
		if(me.html){
			return me.html;
		}
		var fTmpl=me.getTmplFn();
		//由模板生成html
		var sHtml=me.html=fTmpl(me.xmodel,me);
		return sHtml;
	}
	/**
	 * 查询指定逻辑单元是否需要绑定模型对象或节点，检查后设为已绑定，确保每个逻辑单元只绑定一次事件
	 * @param {string}nNum 查询的逻辑单元编号
	 * @param {object}oData 数据对象，只有此参数是可观察对象(集合或者模型)时才执行绑定
	 * @param {boolean=}bIsEl 仅当为true时表示查询节点
	 * @return true表示需要绑定
	 */
	function fIfBind(nNum,oData,bIsEl){
		var me=this;
		if((!bIsEl&&me.bindType=='el')||(bIsEl&&me.bindType=='model')){
			return false;
		}
		var oNums=bIsEl?me._bindElNums:me._bindModelNums;
		var bIfBind=!oNums[nNum]&&((oData&&(oData instanceof Model||oData instanceof Collection))||!oData);
		oNums[nNum]=1;
		return bIfBind;
	}
	/**
	 * 更新内容
	 * @param {number}nId 逻辑节点id
	 * @param {string=}sHtml 替换逻辑节点内容的html，不传表示清空内容
	 * @param {boolean=}bRemove 仅当true时移除首尾逻辑节点
	 * @param {string=}sType 默认是更新内容，'append'表示追加内容，'remove'表示移除内容(包括元标签)
	 */
	function fUpdateMetaMorph(nId,sHtml,sType){
		if(sType=='append'){
			$('#metamorph-'+nId+'-end').before(sHtml);
			return;
		}
		var jStart=$('#metamorph-'+nId+'-start');
		//找不到开始节点，是外部逻辑块已移除，直接忽略即可
		if(jStart.length==0){
			return;
		}
		var sEndId='metamorph-'+nId+'-end';
		var eNext=jStart[0].nextSibling,jTmp;
		while(eNext){
			if(eNext.id==sEndId){
				break;
			}else{
				jTmp=$(eNext);
				eNext=eNext.nextSibling;
				//移除节点必须使用jQuery的remove接口，才能通知组件或视图执行销毁
				jTmp.remove();
			}
		}
		sHtml&&jStart.after(sHtml);
		if(sType=='remove'){
			jStart.remove();
			$(eNext).remove();
		}
	}
	/**
	 * 包装结果html
	 * @param {number}nId 逻辑节点id
	 * @param {string}sHtml 参数html
	 * @return {string} 返回包装好的html
	 */
	function fWrapMetaMorph(nId,sHtml){
		var sStart='<script id="metamorph-';
		var sEnd='" type="text/x-placeholder"></script>';
		return sStart+nId+'-start'+sEnd+(sHtml||'')+sStart+nId+'-end'+sEnd;
	}
	/**
	 * 读取配置属性
	 * @param {string}sKey 属性名称
	 * @return {?} 返回属性值
	 */
	function fGet(sKey){
		return this.xmodel.get(sKey);
	}
	/**
	 * 设置配置属性
	 * @param {string}sKey 属性名称
	 * @param {*}value 属性值
	 */
	function fSet(sKey,value){
		this.xmodel.set(sKey,value);
	}
	/**
	 * 更新数据
	 */
	function fUpdate(oSettings){
		this.xmodel.set(oSettings);
	}
	/**
	 * 获取配置对象
	 */
	function fGetXmodel(){
		return this.xmodel;
	}
	
	return ModelView;
});