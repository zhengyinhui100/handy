/**
 * 描述类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

$Define('C.Desc',
['C.AbstractComponent',
'CM.Model',
'CM.Collection'],
function(AC,Model,Collection){
	
	var Desc=AC.define('Desc');
	
	Desc.extend({
		//初始配置
		xConfig  : {
			cls      : 'desc',
			icon     : '',
			text     : '',
			iconCls : {
				depends:['icon'],
				parse:function(){
					var sIcon=this.get('icon');
					return sIcon?'hui-icon-'+sIcon:'';
				}
			}
		},
		
		tmpl     : [
			'<div class="hui-content-desc">',
				'{{#if icon}}',
					'<span {{bindAttr class="#hui-icon #hui-mini #hui-alt-icon iconCls #hui-light"}}></span>',
				'{{/if}}',
				'{{text}}',
			'</div>'
		].join('')
	});
		
	return Desc;
	
});