/**
 * 多选框类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-31
 */

$Define('C.Checkbox',
'C.AbstractComponent',
function(AC){
	
	var Checkbox=AC.define('Checkbox');
	
	Checkbox.extend({
		//初始配置
		xConfig         : {
			cls             : 'chkbox',            //组件样式名
			name            : '',                  //选项名
			text            : '',                  //文字
			value           : '',                  //选项值
			selected        : false                //是否选中
		},
		multi           : true,                //多选
		
		tmpl            : [
			'<div {{bindAttr class="#hui-btn #hui-btn-gray selected?hui-chkbox-on"}}>',
				'<span class="hui-icon hui-icon-chkbox"></span>',
				'<input type="checkbox" {{bindAttr selected?checked name="name" value="value"}}/>',
				'<span class="hui-chkbox-txt">{{text}}</span>',
			'</div>'
		].join(''),
		
		select          : fSelect,          //选中
		val             : fVal                  //获取/设置输入框的值
	});
	
	/**
	 * 选中
	 * @method select
	 * @param {boolean}bSelect 仅当为false时取消选中
	 */
	function fSelect(bSelect){
		this.update({selected:!(bSelect==false)});
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
			me.set('value',sValue);
		}else{
			return me.get('value');
		}
	}
	
	return Checkbox;
	
});