/**
 * 按钮类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-13
 */

$Define('c.Button',
'c.AbstractComponent',
function(AC){
	
	var Button=AC.define('Button');
	
	Button.extend({
		//初始配置
//		text            : '',                  //按钮文字
//		isActive        : false,               //是否是激活状态
//		icon            : null,                //图标名称
		iconPos         : 'left',              //图标位置，"left"|"top"
		theme           : 'gray',
		activeCls       : 'hui-btn-blue',      //激活样式
		cls             : 'btn',               //组件样式名
//		isBack          : false,               //是否是后退按钮
		
		defItem         : {
			xtype       : 'Icon'
		},
		
		////通用效果
		radius          : 'normal',               //圆角，null：无圆角，little：小圆角，normal：普通圆角，big：大圆角
		shadow          : true,        	       //外阴影
		isInline        : true,                //宽度自适应
		
		tmpl            : ['<a href="javascript:;" hidefocus="true" class="hui-btn',
							'<%if(!this.text){%> hui-btn-icon-notxt<%}',
							'if(this.isBack){%> hui-btn-back<%}',
							'if(this.hasIcon&&this.text){%> hui-btn-icon-<%=this.iconPos%><%}%>">',
							'<span class="hui-btn-txt"><%=this.text%></span>',
							'<%=this.getHtml("$>*")%>',
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