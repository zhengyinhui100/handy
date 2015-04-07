/**
 * 模型列表
 * ps:使用下拉刷新需要引入iScroll4
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

define("C.ModelList",
'C.AbstractComponent',
function(AC){
	
	var ModelList=AC.define('ModelList');
	
	ModelList.extend({
		xConfig     : {
			cls             : 'mlist',
			isEmpty         : false,             //列表是否为空
			emptyTips       : '暂无',            //空列表提示
			pdTxt           : '',                //下拉刷新提示文字
			pdComment       : '上次刷新时间：',    //下拉刷新附加说明
			pdTime          : '',                //上次刷新时间
			hasMoreBtn      : true,              //是否有获取更多按钮
			moreBtnTxt      : '查看更多',         //查看更多按钮的文字 
			showBtnIfEmpty  : false,              //空列表时是否显示更多按钮，默认不显示
			hasPullRefresh  : false,              //是否有下拉刷新
			showMoreBtn     : {
				depends : ['isEmpty','showBtnIfEmpty'],
				parse   : function(){
					return this.get('showBtnIfEmpty')||!this.get('isEmpty');
				}
			}
		},
		
		pullTxt             : '下拉可刷新',       //下拉过程提示文字
		flipTxt             : '松开可刷新',       //到松开可以执行刷新操作时的提示
		releaseTxt          : '正在刷新',         //松开时提示文字
		maxNumFromCache     : 20,                //使用缓存数据时单次最大加载数目    
		scrollPos           : 'top',             //默认滚动到的位置，'top'顶部，'bottom'底部
		pulldownIsRefresh   : true,              //true表示下拉式刷新，而按钮是获取更多，false表示相反
//		itemXtype           : '',                //子组件默认xtype
//		refresh             : null,              //刷新接口
//		getMore             : null,              //获取更多接口
		
		tmpl        : [
			'<div class="hui-list">',
				'<div class="hui-list-inner">',
					'{{#if hasPullRefresh}}',
						'<div class="hui-list-pulldown hui-pd-pull c-h-middle-container">',
							'<div class="c-h-middle">',
								'<span class="hui-icon hui-alt-icon hui-icon-arrow-d hui-light"></span>',
								'<span class="hui-icon hui-alt-icon hui-icon-loading-mini"></span>',
								'<div class="hui-pd-txt">',
									'{{#if pdTxt}}<div class="js-txt">{{pdTxt}}</div>{{/if}}',
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
					'<div class="hui-list-container js-item-container">{{placeItem}}</div>',
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
		lazyRefresh         : fLazyRefreshScroller,//懒刷新iScroll
		scrollTo            : fScrollTo,           //滚动到指定位置
		loadMore            : fLoadMore,           //获取更多数据
		pullLoading         : fPullLoading,        //显示正在刷新
		destroy             : fDestroy             //销毁
	});
	/**
	 * 初始化配置
	 */
	function fDoconfig(oSettings){
		var me=this;
		me.callSuper();
		me.set('pdTxt',me.pullTxt);
		if(me.itemXtype){
			(me.defItem||(me.defItem={})).xtype=me.itemXtype;
		}
		var oListItems=me.model;
		if(oListItems.size()==0){
			me.set('isEmpty',true);
		}else{
			me.loadMore();
		}
		if(oListItems.fetching){
			me.set('emptyTips','正在加载中...');
		}
		me.listenTo(oListItems,{
			'add':function(sEvt,oListItem){
				me.addListItem(oListItem);
			},
			'remove':function(sEvt,oListItem){
				me.removeListItem(oListItem);
			},
			'sortItem':function(sEvt,oListItem,nNewIndex,nOldIndex){
				var oView=me.find(function(oView){
					return oView.model&&oView.model.id==oListItem.id;
				});
				oView=oView[0];
				var oEl=oView.getEl();
				var oParent=oEl.parent();
				var oTmp=oParent.children('div').eq(nNewIndex);
				oTmp.before(oEl);
			},
			'reset':function(){
				me.removeListItem('emptyAll');
			},
			'sync':function(){
				if(oListItems.size()===0){
					me.set('isEmpty',true);
				}
				me.set('emptyTips','暂无');
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
					var nStartY=$H.em2px(3.125);
					var nValve=$H.em2px(0.313);
					var sRefreshCls='hui-pd-refresh';
					var sReleaseCls='hui-pd-release';
					me.scroller= new window.iScroll(oWrapper[0], {
						useTransition: true,
						topOffset: nStartY,
						//bounce:false,
						//bounceLock:true,
						mouseWheel:true,
						vScrollbar:false,
						onRefresh: function () {
							if(oPdEl.hasClass(sRefreshCls)){
				                oPdEl.removeClass(sRefreshCls+' '+sReleaseCls);  
				                me.set('pdTxt',me.pullTxt);  
							}
						},
						onScrollMove: function () {
							if (this.y > nValve && !oPdEl.hasClass(sReleaseCls)) {  
				                oPdEl.addClass(sReleaseCls);  
				                me.set('pdTxt',me.flipTxt);  
								this.minScrollY = 0;
				            } else if (this.y < nValve && oPdEl.hasClass(sReleaseCls)) {  
				                oPdEl.removeClass(sReleaseCls);;  
				                me.set('pdTxt',me.pullTxt); 
								this.minScrollY = -nStartY;
				            } 
						},
						onScrollEnd: function () {
							if (oPdEl.hasClass(sReleaseCls)) {  
				                oPdEl.addClass(sRefreshCls);  
				                me.set('pdTxt',me.releaseTxt); 
				                me.pulldownIsRefresh?me.refresh():me.loadMore();
				            }
						}
					});
				}
			});
			//同步数据后需要刷新
			me.listenTo(me.model,'sync',function(){
				me.set('pdTime',$H.formatDate($H.now(),'HH:mm'));
				me.lazyRefresh();
			});
			//show后需要refresh下，否则无法滚动，iscroll需要浏览器渲染后才能正常初始化
			me.listen({
				name:'afterShow',
				handler:function(){
					me.lazyRefresh();
					if(me.scrollPos=='bottom'){
						setTimeout(function(){
							me.scrollTo('bottom');
						},0);
					}
				}
			});
		}
		
		if(me.get('hasMoreBtn')){
			me.listen({
				name    : 'click',
				method : 'delegate',
				selector : '.hui-list-more',
				handler : function(){
					me.pulldownIsRefresh?me.loadMore():me.refresh();
				}
			});
		}
	}
	/**
	 * 添加列表项
	 * @param {Object}oListItem 列表项模型
	 * @param {number=}nIndex 指定添加位置
	 */
	function fAddListItem(oListItem,nIndex){
		var me=this;
		me.set('isEmpty',false);
		if(nIndex===undefined){
			nIndex=me.model.indexOf(oListItem);
			//可能有缓存数据没有加载到视图中
			var nCurLen=me.inited?me.children.length:me.items.length;
			nIndex=nIndex>nCurLen?nCurLen:nIndex;
		}
		me.add({
			model:oListItem
		},nIndex);
		me.lazyRefresh();
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
		me.lazyRefresh();
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
	 * 懒刷新iScroll，多次调用此方法只会执行一次实际刷新
	 */
	function fLazyRefreshScroller(){
		var me=this;
		if(me._toRefresh){
			return;
		}
		me._toRefresh=1;
		setTimeout(function(){
			me._toRefresh=0;
			me.refreshScroller();
		},0);
	}
	/**
	 * 滚动到指定位置
	 * @param {string|number}pos 位置，字符串参数：'top'表示顶部，'bottom'表示底部，数字参数表示横坐标
	 * @param {number=}pageY 纵坐标
	 * @param {number=}nTime 动画时间
	 */
	function fScrollTo(pos,pageY,nTime){
		var me=this;
		if(!me.scrollToTimer){
			var aArgs=arguments;
			//dom有改变时，不延迟的话，scrollTo无效
			me.scrollToTimer=setTimeout(function(){
				me.scrollTo.apply(me,aArgs);
				me.scrollToTimer=null;
			},0);
			return;
		}
		var oScroller=me.scroller;
		if($H.isStr(pos)){
			if(pos=='top'){
				oScroller.scrollTo(0,-$H.em2px(3.125));
			}else if(pos=='bottom'){
				var nHeight=me.findEl('.hui-list-inner')[0].clientHeight;
				oScroller.scrollTo(0,-nHeight);
			}
		}else{
			oScroller.scrollTo(pos,pageY,nTime);
		}
	}
	/**
	 * 获取更多数据
	 */
	function fLoadMore(){
		var me=this;
		var oListItems=me.model;
		var nCurNum=me.children.length;
		var nSize=oListItems.size();
		if(nSize>nCurNum){
			//先尝试从缓存中获取
			var nMax=me.maxNumFromCache,nStart=nCurNum,nEnd=nCurNum+nMax;
			if(me.pulldownIsRefresh){
				oListItems.each(function(i,item){
					if(i>=nStart&&i<nEnd){
						me.addListItem(item);
					}
				});
			}else{
				nEnd=nSize-nCurNum;
				nStart=nEnd-nMax;
				oListItems.eachDesc(function(i,item){
					if(i>=nStart&&i<nEnd){
						me.addListItem(item,0);
					}
				});
			}
			me.lazyRefresh();
		}else{
			me.getMore();
		}
	}
	/**
	 * 显示正在刷新
	 * @param{boolean=}bRefresh 仅当true时执行刷新
	 */
	function fPullLoading(bRefresh){
		var me=this;
		var oScroller=me.scroller;
		var tmp=oScroller.minScrollY;
		oScroller.minScrollY=$H.em2px(0.625);
		if(bRefresh){
			var oPdEl=me.findEl('.hui-list-pulldown');
			oPdEl.addClass('hui-pd-release');
		}
		oScroller.scrollTo(0,0,200);
		setTimeout(function(){
			oScroller.minScrollY=tmp;
		},1000);
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