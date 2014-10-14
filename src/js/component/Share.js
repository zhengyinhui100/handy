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
		listeners       : [{
			name:'afterRender',
			custom:true,
			handler:function(){
				//jQuery append在WebKit下无法添加js
				var eScript=document.createElement("script");
		    	eScript.src='http://v3.jiathis.com/code/jia.js';
		    	eScript.type="text/javascript";
				this.getEl()[0].appendChild(eScript);
			}
		}],
		
		tmpl            : [
			'<div class="jiathis_style"><span class="jiathis_txt">分享到：</span>',
			'<a class="jiathis_button_tsina"></a>',
			'<a class="jiathis_button_weixin"></a>',
			'<a href="http://www.jiathis.com/share" class="jiathis jiathis_txt jiathis_separator jtico jtico_jiathis" target="_blank"></a>',
			'<a class="jiathis_counter_style"></a>',
			'</div>',
			'<script type="text/javascript" >',
			'var jiathis_config={summary:"",shortUrl:false,hideMore:false}',
			'</script>'
		].join('')
		
	});
	
	return Share;
	
});