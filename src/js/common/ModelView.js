/**
 * 模型视图类，实现视图与数据的同步
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-05-11
 */
//"handy.common.ModelView"
$Define('CM.ModelView',
[
'B.Template',
'CM.AbstractEvents',
'CM.Model',
'CM.Collection'
],
function(Template,AbstractEvents,Model,Collection){
	
	var _oTagReg=/^(<[a-zA-Z]+)/;
	
	var ModelView=AbstractEvents.derive({
		modelClass       : Model,               //模型类
		initialize       : fInitialize,         //初始化
		updateMetaMorph  : fUpdateMetaMorph,    //更新内容
		wrapMetaMorph    : fWrapMetaMorph,      //包装结果html
		updateModel      : fUpdateModel,        //更新数据
		getModel         : fGetModel            //获取配置对象
	});
	
	//注册自定义辅助函数
	Template.registerHelper('ModelView',{
		'if'     : fIf,
		'unless' : fUnless,
		'each'   : fEach,
		getValue : fGetValue,
		bindAttr : fBindAttr
	});
	
	var _bIfPlusJoin=Template.getIfPlusJoin();
	
	/**
	 * if辅助函数
	 * @param {string|function}condition 条件语句
	 * @param {object}oOptions 选项{
	 * 		{boolean=}inverse:true时表示条件反转,
	 * 		{function}fn:回调函数,
	 * 		{string}exp:表达式,
	 * 		{object}context:模板函数执行上下文对象,
	 * 		{number}num:逻辑编号,
	 * 		{object}helpers:辅助函数表
	 * }
	 * @return {string=} 返回生成的html
	 */
	function fIf(condition,oOptions,oData){
		var me=oOptions.context;
		var sExp=oOptions.exp;
		var nNum=$H.uuid();
		if ($H.isFunc(condition)) { 
			condition = condition.call(oData); 
		}
		var sHtml;
		if((condition&&!oOptions.inverse)||(!condition&&oOptions.inverse)){
			sHtml=oOptions.fn(oData);
		}
		if(!me.inited){
			me.listenTo(me._model,'change:'+sExp,function(sName,oModel,sValue){
				var sHtml;
				if((sValue&&!oOptions.inverse)||(!sValue&&oOptions.inverse)){
					var data={};
					data[sExp]=sValue;
					sHtml=oOptions.fn(data);
				}
				me.updateMetaMorph(nNum,sHtml);
			});
		}
		return me.wrapMetaMorph(sHtml,nNum);
	}
	/**
	 * unless辅助函数
	 * 参数说明同if辅助函数
	 */
	function fUnless(condition, oOptions,oData){
		oOptions.inverse=true;
		return oOptions.helpers['if'].call(this, condition, oOptions,oData);
	}
	/**
	 * each辅助函数，新式浏览器里使用，chrome下性能大约提升一倍
	 * @param {array|object}data 可遍历数据对象
	 * @param {object}oOptions 选项，参数说明同if辅助函数
	 * @return {string=} 返回生成的html
	 */
	function fEach(data,oOptions){
		var me=oOptions.context;
		var fn=oOptions.fn,r=_bIfPlusJoin?'':[];
		if(!data){
			return;
		}
		var nNum=$H.uuid();
		var sTmp;
		//集合类型数据
		if(data instanceof Collection){
			data.each(function(i,item){
				sTmp=me.wrapMetaMorph(fn(item),item.uuid);
				if(_bIfPlusJoin){
					r+=sTmp;
				}else{
					r.push(sTmp);
				}
			});
			if(!me.inited){
				me.listenTo(data,'add',function(sEvt,oModel,oCollection,oOptions){
					var sHtml=me.wrapMetaMorph(fn(oModel),oModel.uuid);
					var at=oOptions.at;
					if(at){
						var oPre=oCollection.at(at-1);
						var n=oPre.uuid;
						$('#metamorph-'+n+'-end').after(sHtml);
					}else{
						$('#metamorph-'+nNum+'-end').before(sHtml);
					}
				});
				me.listenTo(data,'remove',function(sEvt,oModel,oCollection,oOptions){
					var n=oModel.uuid;
					me.updateMetaMorph(n,'',true);
				});
			}
		}else if(data.length!=undefined){
			for(var i=0,l=data.length;i<l;i++){
				sTmp=me.wrapMetaMorph(fn(data[i]),i);
				if(_bIfPlusJoin){
					r+=sTmp;
				}else{
					r.push(sTmp);
				}
			}
		}else{
			for(var i in data){
				sTmp=me.wrapMetaMorph(fn(data[i]),i);
				if(_bIfPlusJoin){
					r+=sTmp;
				}else{
					r.push(sTmp);
				}
			}
		}
		return me.wrapMetaMorph(_bIfPlusJoin?r:r.join(''),nNum);
	}
	/**
	 * 获取值
	 * @param {object}oData 数据对象
	 * @param {object}oOptions 选项，参数说明同if辅助函数
	 */
	function fGetValue(oData,oOptions){
		var me=oOptions.context;
		var sExp=oOptions.exp;
		var nNum=$H.uuid();
		var bIsEscape=Template.isEscape;
		var oHelpers=oOptions.helpers;
		if(!me.inited){
			me.listenTo(me._model,'change:'+sExp,function(sName,oModel,sValue){
				if(bIsEscape){
					sValue=oHelpers.escape(sValue);
				}
				me.updateMetaMorph(nNum,sValue);
			});
		}
		var sValue=oData.get?oData.get(sExp):oData[sExp];
		if(bIsEscape){
			sValue=oHelpers.escape(sValue);
		}
		return me.wrapMetaMorph(sValue,nNum);
	}
	/**
	 * 绑定属性
	 * @param {string}sExp 表达式
	 * @param {object}oOptions 选项，参数说明同if辅助函数
	 * @param {object}oData 数据
	 */
	function fBindAttr(sExp,oOptions,oData){
		var me=oOptions.context,
		nNum=$H.uuid(),
		r=/([^=\s]+)=([^=\s]+)/g,
		m,exp,
		sId='bindAttr'+nNum,
		result=[],
		rStr=/^['"][^'"]+['"]$/;
		//循环执行表达式
		while(m=r.exec(sExp)){
			var attr=m[1];
			exp=m[2];
			//字符串值表示常量
			if(rStr.test(exp)){
				if(attr=='id'){
					sId=exp.substring(1,exp.length-1);
				}
				result.push(attr+'='+exp);
			}else{
				//表达式赋值
				result.push(attr+'="'+(oData.get?oData.get(exp):oData[exp])+'"');
				if(!me.inited){
					me.listenTo(me._model,"change:"+exp,function(sName,oModel,sValue){
						$('#'+sId).attr(attr,sValue||'');
					});
				}
			}
		}
		result.push('id="'+sId+'"');
		return ' '+result.join('')+' ';
	}
	
	/**
	 * 初始化
	 * @param {object}oSettings 设置
	 */
	function fInitialize(sTmpl,data){
		var me=this;
		if(data instanceof Model||data instanceof Collection){
			me._model=data;
		}else{
			me._model=new me.modelClass(data);
		}
		var oTmpl={
			tmpl:sTmpl,
			context:me,
			ns:'ModelView'
		}
		me.html=Template.tmpl(oTmpl,data);
		me.inited=true;
	}
	/**
	 * 更新内容
	 * @param {number}nNum 逻辑节点编号
	 * @param {string=}sHtml 替换逻辑节点内容的html，不传表示清空内容
	 * @param {boolean=}bRemove 仅当true时移除首尾逻辑节点
	 */
	function fUpdateMetaMorph(nNum,sHtml,bRemove){
		var jStart=$('#metamorph-'+nNum+'-start');
		//找不到开始节点，是外部逻辑块已移除，直接忽略即可
		if(jStart.length==0){
			return;
		}
		var sEndId='metamorph-'+nNum+'-end';
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
		if(bRemove){
			jStart.remove();
			$(eNext).remove();
		}
	}
	/**
	 * 包装结果html
	 * @param {string}sHtml 参数html
	 * @param {number}nNum 编号
	 * @return {string} 返回包装好的html
	 */
	function fWrapMetaMorph(sHtml,nNum){
		var sStart='<script id="metamorph-';
		var sEnd='" type="text/x-placeholder"></script>';
		return sStart+nNum+'-start'+sEnd+(sHtml||'')+sStart+nNum+'-end'+sEnd;
	}
	/**
	 * 更新数据
	 */
	function fUpdateModel(oSettings){
		this._model.set(oSettings);
	}
	/**
	 * 获取配置对象
	 */
	function fGetModel(){
	}
	
	return ModelView;
});