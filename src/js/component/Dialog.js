/**
 * 对话框类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-17
 */

$Define('c.Dialog',
['c.AbstractComponent',
'c.Popup'],
function(AC,Popup){
	
	var Dialog=AC.define('Dialog',Popup);
	
	//快捷静态方法
	$HO.extend(Dialog,{
		alert           : fAlert,    //弹出警告框
		confirm         : fConfirm,  //弹出确认框
		prompt          : fPrompt    //弹出输入框
	});
	
	Dialog.extend({
		
		//对话框初始配置
//		title           : '',             //标题
//		noClose         : false,          //true时没有close图标
//		content         : '',             //html内容，传入此值时将忽略contentTitle和contentMsg
//		contentTitle    : '',             //内容框的标题
//		contentMsg      : '',             //内容框的描述
//		noAction        : false,          //true时没有底部按钮
//		noOk            : false,          //true时没有确定按钮
//		noCancel        : false,          //true时没有取消按钮
		okTxt           : '确定',          //确定按钮文字
		cancelTxt       : '取消',          //取消按钮文字
//		activeBtn       : null,           //为按钮添加激活样式，1表示左边，2表示右边
//		okCall          : function(){},   //确定按钮事件函数
//		cancelCall      : function(){},   //取消按钮事件函数
		
		clickHide       : false,          //点击不隐藏
		
		//组件共有配置
		radius          : 'little',
		
		tmpl            : [
			'<div class="hui-dialog">',
				'<%=this.getHtml("$>[xrole=\'dialog-header\']")%>',
				'<div class="hui-dialog-body">',
					'<%if(this.content){%><%=this.content%><%}else{%>',
						'<div class="hui-body-content">',
							'<h1 class="hui-content-title"><%=this.contentTitle%></h1>',
							'<div class="hui-content-msg"><%=this.contentMsg%></div>',
							'<%=this.getHtml("$>[xrole=\'dialog-content\']")%>',
						'</div>',
					'<%}%>',
					'<%if(!this.noAction){%>',
						'<div class="hui-body-action">',
						'<%=this.getHtml("$>[xrole=\'dialog-action\']")%>',
						'</div>',
					'<%}%>',
				'</div>',
			'</div>'
		],
		doConfig         : fDoConfig        //处理配置
	});
	
	/**
	 * 弹出警告框
	 * @method alert
	 * @param {string}sMsg 提示信息
	 */
	function fAlert(sMsg){
		return new Dialog({
			contentMsg:sMsg,
			noClose:true,
			noCancel:true
		});
	}
	/**
	 * 弹出确认框
	 * @method confirm
	 * @param {string}sMsg 提示信息
	 * @param {function(boolean)}fCall 回调函数，参数为true表示点击的是"确定"按钮，false则为"取消"按钮
	 */
	function fConfirm(sMsg,fCall){
		return new Dialog({
			contentMsg:sMsg,
			noClose:true,
			okCall:function(){
				return fCall&&fCall(true);
			},
			cancelCall:function(){
				return fCall&&fCall(false);
			}
		});
	}
	/**
	 * 弹出输入框
	 * @method prompt
	 * @param {string}sMsg 提示信息
	 * @param {string=}sDefault 输入框默认值
	 * @param {function(string)}fCall 回调函数，参数为输入框的值
	 */
	function fPrompt(sMsg,sDefault,fCall){
		if(!fCall){
			fCall=sDefault;
			sDefault='';
		}
		return new Dialog({
			contentMsg:sMsg,
			noClose:true,
			items:{
				xtype:'Input',
				xrole:'dialog-content',
				value:sDefault
			},
			okCall:function(){
				var value=this.find('$Input')[0].val();
				return fCall&&fCall(value);
			}
		});
	}
	/**
	 * 处理配置
	 * @method doConfig
	 * @param {object}oSettings 设置参数
	 */
	function fDoConfig(oSettings){
		var me=this;
		me.callSuper([oSettings]);
		var aItems=oSettings.items;
		if(me.title&&!me.hasConfig('[xrole="dialog-header"]',aItems)){
			//顶部标题栏
			me.addItem({
				xtype:'Toolbar',
				title:me.title,
				theme:'gray',
				xrole:'dialog-header',
				extCls:'hui-dialog-header',
				items:!me.noClose&&{
					xtype:'Button',
					radius:'big',
					icon:'delete',
					isMini:false,
					theme:'gray',
					pos:'left',
					click:function(){
						me.hide();
					}
				}
			})
		}
		if(!me.noAction&&!me.hasConfig('[xrole="dialog-action"]',aItems)){
			var aActions=[];
			if(!me.noCancel){
				//取消按钮
				aActions.push({
					xtype:'Button',
					radius:null,
					isActive:me.activeBtn==1,
					text:me.cancelTxt,
					click:function(){
						if((me.cancelCall&&me.cancelCall())!=false){
							me.hide();
						}
					}
				});
			}
			if(!me.noOk){
				//确定按钮
				aActions.push({
					xtype:'Button',
					text:me.okTxt,
					isActive:me.activeBtn==2,
					radius:null,
					click:function(){
						if((me.okCall&&me.okCall())!=false){
							me.hide();
						}
					}
				});
			}
			me.addItem({
				xtype:'Tab',
				xrole:'dialog-action',
				theme:'border-top',
				notSelect:true,
				items:aActions
			});
		}
	}
	
	return Dialog;
	
});