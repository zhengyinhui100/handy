/**
 * 集合类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-25
 */

$Define('C.Set',
'C.AbstractComponent',
function(AC){
	
	var Set=AC.define('Set');
	
	Set.extend({
		xConfig         : {
			cls         : 'set',
			title       : ''      //标题
		},
		
		tmpl            : [
			'<div>',
				'<div class="hui-set-title">',
					'<h1 class="title">{{title}}</h1>',
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