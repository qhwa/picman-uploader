package test
{
	import cn.alibaba.product.uploader.core.File;

	import mockolate.*;
	import mockolate.runner.MockolateRunner;
	import org.hamcrest.collection.array;
	
	import org.flexunit.Assert;
	import org.flexunit.async.Async;
	
	MockolateRunner;

	[RunWith("mockolate.runner.MockolateRunner")]
	public class PreviewStatusTest
	{

		private var uper:PicmanUploader;

		[Before]
		public function setup():void
		{
			uper = new PicmanUploader;
			uper.initApp();
		}

		[Test]
		public function queueLengthIsZeroByDefault():void
		{
			Assert.assertEquals( uper.files.length, 0 );
		}

		[Test]
		public function canAddImageFileIntoQueue():void
		{
			var file:File = addFile();
			Assert.assertEquals( 1, uper.files.length );
		}

		[Test]
		public function canRemoveFileFromQueue():void
		{
			var file:File = addFile();
			var ret:File = uper.rmFile( file );
			
			Assert.assertEquals( file, ret );
			Assert.assertEquals( 0, uper.files.length );
		}

		[Test]
		public function canPreviewThumbnails():void
		{
			addFile();
			uper.previewBeforeUpload();
		}

		[Test]
		public function canRotateImage():void
		{
			var file:File = addFile();
			uper.rotate( file.id );

			Assert.assertEquals( uper.getRotation( file.id ), '90' );
		}
		

		private function addFile():File
		{
			var file:File = makeTestFile( 'test.jpg' );
			uper.addFile( file );
			return file;
		}

		private function makeTestFile( name:String, data:* = null ):File
		{
			return new File( name, data );
		}
		
		
		
		
		
	}
}
