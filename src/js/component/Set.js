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
				'<h1 class="hui-set-title">{{title}}</h1>',
				'<div class="hui-set-content">',
					'{{placeItem}}',
				'</div>',
			'</div>'
		].join('')
		
	});
	
	return Set;
	
});