/**
 * 链接类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-08-07
 */

$Define('C.Link',
'C.AbstractComponent',
function(AC){
	
	var Link=AC.define('Link');
	
	Link.extend({
		//初始配置
		xConfig         : {
			cls         : 'link',
			text        : ''               
		},
		
		tmpl            : 
			'<a hidefocus="true" href="javascript:;">{{text}}</a>'
		
	});
	
	return Link;
	
});