/**
 * 图片展示卡片类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-10-20
 */

define('C.PicCard',
'C.AbstractComponent',
function(AC){
	
	var PicCard=AC.define('PicCard');
	
	PicCard.extend({
		//初始配置
		xConfig             : {
			cls             : 'picard',
			radius          : 'normal',
			shadowOverlay   : true,
			headerImg       : '',             //头部展示图片
			desc            : '',             //中间描述文字
			avatar          : '',             //用户头像
			userName        : '',             //用户名
			opDesc          : '',             //操作描述
			opNum           : 0               //赞次数
		},
		
		listeners           : [{
			name:'mouseover',
			el:'.js-header',
			handler:function(oEvt){
				$(oEvt.currentTarget).addClass('hui-header-hover');
			}
		},{
			name:'mouseout',
			el:'.js-header',
			handler:function(oEvt){
				$(oEvt.currentTarget).removeClass('hui-header-hover');
			}
		},{
			name:'click',
			selector:'.js-avatar',
			method:'delegate',
			handler:function(){
				this.avatarClick&&this.avatarClick();
			}
		},{
			name:'click',
			selector:'.js-op',
			method:'delegate',
			handler:function(){
				this.opClick&&this.opClick();
			}
		}],
		
		tmpl            : [
		'<div>',
			'<div class="js-header hui-picard-header">',
				'<a href="javascript:;" hidefocus="true" class="hui-header-img">',
					'<img class="js-header-img" {{bindAttr src="headerImg"}}/>',
				'</a>',
				'<div class="hui-header-op">',
					'<div class="hui-mask"></div>',
					'<div class="hui-op-container c-h-middle-container">',
						'{{placeItem > [xrole=headerOp]}}',
					'</div>',
				'</div>',
			'</div>',
			'<div class="hui-picard-footer">',
				'<div class="hui-picard-desc c-comment">{{desc}}</div>',
				'<div class="hui-picard-op c-clear">',
					'<a class="js-avatar hui-op-avatar" href="javascript:;" hidefocus="true">',
						'<div class="hui-avatar hui-radius-large">',
							'<div class="hui-avatar-img hui-radius-large">',
								'<img {{bindAttr src="avatar"}}>',
							'</div>',
						'</div>',
						'<span class="hui-op-link">{{userName}}</span>',
					'</a>',
					'<span class="hui-op-desc">{{opDesc}}</span>',
					'<a class="js-op hui-op-like" href="javascript:;" hidefocus="true">',
						'<span class="hui-op-num">{{opNum}}</span>',
						'<span class="hui-icon hui-alt-icon hui-radius-big hui-icon-heart hui-light"></span>',
					'</a>',
				'</div>',
			'</div>',
		'</div>'].join('')
	});
	
	return PicCard;
	
});