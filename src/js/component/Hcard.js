/**
 * 横向卡片类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

$Define('C.Hcard',
'C.AbstractComponent',
function(AC){
	
	var Hcard=AC.define('Hcard');
	
	Hcard.extend({
		//初始配置
//		image    : '',    //图片
//		title    : '',    //标题
//		desc     : [],    //描述，可以是单个配置也可以是配置数组{icon:图标,text:文字}
//		hasArrow : false, //是否有右边箭头，有点击函数时默认有右箭头
		
		tmpl     : [
			'<div class="hui-hcard',
				'<%if(this.image){%> hui-hcard-hasimg">',
					'<div class="hui-hcard-img">',
						'<img src="<%=this.image%>">',
					'</div>',
				'<%}else{%>',
				'"><%}%>',
				'<div class="hui-hcard-content">',
					'<div class="hui-content-title"><%=this.title%></div>',
					'<%var aDesc=this.desc;aDesc=$H.isArr(aDesc)?aDesc:[aDesc];for(var i=0;i<aDesc.length;i++){%>',
						'<div class="hui-content-desc">',
							'<%var icon;if(icon=aDesc[i].icon){%>',
							'<span class="hui-icon hui-mini hui-alt-icon hui-icon-<%=icon%> hui-light"></span>',
							'<%}%>',
							'<%=aDesc[i].text%>',
						'</div>',
					'<%}%>',
				'</div>',
				'<%=this.findHtml(">*")%>',
				'<%if(this.hasArrow){%>',
					'<a href="javascript:;" hidefocus="true" class="hui-click-arrow" title="详情">',
						'<span class="hui-icon hui-alt-icon hui-icon-carat-r hui-light"></span>',
					'</a>',
				'<%}%>',
			'</div>'
		].join(''),
		doConfig       : fDoconfig    //初始化配置
	});
	/**
	 * 初始化配置
	 * @param {Object}oSettings
	 */
	function fDoconfig(oSettings){
		var me=this;
		me.callSuper();
		//有点击函数时默认有右箭头
		if(oSettings.click&&me.hasArrow==undefined){
			me.hasArrow=true;
		}
	}
		
	return Hcard;
	
});