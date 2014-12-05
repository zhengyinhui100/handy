/**
 * 滚动类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-12-05
 */

$Define('C.Scroll',
'C.AbstractComponent',
function(AC){
	
	var Scroll=AC.define('Scroll');
	
	Scroll.extend({
		//初始配置
		xConfig         : {
			cls         : 'scroll'
		}
		
	});
	
	
	return Scroll;
	
});