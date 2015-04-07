/**
 * 输入框类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-14
 */

define('C.Input',
[
'L.Browser',
'B.Util',
'B.Event',
'C.AbstractComponent'
],
function(Browser,Util,Evt,AC){
	
	var Input=AC.define('Input');
	
	Input.extend({
		//初始配置
		xConfig         : {
			cls             : 'input',
			isTextarea      : false,               //是否是textarea
			name            : '',
			value           : '',                  //默认值
			placeholder     : '',                  //placeholder
			radius          : 'little',            //普通圆角
			iconPos         : '',                  //图标位置，'left'或'right'
			btnPos          : '',                  //按钮位置，'left'或'right'
			iconPosCls      : {
				deps : ['iconPos'],
				parseDeps :function(sIconPos){
					return sIconPos?'hui-input-icon-'+sIconPos:'';
				}
			},
			btnPosCls       : {
				deps : ['btnPos'],
				parseDeps :function(sBtnPos){
					return sBtnPos?'hui-input-btn-'+sBtnPos:'';
				}
			}
		},
		fastUpdateMethod : {
			inputHeight  : function(value){
				this.findEl('input,textarea').css('height',value);
			}
		},
//		inputHeight     : null,                //输入框高度 
		type            : '',                  //输入框类型，默认为普通输入框，'search':搜索框
		maxHeight       : '5.313em',           //输入框最大高度，进对textarea有效
		withClear       : false,               //带有清除按钮
		enterKey        : '',                  //默认是ctrl+enter，设置为'enter'时表示只监听enter
//		enterSubmit     : $H.noop,             //回车事件回调函数
//		blurValid       : true,                //blur时是否进行校验
//		keepFocus       : false,               //仅用于ios，点击页面其它地方时是否保持聚焦
		
		tmpl            : [
		'<div {{bindAttr class="iconPosCls btnPosCls"}}>',
			'{{placeItem}}',
			'{{#if isTextarea}}',
				'{{textarea class="#js-input #hui-input-txt" name="name" placeholder="placeholder" value=value}}',
			'{{else}}',
				'{{input type="#text" class="#js-input #hui-input-txt" name="name" placeholder="placeholder" value="value"}}',
			'{{/if}}',
		'</div>'].join(''),
		listeners       : [
			{
				name : 'focus',
				el : '.js-input',
				handler : function(){
					var me=this;
					me.getEl().addClass('hui-focus');
					me.focused=true;
					if(Browser.mobile()){
						//tmp
//						setTimeout(function(){
//							me.parents().getEl()[0].clientHeight;
//							alert(me.parents().getEl()[0].clientHeight);
//						},500)
						//用户点击后退时先失去焦点，隐藏输入菜单，这里主要是考虑移动设备的操作习惯
						me.listen({
							name:'hisoryChange',
							target:Evt,
							times:1,
							handler:function(){
								if(me.focused){
									me.blur();
									//停止事件，不让其他组件hisoryChange事件函数执行
									Evt.stop();
									return false;
								}
							}
						})
					}
				}
			},{
				name : 'blur',
				el : '.js-input',
				handler : function(){
					var me=this;
					me.getEl().removeClass('hui-focus');
					me.focused=false;
					//TODO：blur时进行验证，不默认不验证空值，不过这里当用户放弃编辑点击返回时也提示，逻辑不好处理，暂时放弃此功能
//					if(me.blurValid&&me.val()&&!me.valid()){
//						me.focus();
//					}
				}
			}
		],
		doConfig        : fDoConfig,         //初始化配置
		parseItem       : fParseItem,        //分析处理子组件
		val             : fVal,              //获取/设置输入框的值
		focus           : fFocus,            //聚焦
		blur            : fBlur              //失焦
	});
	
	/**
	 * 初始化配置
	 */
	function fDoConfig(oSettings){
		var me=this;
		//搜索框快捷配置方式
		if(oSettings.type=='search'){
			me.icon='search';
		}
		me.callSuper();
		me.maxHeight=Util.em2px(me.maxHeight);
		if(oSettings.isTextarea){
			//textarea高度自适应，IE6、7、8支持propertychange事件，input被其他浏览器所支持
			me.listeners.push({
				name:'input propertychange',
				el:'.js-input',
				handler:function(){
					var oIptDv=me.getEl();
					oIptDv.height('auto');
					var oTextarea=me.findEl(".js-input");
					var nNewHeight=oTextarea[0].scrollHeight;
					//TODO Firefox下scrollHeight不准确，会忽略padding
					if(nNewHeight>=50){
						var nMax=me.inputHeight&&me.maxHeight<me.inputHeight?me.inputHeight:me.maxHeight;
						nNewHeight=nNewHeight<=nMax?nNewHeight:nMax
						oTextarea.css("height",nNewHeight);
					}
				}
			});
		}
		//清除按钮快捷配置方式
		if(me.withClear){
			me.add({
				xtype:'Button',
				radius:'big',
				icon:'delete',
				click:function(){
					this.parent.findEl('input').val('').focus();
				}
			});
		}
		if(oSettings.inputHeight){
			me.on('afterRender',function(){
				me.findEl('input,textarea').css('height',oSettings.inputHeight);
			});
		}
		//ios设备中点击页面其他地方不会失去焦点，这里需要手动失去焦点
		if(Browser.ios()){
			me.listen({
				name:'click',
				el:$(document),
				handler:function(oEvt){
					//点击其他输入框输入焦点会转移，这里不需额外处理，另外，使用fastclick时，点击输入框时，会先focus，再执行这里，但oEvt.target等于自身，这里的逻辑也是适用的
					if(me.focused&&!me.keepFocus&&!/(input|textarea)/i.test(oEvt.target.nodeName)){
						me.blur();
					}
					me.keepFocus=false;
				}
			})
		}
		
		//回车事件
		if(oSettings.enterSubmit){
			me.listen({
				name:'keypress',
				handler:function(oEvt){
					var me=this;
					//IE下回车的keypress是10
					if((me.enterKey=='enter'||oEvt.ctrlKey)&&(oEvt.keyCode==13||oEvt.keyCode==10)){
						oSettings.enterSubmit.call(me);
						oEvt.preventDefault();
					}
				}
			});
		}
		
		//TODO:android4.4webview及chrome回退无法删除表情，也无法检测到delete/backspace键，keydown事件里keyCode都是0
//		if(Browser.mobile()){
//			me.listen({
//				name:'keydown',
//				el:'.js-input',
//				handler:function(oEvt){
//					var me=this;
//					$D.log(oEvt.which +";"+ oEvt.keyCode +";"+ oEvt.charCode)
//					var sValue=me.val();
//					$D.log(sValue)
//					$D.log(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/.test(sValue))
//					oEvt.preventDefault();
//				}
//			});
//		}
	}
	/**
	 * 分析处理子组件
	 */
	function fParseItem(oItem){
		var me=this;
		//设置图标/按钮默认位置
		if(oItem.xtype=="Icon"){
			if(!me.get('iconPos')){
				me.set('iconPos','left');
			}
		}else if(oItem.xtype=="Button"){
			if(!me.get('btnPos')){
				me.set('btnPos','right');
			}
		}
	}
	/**
	 * 获取/设置输入框的值
	 * @param {string=}sValue 要设置的值，不传表示读取输入框的值
	 * @return {string=} 如果是读取操作，返回当前值
	 */
	function fVal(sValue){
		var oInput=this.findEl('.js-input');
		if(sValue!==undefined){
			oInput.val(sValue);
		}else{
			return oInput.val();
		}
	}
	/**
	 * 聚焦
	 */
	function fFocus(){
		this.findEl('.js-input').focus();
	}
	/**
	 * 失焦
	 */
	function fBlur(){
		this.findEl('.js-input').blur();
	}
	
	return Input;
	
});