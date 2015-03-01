/**
 * 图片压缩类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */
//"handy.util.ImgCompress"
define('U.ImgCompress',
[
'L.Browser',
'B.Object',
'B.Class'
],
function(Browser,Obj,Class){
	
	var ImgCompress=Class.createClass();
	
	Obj.extend(ImgCompress,{
		compress         : fCompress        //压缩
	});
	
	/**
	 * 
	 */
	function _fDrawImageIOSFix(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh) {
		//TODO iphone 4s 可能需要检测
		//ios6不需要检测，因为使用了megapix-image
		var nVertSquashRatio = 0&&Browser.ios()==7?detectVerticalSquash(img):1;
		var aArgs=arguments;
		var nLen = aArgs.length;
		switch (nLen) {
			case 4 :
				ctx.drawImage(img, aArgs[2], aArgs[3]/ nVertSquashRatio);
				break
			case 6 :
				ctx.drawImage(img, aArgs[2], aArgs[3], aArgs[4],aArgs[5] / nVertSquashRatio);
				break
			case 8 :
				ctx.drawImage(img, aArgs[2], aArgs[3], aArgs[4],aArgs[5], aArgs[6], aArgs[7]/ nVertSquashRatio);
				break
			case 10 :
				ctx.drawImage(img, aArgs[2], aArgs[3], aArgs[4],aArgs[5], aArgs[6], aArgs[7], aArgs[8],aArgs[9] / nVertSquashRatio);
				break
		}
		 // Detects vertical squash in loaded image.
		// Fixes a bug which squash image vertically while drawing into canvas
		// for some images.
		// This is a bug in iOS6 (and IOS7) devices. This function from
		// https://github.com/stomita/ios-imagefile-megapixel
		function detectVerticalSquash(img) {
			var iw = img.naturalWidth, ih = img.naturalHeight
			var canvas = document.createElement("canvas")
			canvas.width = 1
			canvas.height = ih
			var ctx = canvas.getContext('2d')
			ctx.drawImage(img, 0, 0)
			var data = ctx.getImageData(0, 0, 1, ih).data
			// search image edge pixel position in case it is squashed
			// vertically.
			var sy = 0, ey = ih, py = ih
			while (py > sy) {
				var alpha = data[(py - 1) * 4 + 3]
				if (alpha === 0) {
					ey = py
				} else {
					sy = py
				}
				py = (ey + sy) >> 1
			}
			var ratio = (py / ih)
			return (ratio === 0) ? 1 : ratio
		}
	}
	/**
	 * 压缩
	 * 
	 * @param {object|string}image
	 *            参数图片，可以是File对象、base64图片字符串，URL.createObjectURL的对象
	 *            (PS:ios6下不能使用ObjectURL对象，因为会使exif读取失败)，或者其他可以设置在img.src上的对象
	 * @param {object}oOptions
	 *            选项{ {number=}width:压缩后图片宽度，不传表示使用原图的宽度，优先级高于maxWidth
	 *            {number=}height:压缩后图片高度，不传表示使用原图的高度，优先级高于maxHeight，宽度和高度如果只提供一个则另一个根据实际尺寸等比例计算得出
	 *            {number=}maxWidth:压缩后最大宽度 {number=}maxHeight:压缩后最大高度
	 *            {number=}cropX:裁剪图片的起始横坐标 {number=}cropY:裁剪图片的起始纵坐标
	 *            {number=}cropW:裁剪图片的宽度 {number=}cropH:裁剪图片的高度
	 *            {number=}quality:压缩率，默认是0.5
	 *            {function({object})}success:回调函数，参数说明:{
	 *            {object|string}orig:原图对象 {string}base64:压缩后的base64字符串
	 *            {string}clearBase64:去除data前缀的压缩后的base64字符串 } }
	 */
	function fCompress(image,oOptions){
		if(!image){
			return;
		}
		var oImgSrc=image;
		if(typeof File!=='undefined'&&image instanceof File){
			var oURL = window.URL || window.webkitURL;
			oImgSrc = oURL.createObjectURL(image);
		}
		var oImg = new Image();
            oImg.src = oImgSrc;
           
        var bIOSFix=Browser.ios()<7;
        var bAndroidEncoder=Browser.android();
        
        oImg.onload = function () {
        	//获取图片exif信息，判断图片方向
            var aRequires=[];
            //修复ios6、7图片扭曲压缩问题
            if(bIOSFix){
            	aRequires.push('handyRoot/lib/megapix-image.js');
            }
            //Android下能顺利截图，不需要处理图片方向问题，引入exif还会导致应用崩溃，重新刷新
            var bNeedExif=Browser.ios();
            //读取照片方向
            if(bNeedExif){
            	aRequires.push('handyRoot/lib/exif.js');
            }
            //修复Android图片压缩问题
            if(bAndroidEncoder){
            	aRequires.push('handyRoot/lib/jpeg_encoder_basic.js');
            }
            require(aRequires,function(){
            	if(bNeedExif){
		        	EXIF.getData(image, function() {
			            var nOrientation=EXIF.getTag(this,'Orientation');
			            _fComp(nOrientation);
			        });
            	}else{
            		_fComp();
            	}
            })
        }
        
        function _fComp(nOrientation){
        	nOrientation=nOrientation||1;
        	// 生成比例
            var w = oImg.width,
                h = oImg.height,
                nImgW=w,
                nImgH=h,
                bCrop=oOptions.cropX!==undefined,
                nMaxW=oOptions.maxWidth,
                nMaxH=oOptions.maxHeight,
                nSettingW=oOptions.width,
                nSettingH=oOptions.height;
            var _fCeil=Math.ceil;
            //修正图片尺寸
            var _fFixSize=function(w,h){
                var scale = w / h;
	            if(nSettingW){
	            	w=nSettingW;
	            	if(!nSettingH){
			            h = w / scale;
	            	}
	            }else if(w>nMaxW){
	            	w=nMaxW;
	            	h = w / scale;
	            }
	            
	            if(nSettingH){
	            	h=nSettingH;
	            	if(!nSettingW){
		            	w=h*scale;
	            	}
	            }else if(h>nMaxH){
	            	h=nMaxH;
	            	w=h*scale;
	            }
	            return {
	            	w:_fCeil(w),
	            	h:_fCeil(h)
	            }
            }
            
            // 生成canvas
            var oCanvas = document.createElement('canvas');
            var oCtx = oCanvas.getContext('2d');
        	var nCropW=oOptions.cropW;
        	var nCropH=oOptions.cropH;
        	var nCropX=oOptions.cropX;
        	var nCropY=oOptions.cropY;
        	//绘制起始坐标
        	var x=0;
        	var y=0;
        	
    		// 根据exif中照片的旋转信息对图片进行旋转
			//MegaPixImage可以传入Orientation，因此这里不需要额外处理
			var _fRotateIf=function(){
			    if(!bIOSFix||!bCrop){
			    	var tmp;
					if (nOrientation === 6 || nOrientation === 8) {
						if (!bCrop) {
							tmp=h;
							h=w;
							w=tmp;
						}else{
							tmp = nCropH;
							nCropH = nCropW;
							nCropW = tmp;
						}
					}
			    	oCanvas.width = w;
					oCanvas.height = h;
			    }
				var nRotation,tmp;
				if(!bIOSFix){
		        	switch (nOrientation) { 
						case 3 :
							//截图要转换坐标
							if(bCrop){
								nCropX=nImgW-nCropX-nCropW;
								nCropY=nImgH-nCropY-nCropH;
							}
							nRotation = 180;
							x=-w;
							y=-h;
							break;
						case 6 :
							//截图要转换坐标
							if(bCrop){
								tmp=nCropX;
								nCropX=nCropY;
								nCropY=nImgH-tmp-nCropH;
								tmp=h;
								h=w;
								w=tmp;
							}
							nRotation = 90;
							y=-h;
							break;
						case 8 :
							//截图要转换坐标
							if(bCrop){
								tmp=nCropY;
								nCropY=nCropX;
								nCropX=nImgW-tmp-nCropW;
								tmp=h;
								h=w;
								w=tmp;
							}
							nRotation = 270;
							x=-w;
							break;
						default :
							nRotation = 0;
					}
					if(nRotation){
						oCtx.rotate(nRotation*Math.PI/180);
					}
				}
			}
		    
            //drawImage参数图文详解:http://jingyan.baidu.com/article/ed15cb1b2e642a1be369813e.html
            //需要裁剪
            if(bCrop){
            	var oSize=_fFixSize(nCropW,nCropH);
            	if(bIOSFix){
            		//需要第三方库修正图片，canvas先绘制原图，等修正后再进行截取
            		nCropW=oSize.w;
            		nCropH=oSize.h;
            		var nCropScale=nCropW/oOptions.cropW;
            		if(nCropScale!=1){
            			w=_fCeil(w*nCropScale);
            			nCropX=_fCeil(nCropX*nCropScale);
            		}
            		nCropScale=nCropH/oOptions.cropH;
            		if(nCropScale!=1){
            			h=_fCeil(h*nCropScale);
            			nCropY=_fCeil(nCropY*nCropScale);
            		}
            		//iphone4s的ios7.04下最大约w=2560,h=1920;超过会无法绘图
            		_fDrawImageIOSFix(oCtx,oImg, x, y , w, h);
            	}else{
	            	w=oSize.w;
	            	h=oSize.h;
	            	_fRotateIf();
	            	_fDrawImageIOSFix(oCtx,oImg,nCropX,nCropY,nCropW,nCropH,x,y,w,h);
            	}
            }else{
            	var oSize=_fFixSize(w,h);
            	w=oSize.w;
            	h=oSize.h;
            	_fRotateIf();
	            _fDrawImageIOSFix(oCtx,oImg, x, y,w,h);
            }
//			alert(bIOSFix+";"+nOrientation+";"+nImgW+";"+nImgH+"\n"+x+";"+y+";"+w+";"+h+";"+"\n"+nCropX+';'+nCropY+';'+nCropW+';'+nCropH)
			
            //图片背景如果是透明的，默认保存成base64会变成黑色的，这里把白色图片跟原图合并，这样保存后透明背景就变成指定颜色(#ffffff)的了
			oCtx.globalCompositeOperation = "destination-over";
			oCtx.fillStyle = '#ffffff';
			oCtx.fillRect(0,0,w,h);
            
            var nQuality=oOptions.quality||0.5;
			var base64;

            // 修复IOS
            if(bIOSFix) {
                var mpImg = new MegaPixImage(oImg);
                mpImg.render(oCanvas, { maxWidth: w, maxHeight: h, quality: nQuality, orientation: nOrientation });
                if(bCrop){
                	var oData=oCtx.getImageData(nCropX,nCropY,nCropW,nCropH);
                	oCanvas.width = nCropW;
                	oCanvas.height = nCropH;
                	oCtx.putImageData(oData,0,0);
                }
                base64 = oCanvas.toDataURL('image/jpeg', nQuality);
            }else if(bAndroidEncoder) {
	            // 修复android
                var encoder = new JPEGEncoder();
                base64 = encoder.encode(oCtx.getImageData(0,0,w,h), nQuality * 100 );
            }else{
				//生成base64
	            base64 = oCanvas.toDataURL('image/jpeg', nQuality );
            }

            // 生成结果
            //TODO 节省内存
            var oResult = {
                orig : image,
                base64 : base64,
                //去除data前缀的数据
                clearBase64 : base64.substr( base64.indexOf(',') + 1 )
            };
            
            oOptions&&oOptions.success&&oOptions.success(oResult);
        }
            
	}
	
	return ImgCompress;
	
});