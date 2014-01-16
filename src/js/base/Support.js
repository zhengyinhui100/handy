/**
 * 支持类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
handy.add('Support',function($H){
	
	var Support={
	}
	
	//解决IE6下css背景图不缓存bug
	if($H.Browser.ie()==6){   
	    try{   
	        document.execCommand("BackgroundImageCache", false, true);   
	    }catch(e){}   
	}  
	
	return Support;
	
})