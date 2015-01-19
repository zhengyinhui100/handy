/**
 * 列表行类，用于多行的结构
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

define('C.RowItem',
'C.AbstractComponent',
function(AC){
	
	var RowItem=AC.define('RowItem');
	
	RowItem.extend({
		//初始配置
		xConfig         : {
			cls             : 'rowitem',
			text            :'',             //文字
			comment         : '',            //底部注解文字
			extTxt          : '',            //右边说明文字
			underline       : false,         //右边下划线，文字域默认有下划线
			clickable       : false,         //可点击效果，有click事件时默认为true
			newsNum         : 0,             //新消息提示数目，大于9自动显示成"9+"
			padding         : 'big',         //上下padding大小
			hasArrow        : false,         //是否有箭头
			paddingCls      : {
				depends : ['padding'],
				parse:function(){
					var padding=this.get('padding');
					return padding?'hui-rowitem-padding-'+padding:''
				}
			},
			newsNumTxt      : {
				depends : ['newsNum'],
				parse:function(){
					var newsNum=this.get('newsNum');
					return newsNum?newsNum>9?'9+':newsNum:0
				}
			}
		},
		
		tmpl            : [
			'<div {{bindAttr class="underline?hui-rowitem-underline paddingCls clickable?hui-clickable"}}>',
				'{{placeItem}}',
				'<div class="hui-rowitem-txt">{{text}}</div>',
				'<div class="hui-rowitem-comment">{{comment}}</div>',
				'<div class="hui-rowitem-ext">{{extTxt}}</div>',
				'{{#if newsNumTxt}}',
					'<span class="hui-news-tips">{{newsNumTxt}}</span>',
				'{{else}}',
					'{{#if hasArrow}}',
						'<a href="javascript:;" hidefocus="true" class="hui-click-arrow" title="详情"><span class="hui-icon hui-alt-icon hui-icon-carat-r hui-light"></span></a>',
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
		//空格占位符
		var sText=me.get('text');
		if(!sText&&sText!==0){
			me.set('text',"&nbsp;");
		}
		//默认文字域有下划线
		if(me.text!==undefined&&!oSettings.hasOwnProperty('underline')){
			me.set('underline',true);
		}
		//有点击函数时默认有可点击效果
		if(oSettings.click&&!oSettings.hasOwnProperty('clickable')){
			me.set('clickable',true);
		}
		//有可点击效果时默认有右箭头
		if(me.get('clickable')&&!oSettings.hasOwnProperty('hasArrow')){
			me.set('hasArrow',true);
		}
		//有注解
		if(oSettings.comment&&oSettings.padding===undefined){
			me.set('padding','normal');
		}
	}
	
	return RowItem;
	
});