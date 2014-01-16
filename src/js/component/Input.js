/**
 * 输入框类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-14
 */

$Define('handy.component.Input',
'handy.component.AbstractComponent',
function(AC){
	
	var Input=AC.define('Input');
	
	$HO.extend(Input.prototype,{
		//初始配置
		type            : '',                  //图标名称
//		placeholder     : '',                  //placeholder
		radius          : 'normal',            //普通圆角
		
		tmpl            : [
		'<div class="w-input">',
			'<input type="text" class="js-input w-input-txt"<%if(this.placeholder){%> placeholder="<%=this.placeholder%><%}%>"/>',
		'</div>'],
		listeners       : [
			{
				type : 'focus',
				el : '.js-input',
				handler : function(){
					this.getEl().addClass('w-focus');
				}
			},
			{
				type : 'blur',
				el : '.js-input',
				handler : function(){
					this.getEl().removeClass('w-focus');
				}
			}
		],
		doConfig        : fDoConfig         //初始化配置
		
	});
	
	/**
	 * 初始化配置
	 * @method doConfig
	 */
	function fDoConfig(oSettings){
		var that=this;
		that.constructor.superProt.doConfig.call(that,oSettings);
	}
	
	return Input;
	
});