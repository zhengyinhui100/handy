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
		xConfig     : {
			cls             : 'mlist',
			isEmpty         : false,             //列表是否为空
			emptyTips       : '暂无',            //空列表提示
			pdText          : '下拉可刷新',       //下拉刷新提示文字
			pdComment       : '上次刷新时间：',    //下拉刷新附加说明
			pdTime          : '',                //上次刷新时间
			hasMoreBtn      : true,              //是否有获取更多按钮
			moreBtnTxt      : '查看更多',         //查看更多按钮的文字 
			showBtnIfEmpty  :false,              //空列表时是否显示更多按钮，默认不显示
			hasPullRefresh  : false,              //是否有下拉刷新
			showMoreBtn     : {
				depends : ['isEmpty','showBtnIfEmpty'],
				parse   : function(){
					return this.get('showBtnIfEmpty')||!this.get('isEmpty');
				}
			}
		},
//		itemXtype   : '',                //子组件默认xtype
//		refresh     : null,              //刷新接口
//		getMore     : null,              //获取更多接口
		
		tmpl        : [
			'<div class="hui-list">',
				'<div class="hui-list-inner">',
					'{{#if hasPullRefresh}}',
						'<div class="hui-list-pulldown hui-pd-pull c-h-middle-container">',
							'<div class="c-h-middle">',
								'<span class="hui-icon hui-alt-icon hui-icon-arrow-d hui-light"></span>',
								'<span class="hui-icon hui-alt-icon hui-icon-loading-mini"></span>',
								'<div class="hui-pd-txt">',
									'{{#if pdText}}<div class="js-txt">{{pdText}}</div>{{/if}}',
									'{{#if pdComment}}',
										'<div class="js-comment hui-pd-comment">',
										'<span class="js-pdComment">{{pdComment}}</span>',
										'<span class="js-pdTime">{{pdTime}}</span>',
										'</div>',
									'{{/if}}',
								'</div>',
							'</div>',
						'</div>',
					'{{/if}}',
					'{{#if isEmpty}}',
						'<div class="hui-list-empty js-empty">{{emptyTips}}</div>',
					'{{/if}}',
					'<div class="js-item-container">{{placeItem}}</div>',
					'{{#if hasMoreBtn}}',
						'<div {{bindAttr class="#hui-list-more showMoreBtn:hui-hidden"}}>',
							'<a href="javascript:;" hidefocus="true" class="hui-btn hui-btn-gray hui-shadow hui-inline hui-radius-little">',
								'<span class="hui-btn-txt">{{moreBtnTxt}}</span>',
							'</a>',
						'</div>',
					'{{/if}}',
				'</div>',
			'</div>'
		].join(''),
		doConfig            : fDoconfig,           //初始化配置
		addListItem         : fAddListItem,        //添加列表项
		removeListItem      : fRemoveListItem,     //删除列表项
		refreshScroller     : fRefreshScroller,    //刷新iScroll
		destroy             : fDestroy             //销毁
	});
	/**
	 * 初始化配置
	 */
	function fDoconfig(oSettings){
		var me=this;
		me.callSuper();
		if(me.itemXtype){
			(me.defItem||(me.defItem={})).xtype=me.itemXtype;
		}
		var oListItems=me.model;
		var bHas=false;
		oListItems.each(function(i,item){
			me.addListItem(item);
			bHas=true;
		});
		if(!bHas){
			me.set('isEmpty',true);
		}
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
		var bHasPd=me.hasPullRefresh&&window.iScroll&&!$H.ie();
		me.set('hasPullRefresh',bHasPd);
		if(bHasPd){
			//如果在afterShow里初始化iScroll，会看见下拉刷新的元素，所以这里先初始化，afterShow时再调用refresh
			me.listen({
				name : 'afterRender',
				handler : function(){
					var me=this;
					var oWrapper=me.getEl();
					var oPdEl=oWrapper.find('.hui-list-pulldown');
					var nStartY=50;
					var sRefreshCls='hui-pd-refresh';
					var sReleaseCls='hui-pd-release';
					me.scroller= new window.iScroll(oWrapper[0], {
						useTransition: true,
						topOffset: nStartY,
						onRefresh: function () {
							if(oPdEl.hasClass(sRefreshCls)){
				                oPdEl.removeClass(sRefreshCls+' '+sReleaseCls);  
				                me.set('pdText','下拉可刷新');  
							}
						},
						onScrollMove: function () {
							if (this.y > 5 && !oPdEl.hasClass(sReleaseCls)) {  
				                oPdEl.addClass(sReleaseCls);  
				                me.set('pdText','松开可刷新');  
								this.minScrollY = 0;
				            } else if (this.y < 5 && oPdEl.hasClass(sReleaseCls)) {  
				                oPdEl.removeClass(sReleaseCls);;  
				                me.set('pdText','下拉可刷新'); 
								this.minScrollY = -nStartY;
				            } 
						},
						onScrollEnd: function () {
							if (oPdEl.hasClass(sReleaseCls)) {  
				                oPdEl.addClass(sRefreshCls);  
				                me.set('pdText','正在刷新'); 
				                me.refresh();
				            }
						}
					});
					
				}
			});
			//同步数据后需要刷新
			me.listenTo(me.model,'sync',function(){
				me.set('pdTime',$H.formatDate($H.now(),'HH:mm'));
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
		me.set('isEmpty',false);
		me.add({
			model:oListItem
		},me.model.indexOf(oListItem));
		me.refreshScroller();
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
			me.set('isEmpty',true);;
		}
		me.refreshScroller();
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