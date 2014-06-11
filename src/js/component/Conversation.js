/**
 * 会话类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

$Define('C.Conversation',
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
		
		tmpl            : [
			'<div class="c-clear">',
				'<div class="hui-conver-time">{{time}}</div>',
				'<div class="hui-conver-img">',
					'<img {{bindAttr src="image"}}>',
				'</div>',
				'<div class="hui-conver-content">',
					'{{content}}',
					'<div class="hui-triangle">',
						'<div class="hui-triangle hui-triangle-inner"></div>',
					'</div>',
				'</div>',
			'</div>'].join('')
	});
	
	return Conversation;
	
});