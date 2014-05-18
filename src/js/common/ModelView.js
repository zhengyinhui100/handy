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
	
	var _oTagReg=/^(<[a-zA-Z]+)/;
	
	var ModelView=AbstractView.derive({
		bindType            : 'both',              //绑定类型，‘el’表示绑定节点，‘model’表示绑定模型，‘both’表示双向绑定
//		model               : null,                //模型对象
		modelClass          : Model,               //模型类
		_bindModelNums      : {},				   //保存逻辑块对应编号是否已绑定模型
		_bindElNums         : {},                  //保存逻辑块对应编号是否已绑定节点
		
		doConfig            : fDoConfig,           //初始化配置
		initHtml            : fInitHtml,           //初始化html
		ifBind              : fIfBind,             //查询指定逻辑单元是否需要绑定模型对象或节点，检查后设为已绑定，确保每个逻辑单元只绑定一次事件
		updateMetaMorph     : fUpdateMetaMorph,    //更新内容
		wrapMetaMorph       : fWrapMetaMorph,      //包装结果html
		updateModel         : fUpdateModel,        //更新数据
		getModel            : fGetModel            //获取配置对象
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
		return me.wrapMetaMorph(sHtml,sMetaId);
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
		var nNum=oOptions.num;
		var sMetaId=me.getCid()+'-'+nNum;
		if(!data){
			return;
		}
		var sTmp;
		//集合类型数据
		if(data instanceof Collection){
			data.each(function(i,item){
				sTmp=me.wrapMetaMorph(fn(item),sMetaId+'-'+item.uuid);
				if(_bIfPlusJoin){
					r+=sTmp;
				}else{
					r.push(sTmp);
				}
			});
			if(me.ifBind(nNum,data)){
				me.listenTo(data,'add',function(sEvt,oModel,oCollection,oOptions){
					var sHtml=me.wrapMetaMorph(fn(oModel),sMetaId+'-'+oModel.uuid);
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
					me.updateMetaMorph(n,'',true);
				});
			}
		}else if(data.length!=undefined){
			for(var i=0,l=data.length;i<l;i++){
				sTmp=me.wrapMetaMorph(fn(data[i]),sMetaId+'-'+i);
				if(_bIfPlusJoin){
					r+=sTmp;
				}else{
					r.push(sTmp);
				}
			}
		}else{
			for(var i in data){
				sTmp=me.wrapMetaMorph(fn(data[i]),sMetaId+'-'+i);
				if(_bIfPlusJoin){
					r+=sTmp;
				}else{
					r.push(sTmp);
				}
			}
		}
		return me.wrapMetaMorph(_bIfPlusJoin?r:r.join(''),sMetaId);
	}
	/**
	 * 获取值
	 * @param {object}oData 数据对象
	 * @param {object}oOptions 选项，参数说明同if辅助函数
	 */
	function fGetValue(oData,oOptions){
		var me=oOptions.context;
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
		var sValue=oData.get?oData.get(sExp):oData[sExp];
		if(bIsEscape){
			sValue=oHelpers.escape(sValue);
		}
		return me.wrapMetaMorph(sValue,sMetaId);
	}
	/**
	 * 绑定属性
	 * @param {string}sExp 表达式
	 * @param {object}oOptions 选项，参数说明同if辅助函数
	 * @param {object}oData 数据
	 */
	function fBindAttr(sExp,oOptions,oData){
		var me=oOptions.context,
		nNum=oOptions.num,
		sMetaId=me.getCid()+'-'+nNum,
		r=/((\w+)=['"]?)?([#\w][\s\w\?:#-]*)(['"]?)(?!\w*=)/g,
		sId='bindAttr-'+sMetaId,
		m,
		result=[],
		aMatches=[],
		bBindModel=me.ifBind(nNum,oData),
		bBindEl=me.ifBind(nNum,oData,true);
		
		//循环分析表达式，先找出id属性
		while(m=r.exec(sExp)){
			if(m[2]=='id'){
				sId=_fGetVal(m[3],oData);
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
				aValues.push(ret);
			}
			var sVal=aValues.join(' ');
			if(sAttr){
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
			return oData.get?oData.get(sExp):oData[sExp];
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
		if(nMark1>0||nMark2>0){
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
	 * 初始化配置
	 * @method doConfig
	 * @param {Object}oSettings 初始化参数
	 */
	function fDoConfig(oSettings){
		var me=this;
		me.callSuper();
		if(!me.model){
			me.model=new me.modelClass(me.data);
		}
		me._config=me.model;
	}
	/**
	 * 初始化html
	 * @method initHtml
	 * @return {string} 返回html
	 */
	function fInitHtml(){
		var me=this;
		//编译模板，一个类只需执行一次
		var tmpl=me.tmpl;
		if(!$H.isFunc(tmpl)){
			me.tmpl=me.constructor.prototype.tmpl=$H.tmpl({
				tmpl:tmpl,
				context:me,
				ns:'ModelView'
			});
		}
		//由模板生成html
		var sHtml=me.tmpl(me.model);
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
		var bIfBind=!oNums[nNum]&&(oData instanceof Model||oData instanceof Collection);
		oNums[nNum]=1;
		return bIfBind;
	}
	/**
	 * 更新内容
	 * @param {number}nId 逻辑节点id
	 * @param {string=}sHtml 替换逻辑节点内容的html，不传表示清空内容
	 * @param {boolean=}bRemove 仅当true时移除首尾逻辑节点
	 */
	function fUpdateMetaMorph(nId,sHtml,bRemove){
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
		if(bRemove){
			jStart.remove();
			$(eNext).remove();
		}
	}
	/**
	 * 包装结果html
	 * @param {string}sHtml 参数html
	 * @param {number}nId 逻辑节点id
	 * @return {string} 返回包装好的html
	 */
	function fWrapMetaMorph(sHtml,nId){
		var sStart='<script id="metamorph-';
		var sEnd='" type="text/x-placeholder"></script>';
		return sStart+nId+'-start'+sEnd+(sHtml||'')+sStart+nId+'-end'+sEnd;
	}
	/**
	 * 更新数据
	 */
	function fUpdateModel(oSettings){
		this.model.set(oSettings);
	}
	/**
	 * 获取配置对象
	 */
	function fGetModel(){
		return this.model;
	}
	
	return ModelView;
});