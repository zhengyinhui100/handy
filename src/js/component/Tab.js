/**
 * 标签类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-16
 */

$Define('c.Tab',
['c.AbstractComponent',
'c.ControlGroup'],
function(AC,ControlGroup){
	
	var Tab=AC.define('Tab',ControlGroup);
	
	$HO.extend(Tab.prototype,{
		//初始配置
		defItem         : {                    //默认子组件是Button
			xtype:'Button',
			radius:null,
			isInline:false,
			iconPos:'top',
			shadow:false
		},
		
		tmpl            : [
			'<div class="hui-tab">',
				'<ul class="c-clear">',
					'<%for(var i=0,len=this.children.length;i<len;i++){%>',
					'<li class="js-item hui-tab-item" style="width:<%=100/len%>%">',
					'<%=this.children[i].getHtml()%>',
					'</li>',
					'<%}%>',
				'</ul>',
				'<%for(var i=0,len=this.children.length;i<len;i++){%>',
					'<div class="js-tab-content"<%if(!this.children[i].active){%> style="display:none"<%}%>>',
					'<%=this.children[i].content%>',
					'</div>',
				'<%}%>',
			'</div>'
		],
		
		onItemClick     : fOnItemClick         //子项点击事件处理
	});
	/**
	 * 子项点击事件处理
	 * @method onItemClick
	 * @param {jQ:Event}oEvt jQ事件对象
	 * @param {number}nIndex 子项目索引
	 */
	function fOnItemClick(oEvt,nIndex){
		var me=this;
		me.setActiveItem(nIndex);
		//点击tab按钮显示对应的content
		me.find('.js-tab-content').hide().eq(nIndex).show();
		me.callSuper(oEvt,nIndex);
	}
	
	return Tab;
	
});