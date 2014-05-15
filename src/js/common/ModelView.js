/**
 * 模型视图类，实现视图与数据的同步
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-05-11
 */
//"handy.common.ModelView"
$Define('CM.ModelView',
['CM.AbstractEvents',
'CM.Model',
'B.Template'],
function(AbstractEvents,Model,Template){
	
	var _oTagReg=/^(<[a-zA-Z]+)/;
	
	var ModelView=AbstractEvents.derive({
		initialize     : fInitialize,         //初始化
		updateContent  : fUpdateContent,      //更新内容
		wrapHtml       : fWrapHtml,           //包装结果html
		update         : fUpdate              //更新
	});
	
	var _oHelpers={
		/**
		 * 
		 */
		'if':function(condition,oOptions,oData){
			var me=oOptions.context;
			var sExp=oOptions.exp;
			var nNum=oOptions.num;
			if ($H.isFunc(condition)) { 
				condition = condition.call(oData); 
			}
			var sHtml;
			if((condition&&!oOptions.inverse)||(!condition&&oOptions.inverse)){
				sHtml=oOptions.fn(oData);
			}
			if(!me.inited){
				me.listenTo(me._config,'change:'+sExp,function(sName,oConfig,sValue){
					var sHtml;
					if((sValue&&!oOptions.inverse)||(!sValue&&oOptions.inverse)){
						var data={};
						data[sExp]=sValue;
						sHtml=oOptions.fn(data);
					}
					me.updateContent(nNum,sHtml);
				});
			}
			return me.wrapHtml(sHtml,oOptions.num);
		},
		/**
		 * 
		 */
		'unless':function (condition, oOptions,oData){
			oOptions.inverse=true;
			return _oHelpers['if'].call(this, condition, oOptions,oData);
		},
		/**
		 * 遍历
		 */
		'each':function(data,oOptions){
			var me=oOptions.context;
			var fn=oOptions.fn,r='';
			if(!data){
				return;
			}
			var nNum=oOptions.num;
			var sInner=nNum+'-';
			if(data.length!=undefined){
				for(var i=0,l=data.length;i<l;i++){
					r+=me.wrapHtml(fn(data[i]),sInner+i);
				}
			}else{
				for(var i in data){
					r+=me.wrapHtml(fn(data[i]),sInner+i);
				}
			}
			return me.wrapHtml(r,nNum);
		},
		/**
		 * 获取值
		 *
		 */
		getValue:function(sHtml,oOptions){
			var me=oOptions.context;
			var sExp=oOptions.exp;
			var nNum=oOptions.num;
			if(!me.inited){
				me.listenTo(me._config,'change:'+sExp,function(sName,oConfig,sValue){
					me.updateContent(nNum,sValue);
				});
			}
			return me.wrapHtml(sHtml,nNum);
		},
		/**
		 * 绑定属性
		 * @param {string}sExp 表达式
		 * @param {object}oOptions 选项
		 * @param {object}oData 数据
		 */
		bindAttr:function(sExp,oOptions,oData){
			var me=oOptions.context;
			var nNum=oOptions.num;
			var r=/([^=\s]+)=([^=\s]+)/g;
			var m,exp,result=[];
			while(m=r.exec(sExp)){
				var attr=m[1];
				exp=m[2];
				result.push(attr+'="'+oData[exp]+'"');
				if(!me.inited){
					me.listenTo(me._config,"change:"+exp,function(sName,oConfig,sValue){
						$('#bindAttr'+nNum).attr(attr,sValue||'');
					})
				}
			}
			result.push('id="'+'bindAttr'+nNum+'"');
			return ' '+result.join('')+' ';
		}
	};
	/**
	 * 初始化
	 * @param {object}oSettings 设置
	 */
	function fInitialize(oSettings){
		var me=this;
		var oConfig=me._config=new Model(oSettings.data);
		var oTmpl={
			tmpl:oSettings.tmpl,
			parseHelper:'getValue',
			context:me,
			helpers:_oHelpers
		}
		me.html=Template.tmpl(oTmpl,oSettings.data);
		me.inited=true;
	}
	/**
	 * 更新内容
	 * @param {number}nNum 逻辑节点编号
	 * @param {string=}sHtml 替换逻辑节点内容的html
	 */
	function fUpdateContent(nNum,sHtml){
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
	}
	/**
	 * 包装结果html
	 * @param {string}sHtml 参数html
	 * @param {number}nNum 编号
	 * @return {string} 返回包装好的html
	 */
	function fWrapHtml(sHtml,nNum){
		var sStart='<script id="metamorph-';
		var sEnd='" type="text/x-placeholder"></script>';
		return sStart+nNum+'-start'+sEnd+(sHtml||'')+sStart+nNum+'-end'+sEnd;
	}
	/**
	 * 更新数据
	 */
	function fUpdate(oSettings){
		this._config.set(oSettings);
	}
	
	return ModelView;
});