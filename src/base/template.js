/**
 * 模板类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
HANDY.add('Template',function($){
	
	var Template={
		simpleReg       : /<%=this\.([^%>]+)%>/g,  //简单替换正则
		compile         : fCompile //执行模板
	};
	
	/**
	 * 执行模板
	 * @method compile
	 * @param  {string}sTemplate 模板字符串
	 * @param  {Object}oData     	数据
	 * @return {string}          返回结果字符串
	 */
	function fCompile(sTemplate,oData){
		var oReg=this.simpleReg;
		return sTemplate.replace(oReg,function(){
			return oData&&oData[arguments[1]]||'';
		});
	}
	
	return Template;
	
});