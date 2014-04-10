/**
 * 列表类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-06
 */

$Define('C.List',
['C.AbstractComponent',
'C.ControlGroup'],
function(AC,ControlGroup){
	
	var List=AC.define('List',ControlGroup);
	
	List.extend({
		cls               : 'list',
		tmpl              : [
			'<div>',
				'<div class="hui-list-item c-clear">',
				'</div>',
			'</div>'
		]
	});
	
	return List;
});