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
		text            : '请选择...',          //文字
		defaultValue    : '',                  //默认值
		value           : '',                  //选项值
		
		tmpl            : [
			'<div class="hui-select hui-btn hui-btn-gray hui-btn-icon-right">',
				'<span class="hui-icon hui-icon-carat-d hui-icon-bg"></span>',
				'<select value="<%=this.value%>"></select>',
				'<span class="hui-btn-txt"><%=this.text%></span>',
			'</div>'
		],
		
		listeners       : [
			{
				type:'click',
				handler:function(){
					this.showOptions();
				}
			}
		],
		
		showOptions      : fShowOptions,          //显示选项菜单
		val              : fVal                   //获取/设置值
	});
	
	/**
	 * 显示选项菜单
	 * @method setChecked
	 * @param {boolean}bChecked 仅当为false时取消选中
	 */
	function fShowOptions(){
		var me=this;
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