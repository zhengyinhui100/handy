/**
 * 对话框类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-17
 */

$Define('handy.component.Dialog',
'handy.component.AbstractComponent',
function(AC){
	
	var Dialog=AC.define('Dialog');
	
	//快捷静态方法
	$HO.extend(Dialog,{
		alert           : fAlert,    //弹出警告框
		confirm         : fConfirm,  //弹出确认框
		prompt          : fPrompt    //弹出输入框
	});
	
	$HO.extend(Dialog.prototype,{
		
		//对话框初始配置
//		title           : '',             //标题
//		noClose         : false,          //true时没有close图标
//		content         : '',             //内容
//		contentTitle    : '',             //内容框的标题
//		contentMsg      : '',             //内容框的描述
//		noAction        : false,          //true时没有底部按钮
//		noOk            : false,          //true时没有确定按钮
//		noCancel        : false,          //true时没有取消按钮
		okTxt           : '确定',          //确定按钮文字
		cancelTxt       : '取消',          //取消按钮文字
//		okCall          : function(){},   //确定按钮事件函数
//		okCall          : function(){},   //取消按钮事件函数
		
		//组件共有配置
		radius          : 'normal',
		cls             : 'dialog',
		withMask        : true,
		
		
		tmpl            : [
			'<div class="w-dialog w-overlay-shadow">',
				'<%=this.getHtml("$>Toolbar")%>',
				'<div class="w-dialog-body">',
					'<%if(this.content){%><%=this.content%><%}else{%>',
						'<div class="w-body-content">',
							'<h1 class="w-content-title"><%=this.contentTitle%></h1>',
							'<div class="w-content-msg"><%=this.contentMsg%></div>',
						'</div>',
					'<%}%>',
					'<%if(!this.noAction){%>',
						'<div class="w-body-action">',
						'<%=this.getHtml("$>Button")%>',
						'</div>',
					'<%}%>',
				'</div>',
			'</div>'
		],
		doConfig         : fDoConfig,        //处理配置
		show             : fShow             //显示
		
	});
	
	/**
	 * 弹出警告框
	 * @method alert
	 */
	function fAlert(){
	}
	/**
	 * 弹出确认框
	 * @method confirm
	 */
	function fConfirm(){
	}
	/**
	 * 弹出输入框
	 * @method prompt
	 */
	function fPrompt(){
	}
	/**
	 * 处理配置
	 * @method doConfig
	 * @param {object}oSettings 设置参数
	 */
	function fDoConfig(oSettings){
		var me=this;
		me.callSuper(oSettings);
		if(me.title){
			//顶部标题栏
			me.addItem({
				xtype:'Toolbar',
				title:me.title,
				color:'gray',
				extCls:'w-dialog-header',
				items:!me.noClose&&{
					xtype:'Button',
					radius:'big',
					extCls:'w-tbar-btn-left',
					icon:'delete'
				}
			})
		}
		if(!me.noAction){
			if(!me.noOk){
				//确定按钮
				me.addItem({
					xtype:'Button',
					isActive:true,
					text:me.okTxt,
					isInline:false,
					click:function(){
						var me=this;
						me.hide();
					}
				});
			}
			if(!me.noCancel){
				//取消按钮
				me.addItem({
					xtype:'Button',
					isInline:false,
					text:me.cancelTxt
				});
			}
		}
	}
	/**
	 * 显示
	 * @method show
	 */
	function fShow(){
		// 设置定位坐标
		var me=this;
		var oEl=me.getEl();
		var oDoc=document;
		var x = ((oDoc.documentElement.offsetWidth || oDoc.body.offsetWidth) - oEl.width())/2;
		var y = ((oDoc.documentElement.clientHeight || oDoc.body.clientHeight) - oEl.height())/2 + oDoc.body.scrollTop;
		y = y < 10 ? window.screen.height/2-200 : y;
		oEl.css({
			left:x + "px",
			top:y-(me.offsetTop||0) + "px"
		});
		//me.mask=$("#dialogMask").height($(oDoc.body).height());
		me.callParent();
	}
	
	return Dialog;
	
});