/**
 * 表单域类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-25
 */

define('C.Field',
[
'B.Object',
'C.AbstractComponent'
],
function(Obj,AC){
	
	var Field=AC.define('Field');
	
	Field.extend({
		//初始配置
		xConfig         : {
			cls           : 'field',
			noPadding     : false     //true表示没有上下间隙
		},
//		forName         : '',      //label标签for名字
//		title           : '',      //label文字字符串，或者Label或其它组件的配置项
//		content         : '',      //右边文字，或组件配置
		
		defItem         : {
			xtype       : 'RowItem',
			xrole       : 'content'
		},
		
		tmpl            : [
			'<div>',
				'<div class="hui-field-left">',
					'{{placeItem > [xrole=title]}}',
				'</div>',
				'<div {{bindAttr class="#hui-field-right noPadding?hui-field-nopadding"}}>',
					'{{placeItem > [xrole=content]}}',
				'</div>',
			'</div>'
		].join(''),
		doConfig       : fDoConfig    //初始化配置
	});
	/**
	 * 初始化配置
	 * @param {Object}oSettings
	 */
	function fDoConfig(oSettings){
		var me=this;
		var title=oSettings.title;
		if(Obj.isSimple(title)){
			title={
				text:title
			};
		}
		title=Obj.extend({
			xtype:'Label',
			xrole:'title'
		},title);
		me.add(title);
		
		//内容
		var content=oSettings.content;
		//默认有空白字符
		if(content===undefined&&!oSettings.items){
			content='';
		}
		//包装文字内容
		if(Obj.isSimple(content)){
			content=({
				text:content,
				//默认文字域有下划线
				underline:true
			})
		}
		if(content){
			me.noPadding=true;
			me.add(content);
		}
		var oSet=$.extend({},oSettings);
		delete oSet.title;
		delete oSet.content;
		me.callSuper([oSet]);
	}
	
	return Field;
	
});