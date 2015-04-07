/**
 * 集合类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-25
 */

define('C.Set',
'C.AbstractComponent',
function(AC){
	
	var Set=AC.define('Set');
	
	Set.extend({
		xConfig         : {
			cls         : 'set',
			theme       : 'normal',
			title       : ''      //标题
		},
		
		tmpl            : [
			'<div>',
				'<div class="hui-set-title">',
					'{{#if title}}',
						'<h1 class="hui-title-txt">{{title}}</h1>',
					'{{/if}}',
					'{{placeItem > [xrole=title]}}',
				'</div>',
				'<div class="hui-set-content">',
					'{{placeItem > [xrole!=title]}}',
				'</div>',
			'</div>'
		].join('')
		
	});
	
	return Set;
	
});