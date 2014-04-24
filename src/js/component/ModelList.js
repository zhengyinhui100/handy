/**
 * 模型列表
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

$Define("C.ModelList",
'C.AbstractComponent',
function(AC){
	
	var ModelList=AC.define('ModelList');
	
	ModelList.extend({
		emptyTips   : '暂无结果',
//		itemXtype   : '',       //子组件默认xtype
		tmpl        : [
			'<div class="hui-list">',
				'<%=this.findHtml(">*")%>',
				'<div id="emptyContent"<%if(this.children.length>0){%> style="display:none"<%}%> class="hui-list-empty"><%=this.emptyTips%></div>',
			'</div>'
		],
		init                : fInit,               //初始化
		addListItem         : fAddListItem,        //添加列表项
		removeListItem      : fRemoveListItem      //删除列表项
	});
	/**
	 * 初始化
	 */
	function fInit(){
		var me=this;
		if(me.itemXtype){
			(me.defItem||(me.defItem={})).xtype=me.itemXtype;
		}
		var oListItems=me.model;
		oListItems.each(function(i,item){
			me.addListItem(item);
		});
		me.listenTo(oListItems,{
			'add':function(sEvt,oListItem){
				me.addListItem(oListItem);
			},
			'remove':function(sEvt,oListItem){
				me.removeListItem(oListItem);
			},
			'reset':function(){
				me.removeListItem('emptyAll');
			}
		});
		console.log(me);
	}
	/**
	 * 添加列表项
	 * @param {Object}oListItem 列表项模型
	 */
	function fAddListItem(oListItem){
		var me=this;
		if(me.inited){
			me.findEl("#emptyContent").hide();
		}
		me.add({
			model:oListItem
		});
	}
	/**
	 * 删除列表项
	 * @param {Object}oListItem 列表项模型
	 */
	function fRemoveListItem(oListItem){
		var me=this;
		if(oListItem=='emptyAll'){
			me.remove(me.children);
		}else{
			me.remove(function(oView){
				return oView.model&&oView.model.id==oListItem.id;
			});
		}
		if(me.children.length==0){
			me.findEl("#emptyContent").show();
		}
	}
	
	return ModelList;
});