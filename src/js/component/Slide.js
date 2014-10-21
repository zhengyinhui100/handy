/**
 * 幻灯片类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-10-21
 */

$Define('C.Slide',
'C.AbstractComponent',
function(AC){
	
	var Slide=AC.define('Slide');
	
	Slide.extend({
		//初始配置
		xConfig         : {
			cls         : 'slide'
		},
		
		tmpl            : [
			'<div class="hui-slide" style="width:30em;height:20em;">',
				'<div class="hui-slide-cont">',
					'{{for(var i=0;i<this.pics.length;i++){}}',
						'<div class="hui-cont-pic">',
							'<img class="hui-pic-img" src="img3.jpg"/>',
							'<h1 class="hui-pic-desc">独一无二的定点入手这款</h1>',
						'</div>',
					'{{}}}',
				'</div>',
				'<div class="hui-slide-op">',
					'{{#each pics}}',
						'<a href="javascript:;" hidefocus="true" class="hui-op-btn hui-active"></a>',
					'{{/each}}',
				'</div>',
			'</div>'
		].join(''),
		doConfig        : fDoConfig          //初始化配置
		
	});
	
	/**
	 * 初始化配置
	 * @param {Object}oSettings 参数配置
	 */
	function fDoConfig(oSettings){
		var me=this;
		me.callSuper([oSettings]);
	}
	
	return Slide;
	
});