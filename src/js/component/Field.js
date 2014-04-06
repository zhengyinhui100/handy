/**
 * 表单域类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-25
 */

$Define('C.Field',
'C.AbstractComponent',
function(AC){
	
	var Field=AC.define('Field');
	
	Field.extend({
		//初始配置
//		forName         : '',      //label标签for名字
//		title           : '',      //label文字字符串，或者Label或其它组件的配置项
//		content         : '',      //右边文字，或组件配置
//		noPadding       : false,   //true表示没有上下间隙
		
		defItem         : {
			xtype       : 'RowItem',
			xrole       : 'content'
		},
		
		tmpl            : [
			'<div class="hui-field<%if(!this.noPadding){%> hui-field-padding<%}%>">',
				'<div class="hui-field-left">',
					'<%=this.findHtml(">[xrole=title]")%>',
				'</div>',
				'<div class="hui-field-right">',
					'<%=this.findHtml(">[xrole=content]")%>',
				'</div>',
			'</div>'
		],
		doConfig       : fDoconfig    //初始化配置
	});
	/**
	 * 初始化配置
	 * @param {Object}oSettings
	 */
	function fDoconfig(oSettings){
		var me=this;
		me.callSuper();
		var title=me.title;
		if($H.isSimple(title)){
			title={
				text:title
			};
		}
		title=$H.extend({
			xtype:'Label',
			xrole:'title'
		},title);
		me.add(title);
		
		//内容
		var content=me.content;
		//默认有空白字符
		if(content==undefined&&!oSettings.items){
			content='&nbsp;';
		}
		//包装文字内容
		if($H.isSimple(content)){
			content=({
				text:content,
				//默认文字域有下划线
				underline:true,
				//有点击函数时默认有右箭头
				hasArrow:true
			})
		}
		if(content){
			me.noPadding=true;
			me.add(content);
		}
	}
	
	return Field;
	
});