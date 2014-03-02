/**
 * 工具栏类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-16
 */

$Define('c.Toolbar',
'c.AbstractComponent',
function(AC){
	
	var Toolbar=AC.define('Toolbar');
	
	Toolbar.extend({
		//初始配置
//		title            : '',                  //标题
		cls              : 'tbar',
//		type             : null,                //null|'header'|'footer'
		defItem          : {
			xtype        : 'Button',
			theme        : 'black',
			pos          : 'right',
			isMini       : true
		},
		
		tmpl             : [
			'<div class="hui-tbar<%if(this.type=="header"){%> hui-header<%}else if(this.type=="footer"){%> hui-footer<%}%>">',
				'<%=this.findHtml(">*")%>',
				'<%if(this.title){%><h1 class="hui-tbar-title js-tbar-txt"><%=this.title%></h1><%}%>',
			'</div>'
		],
		
		parseItem        : fParseItem           //处理子组件配置
		
	});
	/**
	 * 处理子组件配置
	 * @method parseItem
	 * @param {object}oItem 子组件配置
	 */
	function fParseItem(oItem){
		if(oItem.xtype=='Button'){
			oItem.shadowSurround=true;
			if(oItem.pos=='left'){
				oItem.extCls=(oItem.extCls||"")+' hui-tbar-btn-left';
			}else if(oItem.pos=="right"){
				oItem.extCls=(oItem.extCls||"")+' hui-tbar-btn-right';
			}
		}
	}
	
	return Toolbar;
	
});