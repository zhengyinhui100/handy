/**
 * 模型列表
 * ps:使用下拉刷新需要引入iScroll4
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

$Define("C.ModelList",
'C.AbstractComponent',
function(AC){
	
	var ModelList=AC.define('ModelList');
	
	ModelList.extend({
		emptyTips   : '暂无结果',         //空列表提示
		pdText      : '下拉可刷新',       //下拉刷新提示文字
		pdComment   : '上次刷新时间：',    //下拉刷新附加说明
//		pdTime      : '',                //上次刷新时间
//		hasPullRefresh : false,          //是否有下拉刷新
//		itemXtype   : '',                //子组件默认xtype
//		refresh     : null,              //刷新接口
//		getMore     : null,              //获取更多接口
		
		tmpl        : [
			'<div class="hui-list">',
				'<div class="hui-list-inner">',
					'<div<%if(this.children.length>0){%> style="display:none"<%}%> class="hui-list-empty js-empty"><%=this.emptyTips%></div>',
					'<%if(this.hasPullRefresh){%>',
						'<div class="hui-list-pulldown hui-pd-pull c-h-middle-container">',
							'<div class="c-h-middle">',
								'<span class="hui-icon hui-alt-icon hui-icon-arrow-d hui-light"></span>',
								'<span class="hui-icon hui-alt-icon hui-icon-loading-mini"></span>',
								'<div class="hui-pd-txt">',
									'<%if(this.pdText){%><div class="js-txt"><%=this.pdText%></div><%}%>',
									'<%if(this.pdComment){%><div class="js-comment hui-pd-comment"><span class="js-pdComment"><%=this.pdComment%></span><span class="js-pdTime"><%=this.pdTime%></span></div><%}%>',
								'</div>',
							'</div>',
						'</div>',
					'<%}%>',
					'<div class="js-item-container"><%=this.findHtml(">*")%></div>',
					'<%if(this.hasPullRefresh){%>',
						'<div class="hui-list-more">',
							'<a href="javascript:;" hidefocus="true" class="hui-btn hui-btn-gray hui-shadow hui-inline hui-radius-normal">',
								'<span class="hui-btn-txt">查看更多</span>',
							'</a>',
						'</div>',
					'<%}%>',
				'</div>',
			'</div>'
		].join(''),
		init                : fInit,               //初始化
		addListItem         : fAddListItem,        //添加列表项
		removeListItem      : fRemoveListItem,     //删除列表项
		refreshScroller     : fRefreshScroller,    //刷新iScroll
		destroy             : fDestroy             //销毁
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
		//下拉刷新
		me.hasPullRefresh=me.hasPullRefresh&&window.iScroll;
		if(me.hasPullRefresh){
			//如果在afterShow里初始化iScroll，会看见下拉刷新的元素，所以这里先初始化，afterShow时再调用refresh
			me.listen({
				name : 'afterRender',
				handler : function(){
					var me=this;
					var oWrapper=me.getEl();
					var oPdEl=oWrapper.find('.hui-list-pulldown');
					var oPdTxt=oPdEl.find('.js-txt');
					var nStartY=50;
					var sRefreshCls='hui-pd-refresh';
					var sReleaseCls='hui-pd-release';
					me.scroller= new window.iScroll(oWrapper[0], {
						useTransition: true,
						topOffset: nStartY,
						onRefresh: function () {
							if(oPdEl.hasClass(sRefreshCls)){
				                oPdEl.removeClass(sRefreshCls+' '+sReleaseCls);  
				                oPdTxt.html('下拉可刷新');  
							}
						},
						onScrollMove: function () {
							if (this.y > 5 && !oPdEl.hasClass(sReleaseCls)) {  
				                oPdEl.addClass(sReleaseCls);  
				                oPdTxt.html('松开可刷新');  
								this.minScrollY = 0;
				            } else if (this.y < 5 && oPdEl.hasClass(sReleaseCls)) {  
				                oPdEl.removeClass(sReleaseCls);;  
				                oPdTxt.html('下拉可刷新'); 
								this.minScrollY = -nStartY;
				            } 
						},
						onScrollEnd: function () {
							if (oPdEl.hasClass(sReleaseCls)) {  
				                oPdEl.addClass(sRefreshCls);  
				                oPdTxt.html('正在刷新'); 
				                me.refresh();
				            }
						}
					});
					
				}
			});
			//同步数据后需要刷新
			me.listenTo(me.model,'sync',function(){
				me.findEl('.js-pdTime').html($H.formatDate($H.now(),'HH:mm'));
				setTimeout(function(){
					me.refreshScroller();
				},0);
			});
			//show后需要refresh下，否则无法滚动，iscroll需要浏览器渲染后才能正常初始化
			me.listen({
				name:'afterShow',
				handler:function(){
					me.refreshScroller();
				}
			});
			me.listen({
				name    : 'click',
				method : 'delegate',
				selector : '.hui-list-more',
				handler : function(){
					me.getMore();
				}
			});
		}
	}
	/**
	 * 添加列表项
	 * @param {Object}oListItem 列表项模型
	 */
	function fAddListItem(oListItem){
		var me=this;
		if(me.inited){
			me.findEl(".js-empty").hide();
		}
		me.add({
			model:oListItem,
			renderTo:'>.js-item-container'
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
			me.findEl(".js-empty").show();
		}
	}
	/**
	 * 刷新iScroll
	 */
	function fRefreshScroller(){
		var me=this;
			//仅在页面显示时才刷新，否则scroller会不可用
		if(me.scroller&&me.getEl()[0].clientHeight){
	    	me.scroller.refresh();
		}
	}
	/**
	 * 销毁
	 */
	function fDestroy(){
		var me=this;
		if(me.scroller){
			me.scroller.destroy();
			me.scroller=null;
		}
		me.callSuper();
	}
	
	return ModelList;
});