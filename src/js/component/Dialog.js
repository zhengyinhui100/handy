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
				'<div class="w-dialog-header w-tbar w-tbar-gray">',
					'<a class="w-btn w-shadow w-inline w-btn-icon-notxt w-radius-big w-tbar-btn-left">',
						'<span class="w-icon w-icon-bg w-icon-dellete"></span>',
					'</a>',
					'<h1 class="w-tbar-title"><%=this.title%></h1>',
				'</div>',
				'<div class="w-dialog-body">',
					'<div class="w-body-content">',
						'<h1 class="w-content-title"><%=this.contentTitle%></h1>',
						'<div class="w-content-msg"><%=this.contentMsg%></div>',
					'</div>',
					'<div class="w-body-action">',
					'</div>',
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
					icon:'close'
				}
			})
		}
		if(!me.noAction){
			if(!me.noOk){
				me.addItem({
					xtype:'Button',
					isActive:true,
					text:me.okTxt,
					click:function(){
						
					}
				});
			}
			if(!me.noCancel){
				me.addItem({
					xtype:'Button',
					text:me.cancelTxt
				});
			}
		}
	}
	
	return Dialog;
	
});