/**
 * 文字标签类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

define('C.Label',
'C.AbstractComponent',
function(AC){
	
	var Label=AC.define('Label');
	
	Label.extend({
		//初始配置
		xConfig         : {
			cls         : 'label',
			text        : '',      //label文字
			color       : '',      //label字体颜色
			textAlign   : '',      //label文字对齐，默认左对齐
			forName     : '',      //label的for属性
			colorCls    : {
				depends:['color'],
				parseDeps:function(){
					var s=this.get('color');
					return s?'hui-label-'+s:'';
				}
			},
			textAlignCls    : {
				depends:['textAlign'],
				parseDeps:function(){
					var s=this.get('textAlign');
					return s?'c-txt-'+s:'';
				}
			}
		},
		
		tmpl            : [
			'<label {{bindAttr class="colorCls textAlignCls" for="forName"}}>',
				'{{text}}',
			'</label>'
		].join('')
		
	});
	
	return Label;
	
});