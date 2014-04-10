/**
 * 列表行类，用于多行的结构
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

$Define('C.RowItem',
'C.AbstractComponent',
function(AC){
	
	var RowItem=AC.define('RowItem');
	
	RowItem.extend({
		//初始配置
//		text            :'',       //文字
//		underline       : false,   //右边下划线，文字域默认有下划线
//		hasArrow        : false,   //右边箭头，有click事件时默认有箭头
		cls             : 'rowitem',
		
		tmpl            : [
			'<div class="<%if(this.text){%> hui-rowitem-txt<%}%><%if(this.underline){%> hui-rowitem-underline<%}%>">',
				'<%=this.text%>',
				'<%=this.findHtml(">*")%>',
				'<%if(this.hasArrow){%>',
					'<a href="javascript:;" hidefocus="true" class="hui-click-arrow" title="详情"><span class="hui-icon hui-alt-icon hui-icon-carat-r hui-light"></span></a>',
				'<%}%>',
			'</div>'
		],
		doConfig       : fDoconfig    //初始化配置
	});
	/**
	 * 初始化配置
	 * @param {Object}oSettings
	 */
	function fDoconfig(oSettings){
		var me=this;
		me.callSuper();
		//默认文字域有下划线
		if(me.text&&me.underline==undefined){
			me.underline=true;
		}
		//有点击函数时默认有右箭头
		if(oSettings.click&&me.hasArrow==undefined){
			me.hasArrow=true;
		}
	}
	
	return RowItem;
	
});