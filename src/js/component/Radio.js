/**
 * 图标类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-29
 */

$Define('C.Radio',
'C.AbstractComponent',
function(AC){
	
	var Radio=AC.define('Radio');
	
	Radio.extend({
		//初始配置
		xConfig         : {
			cls             : 'radio',
			name            : '',                  //选项名
			text            : '',                  //文字
			value           : '',                  //选项值
			selected        : false                //是否选中
		},
		
		tmpl            : [
			'<div {{bindAttr class="#hui-btn #hui-btn-gray selected?hui-radio-on"}}>',
				'<span class="hui-icon hui-icon-radio"></span>',
				'<input type="radio" {{bindAttr selected?checked name="name" value="value"}}/>',
				'<span class="hui-radio-txt">{{text}}</span>',
			'</div>'
		].join(''),
		
		select          : fSelect,            //选中
		val             : fVal                //获取/设置输入框的值
	});
	
	/**
	 * 选中
	 * @method select
	 * @param {boolean}bSelect 仅当为false时取消选中
	 */
	function fSelect(bSelect){
		var me=this;
		me.update({selected:!(bSelect==false)});
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
			me.set("value",sValue);
		}else{
			return me.get("value");
		}
	}
	
	return Radio;
	
});