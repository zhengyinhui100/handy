/**
 * 模型列表
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
			'<div class="hui-list s-scroll">',
				'<div class="hui-list-inner">',
					'<div<%if(this.children.length>0){%> style="display:none"<%}%> class="hui-list-empty js-empty"><%=this.emptyTips%></div>',
					'<%if(this.hasPullRefresh){%>',
						'<div class="hui-list-pulldown hui-pd-pull c-h-middle-container">',
							'<div class="c-h-middle">',
								'<span class="hui-icon hui-alt-icon hui-icon-arrow-d hui-light"></span>',
								'<span class="hui-icon hui-alt-icon hui-icon-loading-white"></span>',
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
		],
		init                : fInit,               //初始化
		addListItem         : fAddListItem,        //添加列表项
		removeListItem      : fRemoveListItem,     //删除列表项
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
		
		if(me.hasPullRefresh){
			me.listeners=me.listeners.concat([{
				name : 'afterRender',
				handler : function(){
					var me=this;
					var oWrapper=me.getEl();
					oWrapper.css({height:document.body.clientHeight-40});
					var oPdEl=oWrapper.find('.hui-list-pulldown');
					var oPdTxt=oPdEl.find('.js-txt');
					var nStartY=50;
					me.scroller= new window.iScroll(oWrapper[0], {
						useTransition: true,
						topOffset: nStartY,
						onRefresh: function () {
							if(oPdEl.hasClass('hui-pd-refresh')){
				                oPdEl.removeClass('hui-pd-refresh hui-pd-release');  
				                oPdTxt.html('下拉可刷新');  
							}
						},
						onScrollMove: function () {
							if (this.y > 5 && !oPdEl.hasClass('hui-pd-release')) {  
				                oPdEl.addClass('hui-pd-release');  
				                oPdTxt.html('松开可刷新');  
								this.minScrollY = 0;
				            } else if (this.y < 5 && oPdEl.hasClass('hui-pd-release')) {  
				                oPdEl.removeClass('hui-pd-release');;  
				                oPdTxt.html('下拉可刷新'); 
								this.minScrollY = -nStartY;
				            } 
						},
						onScrollEnd: function () {
							if (oPdEl.hasClass('hui-pd-release')) {  
				                oPdEl.addClass('hui-pd-refresh');  
				                oPdTxt.html('正在刷新'); 
				                me.refresh();
				            }
						}
					});
					
					//同步数据后需要刷新
					me.listenTo(me.model,'sync',function(){
						setTimeout(function(){
							//仅在页面显示时才刷新，否则scroller会不可用
							if(oWrapper[0].clientHeight){
						    	me.scroller.refresh();
							}
						},0);
					});
				}
			},{
				name    : 'click',
				method : 'delegate',
				selector : '.hui-list-more',
				handler : function(){
					me.getMore();
				}
			}]);
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