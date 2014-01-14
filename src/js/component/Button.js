/**
 * 按钮类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-13
 */

$Define('handy.component.Button',
'handy.component.AbstractComponent',
function(AC){
	
	var Button=AC.define('Button');
	
	$HO.extend(Button.prototype,{
		//初始配置
		text            : '',                  //按钮文字
		color           : null,                //按钮颜色
		iconPos         : 'left',              //图标位置，"left"|"top"
		
		
		////通用效果
		radius          : 'big',               //圆角，null：无圆角，little：小圆角，normal：普通圆角，big：大圆角
		shadow          : true,        	       //外阴影
		isInline        : true,                //宽度自适应
		
		initHtml        : fInitHtml,           //初始化html
		parseItem       : fParseItem           //分析处理子组件
	});
	/**
	 * 初始化html
	 * @method initHtml
	 */
	function fInitHtml(){
		var that=this;
		var sHtml=
		'<a class="w-btn'+(that.color?' w-btn-'+that.color:'')+(that.text?'':' w-btn-icon-notxt')+
			(that.hasIcon?' w-btn-icon-'+that.iconPos:'')+'">\
			<span class="w-btn-txt">'+that.text+'</span>'
			+that.childHtml+
		'</a>';
		return sHtml;
	}
	/**
	 * 分析处理子组件
	 * @method parseItem
	 */
	function fParseItem(oItem){
		var that=this;
		if(oItem.xtype=="Icon"){
			that.hasIcon=true;
		}
	}
	
	return Button;
	
});