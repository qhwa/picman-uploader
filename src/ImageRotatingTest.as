package 
{
	import cn.alibaba.product.uploader.core.File;
	import cn.alibaba.common.image.LocalImageLoader;
    import cn.alibaba.common.image.jpeg.JPGEncoderIMP;
	import cn.alibaba.util.BitmapDataUtil;
	import flash.display.*;
	import flash.events.*;
	import flash.utils.*;

	public class ImageRotatingTest extends Sprite
	{
		private var _file:File;
		private var _loader:LocalImageLoader;
		private var _src:BitmapData;
		private var _rot:uint = 45;

		public function ImageRotatingTest()
		{
			_loader = new LocalImageLoader;
			_loader.x = _loader.y = 200;
			addChild(_loader);

			stage.addEventListener('click', onClick);
			_loader.addEventListener('content_ready', onLoaded);
			//addEventListener(Event.ENTER_FRAME, rotate);
		}

		private function onClick(evt:Event):void
		{
			_loader.browse();
		}

		private function onLoaded(evt:Event):void
		{
			var bmp:Bitmap = _loader.content as Bitmap;
			_src = bmp.bitmapData.clone();

			var bmpd:BitmapData = BitmapDataUtil.rotate( _src.clone(), _rot );
			var encoder:JPGEncoderIMP = new JPGEncoderIMP(93);
			encoder.addEventListener( Event.COMPLETE, onEncoded);
			encoder.encodeAsync( bmpd );

		}

		private function onEncoded(evt:Event):void
		{
			var loader:Loader = new Loader;
			loader.loadBytes( evt.target.ba );
			addChild(loader);
		}

		private function rotate(evt:Event=null):void
		{
			if(_src){
				var bmpd:BitmapData = BitmapDataUtil.rotate( _src.clone(), _rot );
				(_loader.content as Bitmap).bitmapData = bmpd;
				_rot ++;
			}
		}
		
		
		
	}


}
