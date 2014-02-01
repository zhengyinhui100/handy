/**
 * 控制组类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-31
 */

$Define('c.ControlGroup',
'c.AbstractComponent',
function(AC){
	
	var ControlGroup=AC.define('ControlGroup');
	
	$HO.extend(ControlGroup.prototype,{
		//初始配置
//		direction            : 'v',                  //排列方向，'v'表示垂直方向，'h'表示水平方向
		radius               : 'little',             //圆角
		
		//默认子组件配置
		defItem              : {
			xtype            : 'Button',
			radius           : null,
			shadow           : false,
			isInline         : false
		},
		
		tmpl                 : [
			'<div class="hui-ctrlgp<%if(this.direction=="h"){%> hui-ctrlgp-h<%}else{%> hui-ctrlgp-v<%}%>">',
			'<%=this.getHtml("$>*")%>',
			'</div>'
		],
		
		val                  : fVal                 //获取/设置值
	});
	/**
	 * 获取/设置值
	 * @method val
	 * @param {string=}sValue 要设置的值，不传表示读取值，如果是多个值，用","隔开
	 * @return {string=} 如果是读取操作，返回当前值
	 */
	function fVal(sValue){
		var me=this;
		if(sValue){
			var aValues=sValue.split(','),aSel=[];
			me.each(function(i,oCmp){
				oCmp.setChecked($HO.contains(aValues,oCmp.value));
			});
		}else{
			var aCmp=me.find('$>[checked=true]');
			var aValues=[];
			$HO.each(aCmp,function(i,oCmp){
				aValues.push(oCmp.value);
			})
			return aValues.join(',');
		}
	}
	
	return ControlGroup;
	
});