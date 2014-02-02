/**
 * 多选框类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-31
 */

$Define('c.Checkbox',
'c.AbstractComponent',
function(AC){
	
	var Checkbox=AC.define('Checkbox');
	
	$HO.extend(Checkbox.prototype,{
		//初始配置
//		name            : '',                  //选项名
		text            : '',                  //文字
		value           : '',                  //选项值
		checked         : false,               //是否选中
		
		cls             : 'chkbox',            //组件样式名
		tmpl            : [
			'<div class="hui-chkbox hui-btn hui-btn-gray<%if(this.checked){%> hui-chkbox-on<%}%>">',
				'<span class="hui-icon hui-icon-chkbox"></span>',
				'<input type="checkbox"<%if(this.checked){%> checked=true<%}%>',
				'<%if(this.disabled){%> disabled="<%=this.disabled%>"<%}%>',
				'<%if(this.name){%> name="<%=this.name%>"<%}%>',
				'<%if(this.value){%> value="<%=this.value%>"<%}%>/>',
				'<span class="hui-chkbox-txt"><%=this.text%></span>',
			'</div>'
		],
		
		listeners       : [
			{
				type:'click',
				handler:function(){
					var me=this;
					me.setChecked(!me.checked);
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
		me.checked=bChecked;
		var oInput=me.find('input');
		var oEl=me.getEl();
		if(bChecked){
			oInput.attr("checked",true);
			oEl.addClass('hui-chkbox-on');
		}else{
			oInput.removeAttr("checked");
			oEl.removeClass('hui-chkbox-on');
		}
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
	
	return Checkbox;
	
});