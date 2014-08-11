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
			'<div {{bindAttr class="#c-clear txtOverflow?c-txt-overflow"}}>',
				'{{placeItem > [xrole=icon]}}',
				'<span class="hui-desc-txt">{{text}}</span>',
				'<div class="hui-desc-right">',
					'{{placeItem > [xrole=right]}}',
				'</div>',
				'{{placeItem > [!xrole]}}',
			'</div>'
		].join(''),
		
		parseItem  : fParseItem      //分析子组件
	});
	
	/**
	 * 分析子组件
	 * @param{object}oItem
	 */
	function fParseItem(oItem){
		if(oItem.xtype==='Icon'){
			$H.extendIf(oItem,{
				xrole:'icon',
				isAlt:true,
				extCls:'hui-light',
				size:'mini',
				hasBg:false
			});
		}
	}
		
	return Desc;
	
});