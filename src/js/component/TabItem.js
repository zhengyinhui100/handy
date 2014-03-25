/**
 * 标签项类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-03-24
 */

$Define('C.TabItem',
[
'C.AbstractComponent',
'C.Panel'
],
function(AC,Panel){
	
	var TabItem=AC.define('TabItem');
	
	TabItem.extend({
		//初始配置
//		title           : ''|{},        //顶部按钮，可以字符串，也可以是Button的配置项
		defItem         : {             //默认子组件是Button
			xtype       : 'Button',
			xrole       : 'title',
			radius      : null,
			isInline    : false,
			iconPos     : 'top',
			shadow      : false
		},
		extCls          : 'js-item',
		tmpl            :['<div><%=this.findHtml("$>[xrole=\'title\']")%></div>'],
//		content         : null,         //标签内容，可以是html字符串，也可以是组件配置项
		doConfig        : fDoConfig,    //初始化配置
		parseItem       : fParseItem,   //分析处理子组件
		select          : fSelect       //处理子组件配置
	});
	/**
	 * 初始化配置
	 * @param {Object}oSettings
	 */
	function fDoConfig(oSettings){
		var me=this;
		me.callSuper();
		var title=oSettings.title;
		if(typeof title=='string'){
			title={text:title};
		}
		if(typeof title=='object'){
			me.add(title);
		}
		var content=oSettings.content;
		if(typeof content=='string'){
			content={
				xtype:'Panel',
				content:content
			}
		}
		if(typeof content=='object'){
			$H.extend(content,{
				xrole:'content',
				hidden:!me.selected,
				extCls:'js-content'
			});
			me.add(content);
		}
		//默认选中样式
		if(me.activeType){
			me.defItem.activeCls='hui-btn-active-'+me.activeType;
		}
	}
	/**
	 * 分析处理子组件
	 * @method parseItem
	 */
	function fParseItem(oItem){
		var me=this;
		if(me.selected&&oItem.xrole=="title"){
			oItem.isActive=true;
		}
	}
	/**
	 * 选择
	 * @param {boolean=} 仅当为false时取消选中
	 */
	function fSelect(bSelect){
		var me=this;
		var oTitle=me.find('$>[xrole="title"]')[0];
		var oContent=me.find('$>[xrole="content"]')[0];
		if(bSelect==false){
			oTitle.unactive();
			oContent&&oContent.hide();
		}else{
			oTitle.active();
			oContent&&oContent.show();
		}
	}
	
	return TabItem;
	
});