/**
 * 标签项类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-03-24
 */

define('C.TabItem',
[
'C.AbstractComponent',
'C.Panel'
],
function(AC,Panel){
	
	var TabItem=AC.define('TabItem');
	
	TabItem.extend({
		//初始配置
		xConfig         : {
			cls             : 'tabitem'
		},
//		selected        : false,
//		title           : ''|{},        //顶部按钮，可以字符串，也可以是Button的配置项
//		content         : null,         //标签内容，可以是html字符串，也可以是组件配置项
//		activeType      : '',           //激活样式类型，
		defItem         : {             //默认子组件是Button
			xtype       : 'Button',
			xrole       : 'title',
			radius      : null,
			isInline    : false,
			shadow      : false
		},
		_customEvents   : ['selectchange'],
		
		//属性
//		titleCmp        : null,         //标题组件
//		contentCmp      : null,         //内容组件
		tmpl            : '<div>{{placeItem > [xrole=title]}}</div>',
		initialize      : fInitialize,  //初始化
		doConfig        : fDoConfig,    //初始化配置
		parseItem       : fParseItem,   //分析处理子组件
		select          : fSelect,      //处理子组件配置
		getContent      : fGetContent,  //获取内容
		setContent      : fSetContent   //设置内容
	});
	/**
	 * 初始化
	 * @param {Object}oSettings
	 */
	function fInitialize(oSettings){
		var me=this;
		me.callSuper();
		me.titleCmp=me.find('> [xrole=title]')[0];
		me.contentCmp=me.find('> [xrole=content]')[0];
	}
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
				extCls:(content.extCls||'')+' hui-tab-content js-tab-content'
			});
			me.add(content);
		}
	}
	/**
	 * 分析处理子组件
	 * @param {object}oItem 子组件配置
	 */
	function fParseItem(oItem){
		var me=this;
		if(me.selected&&oItem.xrole=="title"){
			oItem.isActive=true;
		}
		if(oItem.icon&&oItem.iconPos===undefined){
			oItem.iconPos='top';
		}
		//默认选中样式
		if(me.activeType){
			oItem.activeCls='hui-btn-active-'+me.activeType;
		}
	}
	/**
	 * 选择
	 * @param {boolean=} 仅当为false时取消选中
	 */
	function fSelect(bSelect){
		var me=this;
		var oTitle=me.titleCmp;
		var oContent=me.contentCmp;
		if(bSelect==false){
			oTitle.unactive();
			oContent&&oContent.hide();
			me.set('selected',false);
			me.trigger('selectchange',false);
		}else{
			oTitle.active();
			oContent&&oContent.show();
			me.set('selected',true);
			me.trigger('selectchange',true);
		}
	}
	/**
	 * 读取内容
	 * @param {boolean=}bHtml 仅当false表示获取子组件列表，其它表示获取html内容
	 * @param {View|string|number=}obj 指定视图对象，或选择器或索引
	 * @return {string|Array.<Component>} 返回内容
	 */
	function fGetContent(bHtml,obj){
		var me=this;
		if(!obj){
			obj=me.contentCmp;
		}
		return me.callSuper([bHtml,obj]);
	}
	/**
	 * 设置内容
	 * @param {string|Component|Array.<Component>}content 内容，html字符串或组件或组件数组
	 * @param {View|string|number=}obj 指定视图对象，或选择器或索引
	 */
	function fSetContent(content,obj){
		var me=this;
		if(!obj){
			obj=me.contentCmp;
		}
		return me.callSuper([content,obj]);
	}
	
	return TabItem;
	
});