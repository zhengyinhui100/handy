/**
 * 输入框类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-14
 */

$Define('c.Input',
'c.AbstractComponent',
function(AC){
	
	var Input=AC.define('Input');
	
	Input.extend({
		//初始配置
//		type            : '',                  //图标名称
//		value           : '',                  //默认值
//		placeholder     : '',                  //placeholder
//		withClear       : false,               //带有清除按钮
		radius          : 'little',            //普通圆角
		iconPos         : 'left',              //图标位置
		btnPos          : 'right',             //按钮位置
		
		tmpl            : [
		'<div class="hui-input<%if(this.hasIcon){%> hui-input-icon-<%=this.iconPos%><%}%>',
		'<%if(this.hasBtn){%> hui-input-btn-<%=this.btnPos%><%}%>">',
			'<%=this.getHtml(">*")%>',
			'<input type="text" class="js-input hui-input-txt" value="<%=this.value%>"<%if(this.placeholder){%> placeholder="<%=this.placeholder%><%}%>"/>',
		'</div>'],
		listeners       : [
			{
				type : 'focus',
				el : '.js-input',
				handler : function(){
					this.getEl().addClass('hui-focus');
				}
			},
			{
				type : 'blur',
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
		me.callSuper([oSettings]);
		//搜索框快捷配置方式
		if(me.type=='search'){
			me.icon='search';
		}
		//清除按钮快捷配置方式
		if(me.withClear){
			me.addItem({
				xtype:'Button',
				radius:'big',
				icon:'delete',
				click:function(){
					this.parent.find('input').val('').focus();
				}
			});
		}
	}
	/**
	 * 分析处理子组件
	 * @method parseItem
	 */
	function fParseItem(oItem){
		var me=this;
		if(oItem.xtype=="Icon"){
			me.hasIcon=true;
		}else if(oItem.xtype=="Button"){
			me.hasBtn=true;
		}
	}
	/**
	 * 获取/设置输入框的值
	 * @method val
	 * @param {string=}sValue 要设置的值，不传表示读取输入框的值
	 * @return {string=} 如果是读取操作，返回当前值
	 */
	function fVal(sValue){
		var oInput=this.find('input');
		if(sValue){
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
		this.find('input').focus();
	}
	
	return Input;
	
});