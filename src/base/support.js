/**
 * 支持类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
HANDY.add('Support',function($){
	
	var Support={
	}
	
	//解决IE6下css背景图不缓存bug
	if($.Browser.ie()==6){   
	    try{   
	        DOC.execCommand("BackgroundImageCache", false, true);   
	    }catch(e){}   
	}  
	
	return Support;
	
},['Browser'])