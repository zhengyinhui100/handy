/**
 * 菜单类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-02
 */

$Define('C.Menu',
['C.AbstractComponent',
'C.Popup',
'C.ControlGroup'],
function(AC,Popup,ControlGroup){
	
	var Menu=AC.define('Menu',Popup);
	
	//扩展取得ControlGroup的属性及方法
	Menu.extend(ControlGroup.prototype);
	
	Menu.extend({
		xConfig         : {
			cls              : 'menu'
		},
		markType         : null,         //选中的标记类型，默认不带选中效果，'active'是组件active效果，'hook'是勾选效果
		destroyWhenHide  : false,
		//默认子组件配置
		defItem          : {
			xtype            : 'Button',
			radius           : null,
			shadow           : false,
			theme            : null,
//			selected         : false,             //是否选中
			isInline         : false
		},
		
		tmpl            : '<div {{bindAttr class="directionCls"}}>{{placeItem}}</div>',
		doConfig        : fDoConfig,         //初始化配置
		parseItem       : fParseItem         //分析子组件配置
	});
	
	/**
	 * 初始化配置
	 * @param {object}oSettings 配置对象
	 */
	function fDoConfig(oSettings){
		var me=this;
		me.callSuper(ControlGroup);
		me.callSuper();
	}
	/**
	 * 分析子组件配置
	 * @param {object}oItem 子组件配置
	 */
	function fParseItem(oItem){
		var me=this;
		ControlGroup.prototype.parseItem.call(me,oItem);
		var sType=me.markType;
		if(!sType){
			me.notSelect=true;
		}else if(sType=='hook'){
			oItem.items={
				name:'check',
				isAlt:true,
				theme:null
			};
			oItem.iconPos='left';
			oItem.activeCls='hui-item-select';
		}
		oItem.isActive=oItem.selected;
	}
	
	return Menu;
	
});