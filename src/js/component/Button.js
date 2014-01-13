/**
 * 按钮类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-13
 */

$Define('handy.component.Button',
'handy.component.AbstractComponent',
function(AC){
	
	var Obj=$H.Object;
	
	var Button=AC.define('Button');
	
	Obj.extend(Button.prototype,{
		//初始配置
		text            : '',                  //是否有背景
		block           : false,               //图标名称
		
		initHtml        : fInitHtml            //初始化html
	});
	/**
	 * 初始化html
	 * @method initHtml
	 */
	function fInitHtml(){
		var that=this;
		var sHtml=
		'<a class="w-btn w-shadow w-btn-inline w-btn-blue w-radius-big">\
			<span class="w-btn-txt">'+that.text+'</span>\
		</a>';
		return sHtml;
	}
	
	return Button;
	
});