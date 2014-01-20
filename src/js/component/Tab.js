/**
 * 标签类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-16
 */

$Define('handy.component.Tab',
'handy.component.AbstractComponent',
function(AC){
	
	var Tab=AC.define('Tab');
	
	$HO.extend(Tab.prototype,{
		//初始配置
//		itemClick       : function(){},        //标签项点击事件，函数参数为TabItem子组件对象
		defItem         : {                    //默认子组件是Button
			xtype:'Button',
			radius:null,
			isInline:false,
			iconPos:'top',
			shadow:false
		},
		
		tmpl            : [
			'<div class="w-tab">',
				'<ul class="c-clear">',
					'<%for(var i=0,len=this.children.length;i<len;i++){%>',
					'<li class="js-tab-item w-tab-item" style="width:<%=100/len%>%">',
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
		listeners       : [
			{
				type :'click',
				selector : '.js-tab-item',
				method : 'delegate',
				handler : function(oEvt){
					var me=this;
					//点击tab按钮显示对应的content
					var oCurrentEl=$(oEvt.currentTarget);
					var nIndex=oCurrentEl.index();
					me.setActiveItem(nIndex);
					me.find('.js-tab-content').hide().eq(nIndex).show();
					if(me.itemClick){
						var oCmp=me.children[nIndex];
						me.itemClick(oCmp);
					}
				}
			}
		],
		
		setActiveItem          : fSetActiveItem,       //激活指定标签项
		getActiveItem          : fGetActiveItem        //获取激活的标签项
	});
	/**
	 * 激活指定标签项
	 * @method setActiveItem
	 * @param {number|string}item number表示索引，string表示选择器
	 */
	function fSetActiveItem(item){
		var me=this,oActive;
		me.callChild('unactive');
		if(typeof item=='number'){
			oActive=me.children[item];
		}else{
			oActive=me.find(item)[0];
		}
		oActive.active();
	}
	/**
	 * 获取激活的标签项
	 * @method getActiveItem
	 * @param {boolean=}bIsIndex 仅当true时返回索引
	 * @return {Component} 返回当前激活的组件
	 */
	function fGetActiveItem(bIsIndex){
		var me=this,nIndex,oItem;
		me.each(function(i,item){
			if(item.isActive){
				oItem=item;
				nIndex=i;
				return false;
			}
		});
		return bIsIndex?nIndex:oItem;
	}
	
	return Tab;
	
});