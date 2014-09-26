/**
 * 社会化分享类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

$Define('C.Share',
'C.AbstractComponent',
function(AC){
	
	var Share=AC.define('Share');
	
	Share.extend({
		//初始配置
		xConfig         : {
			cls         : 'share'
		},
		
		tmpl            : [
		'<div class="jiathis_style">',
			'<span class="jiathis_txt">分享到：</span>',
			'<a class="jiathis_button_tools_1"></a>',
			'<a class="jiathis_button_tools_2"></a>',
			'<a class="jiathis_button_tools_3"></a>',
			'<a class="jiathis_button_tools_4"></a>',
			'<a href="http://www.jiathis.com/share" class="jiathis jiathis_txt jiathis_separator jtico jtico_jiathis" target="_blank">更多</a>',
			'<a class="jiathis_counter_style"></a>',
		'</div>',
		'<script type="text/javascript" src="http://v3.jiathis.com/code_mini/jia.js" charset="utf-8"></script>'
		].join('')
		
	});
	
	return Share;
	
});