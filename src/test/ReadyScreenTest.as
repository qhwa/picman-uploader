package test
{
	import mockolate.*;
	import mockolate.runner.MockolateRunner;
	import org.hamcrest.collection.array;
	
	import org.flexunit.Assert;
	import org.flexunit.async.Async;
	
	MockolateRunner;

	[RunWith("mockolate.runner.MockolateRunner")]
	public class ReadyScreenTest
	{
		private var uper:PicmanUploader;

		[Before]
		public function setup():void
		{
			uper = new PicmanUploader;
			uper.initApp();
			uper.state = 'ready';
		}

		[Test]
		public function uninteractive_by_default():void
		{
			Assert.assertFalse( uper.canSelectFile() );
		}

		[Test]
		public function uninteractive_if_disabled():void
		{
			uper.disableUI();
			Assert.assertFalse( uper.canSelectFile() );
		}

		[Test]
		public function uninteractive_if_target_album_is_full():void
		{
			uper.fileCountLimit = 0;
			Assert.assertFalse( uper.canSelectFile() );
		}

		[Test]
		public function interactive_if_target_album_has_space():void
		{
			uper.enableUI();
			uper.fileCountLimit = 10;
			Assert.assertEquals( uper.fileCountLimit, 10 );
			Assert.assertTrue( uper.canSelectFile() );
		}
		

		[Test]
		public function uninteractive_if_no_space_left_ignoring_album():void
		{
			uper.disableUI();
			uper.fileCountLimit = 10;
			Assert.assertFalse( uper.canSelectFile() );
		}
		
		
		
		
	}


}
