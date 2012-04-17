package 
{
	import cn.alibaba.product.uploader.core.File;
	import cn.alibaba.common.image.LocalImageLoader;
    import cn.alibaba.common.image.jpeg.JPGEncoderIMP;
    import cn.alibaba.common.image.HugeBitmapDataBuilder;
	import cn.alibaba.util.BitmapDataUtil;
	import flash.display.*;
	import flash.events.*;
	import flash.utils.*;

	public class BuildHugeBitmapDataTest extends Sprite
	{
		private var _loader:LocalImageLoader;

		public function BuildHugeBitmapDataTest()
		{
			var builder:HugeBitmapDataBuilder = new HugeBitmapDataBuilder();
			builder.addEventListener(Event.COMPLETE, onBuildComplete);
			builder.build(10000, 1000, true, 0xFFFF0000)
		}

		private function onBuildComplete( evt:Event):void
		{
			trace('--------------');
			var builder:HugeBitmapDataBuilder = evt.target as HugeBitmapDataBuilder;
			var img:Bitmap = new Bitmap();
			img.bitmapData = builder.output;
			addChild(img);

			builder.dispose();
		}
		

	}


}
