/**
 * 面板类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-01
 */

$Define('C.Panel',
'C.AbstractComponent',
function(AC){
	
	var Panel=AC.define('Panel');
	
	Panel.extend({
		//初始配置
//		content         : '',               //内容
		isLoading       : false,            //是否显示正在加载中
		loadingTxt      : '正在加载中...',   //正在加载中的提示文字
		
		
		tmpl            : [
			'<div>',
				'<%if(this.isLoading){%>',
					'<div class="hui-panel-loading">',
						'<div class="hui-mask"></div>',
						'<div class="hui-loading-container">',
							'<div class="hui-tips hui-tips-big hui-tips-black hui-radius-little">',
								'<span class="hui-icon hui-icon-loading"></span>',
								'<span class="hui-tips-txt"><%=this.loadingTxt%></span>',
							'</div>',
						'</div>',
					'</div>',
				'<%}%>',
				'<%=this.content||this.findHtml(">*")%>',
			'</div>'
		].join('')
	});
	
	return Panel;
	
});