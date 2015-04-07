/**
 * 代码积累
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
(function(){
	
	var doc = document,
    isCSS1 = doc.compatMode == "CSS1Compat",
    MAX = Math.max,     
    ROUND = Math.round,
    PARSEINT = parseInt;
	
	getDocumentHeight: function() {            
	    return MAX(!isCSS1 ? doc.body.scrollHeight : doc.documentElement.scrollHeight, this.getViewportHeight());
	},
	
	getDocumentWidth: function() {            
	    return MAX(!isCSS1 ? doc.body.scrollWidth : doc.documentElement.scrollWidth, this.getViewportWidth());
	},
	
	getViewportHeight: function(){
	    return Ext.isIE ? 
	           (Ext.isStrict ? doc.documentElement.clientHeight : doc.body.clientHeight) :
	           self.innerHeight;
	},
	
	getViewportWidth : function() {
	    return !Ext.isStrict && !Ext.isOpera ? doc.body.clientWidth :
	           Ext.isIE ? doc.documentElement.clientWidth : self.innerWidth;
	},
	
})()