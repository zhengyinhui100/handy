/**
 * 图标类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-01
 */

$Define('c.Select',
'c.AbstractComponent',
function(AC){
	
	var Select=AC.define('Select');
	
	$HO.extend(Select.prototype,{
		//初始配置
//		name            : '',                  //选项名
		text            : '',                  //文字
		value           : '',                  //选项值
		checked         : false,               //是否选中
		
		tmpl            : [
			'<div class="hui-radio hui-btn hui-btn-gray<%if(this.checked){%> hui-radio-on<%}%>">',
				'<span class="hui-icon hui-icon-radio"></span>',
				'<input type="radio"<%if(this.checked){%> checked=true<%}%>',
				'<%if(this.disabled){%> disabled="<%=this.disabled%>"<%}%>',
				'<%if(this.name){%> name="<%=this.name%>"<%}%>',
				'<%if(this.value){%> value="<%=this.value%>"<%}%>/>',
				'<span class="hui-radio-txt"><%=this.text%></span>',
			'</div>'
		],
		
		listeners       : [
			{
				type:'click',
				handler:function(){
					this.setChecked();
				}
			}
		],
		
		setChecked      : fSetChecked,          //选中
		val             : fVal                  //获取/设置输入框的值
	});
	
	/**
	 * 选中
	 * @method setChecked
	 * @param {boolean}bChecked 仅当为false时取消选中
	 */
	function fSetChecked(bChecked){
		var me=this;
		bChecked=!(bChecked==false);
		var oParent;
		//要选中，先取消同组的单选框选中
		if(bChecked&&(oParent=me.parent)&&oParent.xtype=="ControlGroup"){
			oParent.callChild([false]);
		}
		me.checked=bChecked;
		me.getEl()[bChecked?"addClass":"removeClass"]('hui-radio-on');
	}
	/**
	 * 获取/设置输入框的值
	 * @method val
	 * @param {string=}sValue 要设置的值，不传表示读取值
	 * @return {string=} 如果是读取操作，返回当前值
	 */
	function fVal(sValue){
		var me=this;
		if(sValue){
			me.value=sValue;
			me.find('input').val(sValue);
		}else{
			return me.value;
		}
	}
	
	return Select;
	
});