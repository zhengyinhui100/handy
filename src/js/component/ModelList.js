/**
 * 模型列表
 * ps:使用下拉刷新需要引入iScroll4
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

define("C.ModelList",
[
'B.Util',
'B.Object',
'B.Date',
'B.Support',
'C.AbstractComponent',
'E.Draggable'
],
function(Util,Obj,Date,Support,AC,Draggable){
	
	var ModelList=AC.define('ModelList');
	
	ModelList.extend({
		xConfig     : {
			cls             : 'mlist',
			isEmpty         : false,             //列表是否为空
			emptyTips       : '暂无',             //空列表提示
			pdTxt           : '',                //下拉刷新提示文字
			pdComment       : '上次刷新时间：',    //下拉刷新附加说明
			pdTime          : '',                //上次刷新时间
			hasMoreBtn      : true,              //是否有获取更多按钮
			moreBtnTxt      : '查看更多',         //查看更多按钮的文字 
			showBtnLimit    : 15,                //要显示更多按钮的最小行数
			hasPullRefresh  : false,             //是否有下拉刷新
			showMoreBtn     : false              //是否显示更多按钮
		},
		
		pullTxt             : '下拉可刷新',       //下拉过程提示文字
		flipTxt             : '松开可刷新',       //到松开可以执行刷新操作时的提示
		releaseTxt          : '正在刷新',         //松开时提示文字
		maxNumFromCache     : 20,                //使用缓存数据时单次最大加载数目    
		scrollPos           : 'top',             //默认滚动到的位置，'top'顶部，'bottom'底部
		pulldownIsRefresh   : true,              //true表示下拉式刷新，而按钮是获取更多，false表示相反
//		itemXtype           : '',                //子组件默认xtype
		refresh             : $H.noop,           //刷新接口
		autoFetch           : true,              //初始化时如果没有数据是否自动获取
		getMore             : $H.noop,           //获取更多接口
		
		tmpl        : [
			'<div class="hui-list">',
				'<div class="hui-list-inner">',
					'{{#if hasPullRefresh}}',
						'<div class="hui-list-pulldown hui-pd-pull c-h-middle-container">',
							'<div class="c-h-middle hui-pull-container">',
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
		initPdRefresh       : fInitPdRefresh,      //初始化下拉刷新功能
		addListItem         : fAddListItem,        //添加列表项
		removeListItem      : fRemoveListItem,     //删除列表项
		scrollTo            : fScrollTo,           //滚动到指定位置
		loadMore            : fLoadMore,           //获取更多数据
		pullLoading         : fPullLoading,        //显示正在刷新
		destroy             : fDestroy             //销毁
	});
	
	var _sPosProp='marginTop';
	
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
		}
		me.loadMore(true);
		if(oListItems.fetching){
			me.set('emptyTips','加载中...');
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
		var bHasPd=me.hasPullRefresh;
		me.set('hasPullRefresh',bHasPd);
		if(bHasPd){
			me.initPdRefresh();
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
	 * 初始化下拉刷新功能
	 */
	function fInitPdRefresh(){
		var me=this;
		me.listen({
			name : 'afterRender',
			handler : function(){
				var oWrapper=me.getEl();
				var oInner=me.innerEl=oWrapper.find('.hui-list-inner');
				var oPdEl=oWrapper.find('.hui-list-pulldown');
				oInner[0].style[_sPosProp]='-3.125em';
				var nStartY=Util.em2px(3.125);
				var nValve=Util.em2px(2.313);
				var sRefreshCls='hui-pd-refresh';
				var sReleaseCls='hui-pd-release';
				
				me.draggable=new Draggable(me.getEl(),{
					preventDefault:false,
					start:function(){
						//记录初始滚动位置
						me._scrollY=me.getEl()[0].scrollTop;
					},
					move:function(oPos,oOrigEvt){
						//往下拉才计算
						if(oPos.offsetY>0&&oPos.offsetY>Math.abs(oPos.offsetX)){
							var nScrollY=me._scrollY-oPos.offsetY;
							//到顶部临界点后才开始显示下拉刷新
							if(nScrollY<0){
								nScrollY=-nScrollY;
								//不在这里阻止默认事件的话，Android下move只会触发一次
								oOrigEvt.preventDefault();
								//逐渐减速
								nScrollY=Math.pow(nScrollY,0.85);
								oInner[0].style[_sPosProp]=-nStartY+nScrollY+'px';
								if (nScrollY > nValve && !oPdEl.hasClass(sReleaseCls)) {  
					                oPdEl.addClass(sReleaseCls);  
					                me.set('pdTxt',me.flipTxt);  
					            } else if (nScrollY < nValve && oPdEl.hasClass(sReleaseCls)) {  
					                oPdEl.removeClass(sReleaseCls);;  
					                me.set('pdTxt',me.pullTxt); 
					            }
							}
						}
						return false;
					},
					end:function(){
		                var oPos={};
						if (oPdEl.hasClass(sReleaseCls)) {  
			                oPdEl.addClass(sRefreshCls);  
			                me.set('pdTxt',me.releaseTxt);
			                oPos[_sPosProp]=0;
			                oInner.animate(oPos,'fast',function(){
				                me.pulldownIsRefresh?me.refresh():me.loadMore();
			                });
			            }else{
			            	oPos[_sPosProp]=-nStartY;
			            	oInner.animate(oPos);
			            }
					}
				});
				//同步数据后需要刷新
				me.listenTo(me.model,'sync',function(){
					me.set('pdTime',Date.formatDate(Date.now(),'HH:mm'));
					if(oPdEl.hasClass(sRefreshCls)){
		                oPdEl.removeClass(sRefreshCls+' '+sReleaseCls);  
		                me.set('pdTxt',me.pullTxt);
		                var oPos={};
		                oPos[_sPosProp]=-nStartY;
						oInner.animate(oPos);
					}
				});
			}
		});
		me.listen({
			name:'afterShow',
			handler:function(){
				if(me.scrollPos=='bottom'){
					setTimeout(function(){
						me.scrollTo('bottom');
					},0);
				}
			}
		});
	}
	/**
	 * 添加列表项
	 * @param {Object}oListItem 列表项模型
	 * @param {number=}nIndex 指定添加位置
	 */
	function fAddListItem(oListItem,nIndex){
		var me=this;
		me.set('isEmpty',false);
		if(me.model.size()===me.get('showBtnLimit')){
			me.set('showMoreBtn',true);
		}
		if(nIndex===undefined){
			nIndex=me.model.indexOf(oListItem);
			//可能有缓存数据没有加载到视图中
			var nCurLen=me.inited?me.children.length:me.items.length;
			nIndex=nIndex>nCurLen?nCurLen:nIndex;
		}
		me.add({
			model:oListItem
		},nIndex);
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
	}
	/**
	 * 滚动到指定位置
	 * @param {string|number}pos 纵轴位置，字符串参数：'bottom'表示底部
	 */
	function fScrollTo(pos){
		var me=this;
		var oEl=me.getEl()[0];
		if(Obj.isStr(pos)){
			if(pos=='bottom'){
				var nHeight=me.findEl('.hui-list-inner')[0].clientHeight;
				oEl.scrollTop=nHeight;
			}
		}else{
			oEl.scrollTop=pos;
		}
	}
	/**
	 * 获取更多数据
	 * @param {boolean=} bIsInit 是否是初始化时自动加载数据
	 */
	function fLoadMore(bIsInit){
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
		}else if(!bIsInit||(!oListItems.fetching&&me.autoFetch)){
			me.getMore();
		}
	}
	/**
	 * 显示正在刷新
	 * @param{boolean=}bRefresh 仅当true时执行刷新
	 */
	function fPullLoading(bRefresh){
		var me=this;
		me.scrollTo(0);
		me.innerEl[0].style[_sPosProp]=0;
		if(bRefresh){
			var oPdEl=me.findEl('.hui-list-pulldown');
			oPdEl.addClass('hui-pd-refresh');  
            me.set('pdTxt',me.releaseTxt); 
            me.pulldownIsRefresh?me.refresh():me.loadMore();
		}
	}
	/**
	 * 销毁
	 */
	function fDestroy(){
		var me=this;
		var oDrag=me.draggable;
		if(oDrag){
			oDrag.destroy();
			me.draggable=null;
		}
		me.callSuper();
	}
	
	return ModelList;
});