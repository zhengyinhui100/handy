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
		isActive          : false,               //是否是激活状态
		iconPos         : 'left',              //图标位置，"left"|"top"
		activeCls       : 'w-btn-blue',        //激活样式
		defItem         : {
			xtype       : 'Icon',
			hasBg       : true
		},
		
		////通用效果
		radius          : 'big',               //圆角，null：无圆角，little：小圆角，normal：普通圆角，big：大圆角
		shadow          : true,        	       //外阴影
		isInline        : true,                //宽度自适应
		
		tmpl            : ['<a class="w-btn<%if(this.color){%> w-btn-<%=this.color%><%}',
							'if(!this.text){%> w-btn-icon-notxt<%}',
							'if(this.hasIcon&&this.text){%> w-btn-icon-<%=this.iconPos%><%}%>">',
							'<span class="w-btn-txt"><%=this.text%></span>',
							'<%=this.getChildrenHtml()%>',
							'</a>'],
		
		parseItem       : fParseItem           //分析处理子组件
	});
	/**
	 * 分析处理子组件
	 * @method parseItem
	 */
	function fParseItem(oItem){
		var me=this;
		if(oItem.xtype=="Icon"){
			me.hasIcon=true;
		}
	}
	
	return Button;
	
});