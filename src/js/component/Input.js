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
		
		initHtml        : fInitHtml            //初始化html
	});
	/**
	 * 初始化html
	 * @method initHtml
	 */
	function fInitHtml(){
		var that=this;
		return '<div class="w-input">\
			<input type="text" class="w-input-txt"'+that.placeholder?' placeholder="'+that.placeholder+'"':''+'/>\
		</div>';
	}
	
	
	return Input;
	
});