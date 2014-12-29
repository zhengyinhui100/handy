/**
 * 会话类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

define('C.Conversation',
'C.AbstractComponent',
function(AC){
	
	var Conversation=AC.define('Conversation');
	
	Conversation.extend({
		//初始配置
		xConfig         : {
			cls         : 'conversation',
			theme       : 'left',         //会话类型，"left"左边对齐，"right"右边对齐
			time        : '',             //会话时间
			image       : '',             //头像图标
			content     : ''              //会话内容
		},
		
//		imgClick        : $H.noop,        //头像点击事件函数
		
		tmpl            : [
			'<div class="c-clear">',
				'<div class="hui-conver-time">{{time}}</div>',
				'<div class="hui-conver-img js-conver-img">',
					'{{#if image}}',
						'<img {{bindAttr src="image"}}>',
					'{{else}}',
						'{{placeItem}}',
					'{{/if}}',
				'</div>',
				'<div class="hui-conver-content">',
					'{{content}}',
					'<div class="hui-triangle">',
					'</div>',
				'</div>',
			'</div>'].join(''),
		
		doConfig        : fDoConfig
	});
	
	/**
	 * 初始化配置
	 * @param {object}oSettings 配置项
	 */
	function fDoConfig(){
		var me=this;
		me.callSuper();
		if(me.imgClick){
			me.listen({
				name:'click',
				selector:'.js-conver-img',
				method:'delegate',
				handler:function(){
					me.imgClick.call(me);
				}
			})
		}
	}
	
	return Conversation;
	
});