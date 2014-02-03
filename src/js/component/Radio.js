/**
 * 图标类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-29
 */

$Define('c.Radio',
'c.AbstractComponent',
function(AC){
	
	var Radio=AC.define('Radio');
	
	$HO.extend(Radio.prototype,{
		//初始配置
//		name            : '',                  //选项名
		text            : '',                  //文字
		value           : '',                  //选项值
		selected        : false,               //是否选中
		
		tmpl            : [
			'<div class="hui-radio hui-btn hui-btn-gray<%if(this.selected){%> hui-radio-on<%}%>">',
				'<span class="hui-icon hui-icon-radio"></span>',
				'<input type="radio"<%if(this.selected){%> checked=true<%}%>',
				'<%if(this.disabled){%> disabled="<%=this.disabled%>"<%}%>',
				'<%if(this.name){%> name="<%=this.name%>"<%}%>',
				'<%if(this.value){%> value="<%=this.value%>"<%}%>/>',
				'<span class="hui-radio-txt"><%=this.text%></span>',
			'</div>'
		],
		
		select          : fSelect,          //选中
		val             : fVal                  //获取/设置输入框的值
	});
	
	/**
	 * 选中
	 * @method select
	 * @param {boolean}bSelect 仅当为false时取消选中
	 */
	function fSelect(bSelect){
		var me=this;
		bSelect=!(bSelect==false);
		me.selected=bSelect;
		var oInput=me.find('input');
		var oEl=me.getEl();
		if(bSelect){
			oInput.attr("checked",true);
			oEl.addClass('hui-radio-on');
		}else{
			oInput.removeAttr("checked");
			oEl.removeClass('hui-radio-on');
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
	
	return Radio;
	
});