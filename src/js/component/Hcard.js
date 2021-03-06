/**
 * 横向卡片类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

define('C.Hcard',
'C.AbstractComponent',
function(AC){
	
	var Hcard=AC.define('Hcard');
	
	Hcard.extend({
		//初始配置
		xConfig  : {
			cls         : 'hcard',
			image       : '',    //图片
			title       : '',    //标题
			titleExt    : '',    //小标题
			titleDesc   : '',    //标题说明
			hasImg      : true,  //是否有图片
			txtOverflow : true, //文字超出长度显示省略号
			clickable   : false, //可点击效果，有click事件时默认为true
			newsNum     : 0,     //新消息提示数目，大于9自动显示成"9+"
			hasBorder   : false, //是否有边框
			hasImgCls   : {      //是否有图片
				deps : ['image','hasImg'],
				parseDeps:function(image,hasImg){
					return (image||hasImg)?'hui-hcard-hasimg':'';
				}
			},  
			newsNumTxt  : {
				deps : ['newsNum'],
				parseDeps:function(newsNum){
					return newsNum?newsNum>9?'9+':newsNum:0
				}
			}
		},
		defItem  : {
			xtype : 'Desc',
			xrole : 'content'
		},
		
//		imgClick        : $H.noop,        //图片点击事件函数
//		contentClick    : $H.noop,        //图片点击事件函数
		
		tmpl     : [
			'<div {{bindAttr class="hasImgCls hasBorder?hui-border clickable?hui-clickable"}}>',
				'{{#if image}}',
					'<div class="hui-hcard-img js-img">',
						'<img {{bindAttr src="image"}}>',
					'</div>',
				'{{/if}}',
				'<div class="hui-hcard-content js-content">',
					'<div {{bindAttr class="#hui-content-title txtOverflow?c-txt-overflow"}}>',
						'{{title}}',
						'<span class="hui-title-ext">{{titleExt}}</span>',
						'<span class="hui-title-desc">{{titleDesc}}</span>',
					'</div>',
					'{{placeItem > [xrole=content]}}',
				'</div>',
				'{{placeItem > [xrole!=content]}}',
				'{{#if newsNumTxt}}',
					'<span class="hui-news-tips">{{newsNumTxt}}</span>',
				'{{else}}',
					'{{#if clickable}}',
						'<a href="javascript:;" hidefocus="true" class="hui-click-arrow" title="详情">',
							'<span class="hui-icon hui-alt-icon hui-icon-carat-r hui-light"></span>',
						'</a>',
					'{{/if}}',
				'{{/if}}',
			'</div>'
		].join(''),
		doConfig       : fDoconfig    //初始化配置
	});
	/**
	 * 初始化配置
	 * @param {Object}oSettings
	 */
	function fDoconfig(oSettings){
		var me=this;
		me.callSuper();
		//有点击函数时默认有右箭头
		if(oSettings.click&&me.clickable===undefined){
			me.set('clickable',true);
		}
		//描述类
		var aDesc=me.desc;
		if(aDesc){
			if(aDesc.length==1){
				me.set('theme','little');
			}
			me.add(aDesc);
		}
		if(me.imgClick){
			me.listen({
				name:'click',
				selector:'.js-img',
				method:'delegate',
				handler:function(){
					me.imgClick.call(me);
				}
			})
		}
		if(me.contentClick){
			me.listen({
				name:'click',
				selector:'.js-content',
				method:'delegate',
				handler:function(){
					me.contentClick.call(me);
				}
			})
		}
	}
		
	return Hcard;
	
});