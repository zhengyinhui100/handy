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
			txtOverflow : true,     //文字超出长度显示省略号
			iconCls : {
				depends:['icon'],
				parse:function(){
					var sIcon=this.get('icon');
					return sIcon?'hui-icon-'+sIcon:'';
				}
			}
		},
		
		tmpl     : [
			'<div {{bindAttr class="txtOverflow?c-txt-overflow"}}>',
				'{{#if icon}}',
					'<span {{bindAttr class="#hui-icon #hui-size-mini #hui-alt-icon iconCls #hui-light"}}></span>',
				'{{/if}}',
				'<span class="hui-desc-txt">{{text}}</span>',
				'<div class="hui-desc-right">',
					'{{placeItem > [xrole=right]}}',
				'</div>',
				'{{placeItem > [xrole!=right]}}',
			'</div>'
		].join('')
	});
		
	return Desc;
	
});