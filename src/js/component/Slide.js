/**
 * 幻灯片类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-10-21
 */

$Define('C.Slide',
'C.AbstractComponent',
function(AC){
	
	var Slide=AC.define('Slide');
	
	Slide.extend({
		//初始配置
		xConfig         : {
			cls         : 'slide',
			pics        : []
		},
		
		timeout         : 3000,        //播放时间间隔
		
		listeners       : [{
			name        : 'afterRender',
			handler     : function(){
				this.autoSlide();
			}
		},{
			name        : 'mouseover',
			handler     : function(){
				this.autoSlide(true);
			}
		},{
			name        : 'mouseout',
			handler     : function(){
				this.autoSlide();
			}
		},{
			name:'click',
			selector:'.js-op',
			method:'delegate',
			handler:function(oEvt){
				var me=this;
				var oCur=oEvt.currentTarget;
				me.findEl('.js-op').each(function(i,el){
					if(el===oCur){
						me.slide(i);
						return false;
					}
				})
			}
		}],
		
		tmpl            : [
			'<div class="hui-slide" style="width:30em;height:20em;">',
				'<div class="hui-slide-cont">',
					'{{#each pics}}',
						'<div {{bindAttr class="#js-pic #hui-cont-pic active:hui-hidden"}}>',
							'<img class="hui-pic-img" {{bindAttr src="img"}}/>',
							'<h1 class="hui-pic-desc">{{title}}</h1>',
						'</div>',
					'{{/each}}',
				'</div>',
				'<div class="hui-slide-op">',
					'{{#each pics}}',
						'<a href="javascript:;" hidefocus="true" {{bindAttr class="#js-op #hui-op-btn active?hui-active"}}></a>',
					'{{/each}}',
				'</div>',
			'</div>'
		].join(''),
		
		doConfig        : fDoConfig,          //初始化配置
		slide           : fSlide,             //转换到指定页
		autoSlide       : fAutoSlide,         //自动转换
		destroy         : fDestroy            //销毁
	});
	
	/**
	 * 初始化配置
	 * @param {Object}oSettings 参数配置
	 */
	function fDoConfig(oSettings){
		var me=this;
		var aPics=oSettings.pics;
		aPics[0].active=true;
		me.callSuper([oSettings]);
	}
	/**
	 * 转换到指定项
	 * @param {number=}nIndex 指定要切换到的索引，默认为下一张
	 */
	function fSlide(nIndex){
		var me=this;
	 	var aPics=me.findEl('.js-pic');
	 	var aOps=me.findEl('.js-op');
 		var sCls='hui-hidden';
 		var sActiveCls='hui-active';
 		var nWidth=me.getEl()[0].clientWidth;
	 	aPics.each(function(i,el){
	 		var jEl=$(el);
	 		if(!jEl.hasClass(sCls)){
	 			jEl.animate({
	 				left:-nWidth
	 			},function(){
		 			$(aOps[i]).removeClass(sActiveCls);
		 			jEl.addClass(sCls);
	 			});
	 			if(nIndex===undefined){
	 				nIndex=i==aPics.length-1?0:i+1;
	 			}
	 		}
	 	});
	 	var oActive=$(aPics[nIndex]);
	 	oActive.css({left:nWidth}).removeClass(sCls).animate({
	 		left:0
	 	},function(){
			$(aOps[nIndex]).addClass(sActiveCls);
	 	})
	}
	/**
	 * 自动转换
	 * @param{boolean=}bStop 仅当为true时停止自动播放
	 */
	function fAutoSlide(bStop){
		var me=this;
		if(bStop){
			clearTimeout(me.slideTimer);
			return;
		}
		me.slideTimer=setTimeout(function(){
			me.slide();
			me.autoSlide();
		},me.timeout)
	}
	/**
	 * 销毁
	 */
	function fDestroy(){
		var me=this;
		clearTimeout(me.slideTimer);
		me.callSuper();
	}
	
	return Slide;
	
});