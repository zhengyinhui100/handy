/**
 * 列表类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-06
 */

$Define('c.List',
['c.AbstractComponent',
'c.ControlGroup'],
function(AC,ControlGroup){
	
	var List=AC.define('List',ControlGroup);
	
	List.extend({
		tmpl              : [
			'<div class="hui-list">',
				'<div class="hui-list-item c-clear">',
				'</div>',
			'</div>'
		]
	});
	
	return List;
});