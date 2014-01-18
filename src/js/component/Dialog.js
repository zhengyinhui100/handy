/**
 * 对话框类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-17
 */

$Define('handy.component.Dialog',
'handy.component.AbstractComponent',
function(AC){
	
	var Dialog=AC.define('Dialog');
	
	$HO.extend(Dialog,{
		alert           : fAlert,
		confirm         : fConfirm,
		prompt          : fPrompt
	});
	
	$HO.extend(Dialog.prototype,{
		//初始配置
//		title           : '',        //标题
//		noClose         : false,     //true时没有close图标
//		content         : '',        //内容
//		contentTitle    : '',        //内容框的标题
//		contentMsg      : '',        //内容框的描述
//		noAction        : false,     //true时没有底部按钮
//		noOk            : false,     //true时没有确定按钮
//		noCancel        : false,     //true时没有取消按钮
		okTxt           : '确定',     //确定按钮文字
		cancelTxt       : '取消',     //取消按钮文字
		
		
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
		doConfig         : fDoConfig        //处理配置
		
	});
	
	/**
	 * 
	 */
	function fAlert(){
	}
	/**
	 * 
	 */
	function fConfirm(){
	}
	/**
	 * 
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
			me.addItem({
				xtype:'Toolbar',
				title:me.title,
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
				me.addItem({
					xtype:'Button',
					isActive:true,
					text:me.okTxt,
					isInline:false,
					click:function(){
						
					}
				});
			}
			if(!me.noCancel){
				me.addItem({
					xtype:'Button',
					isInline:false,
					text:me.cancelTxt
				});
			}
		}
	}
	
	return Dialog;
	
});