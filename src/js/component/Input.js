/**
 * 输入框类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-14
 */

$Define('C.Input',
'C.AbstractComponent',
function(AC){
	
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
				depends : ['iconPos'],
				parse :function(){
					var sIconPos=this.get('iconPos');
					return sIconPos?'hui-input-icon-'+sIconPos:'';
				}
			},
			btnPosCls       : {
				depends : ['btnPos'],
				parse :function(){
					var sBtnPos=this.get('btnPos');
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
		withClear       : false,               //带有清除按钮
		
		tmpl            : [
		'<div {{bindAttr class="iconPosCls btnPosCls"}}>',
			'{{placeItem}}',
			'{{#if isTextarea}}',
				'{{textarea class="#js-input" name="name" placeholder="placeholder" value=value}}',
			'{{else}}',
				'{{input type="#text" class="#js-input #hui-input-txt" name="name" placeholder="placeholder" value="value"}}',
			'{{/if}}',
		'</div>'].join(''),
		listeners       : [
			{
				name : 'focus',
				el : '.js-input',
				handler : function(){
					this.getEl().addClass('hui-focus');
				}
			},
			{
				name : 'blur',
				el : '.js-input',
				handler : function(){
					this.getEl().removeClass('hui-focus');
				}
			}
		],
		doConfig        : fDoConfig,         //初始化配置
		parseItem       : fParseItem,        //分析处理子组件
		val             : fVal,              //获取/设置输入框的值
		focus           : fFocus             //聚焦
	});
	
	/**
	 * 初始化配置
	 * @method doConfig
	 */
	function fDoConfig(oSettings){
		var me=this;
		//搜索框快捷配置方式
		if(oSettings.type=='search'){
			me.icon='search';
		}
		me.callSuper();
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
	}
	/**
	 * 分析处理子组件
	 * @method parseItem
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
	 * @method val
	 * @param {string=}sValue 要设置的值，不传表示读取输入框的值
	 * @return {string=} 如果是读取操作，返回当前值
	 */
	function fVal(sValue){
		var oInput=this.findEl('input,textarea');
		if(sValue!==undefined){
			oInput.val(sValue);
		}else{
			return oInput.val();
		}
	}
	/**
	 * 聚焦
	 * @method focus
	 */
	function fFocus(){
		this.findEl('input').focus();
	}
	
	return Input;
	
});