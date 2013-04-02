# Flash Uploader (v3) External Interface

目前版本: 3.2

## changelog
#### v3.2
* 修复了非图片文件上传时候的一些问题。
* 增加了文件尺寸的配置项

#### v3.1
* 增加了配置项 enabled, 接口 isEnabled

#### v3.0
* 重构整个上传组件

## Settings (flashvars)


| 名称 | 说明 | 默认值 |
|------|------|--------|
| buttonSkin | 按钮皮肤地址 | null |
| enabled    | 初始化时，是否出于启用状态 | true |
| fileSizeLimitOnTransfer | 数据向服务器端进行传输的字节限制。 文件大小（字节数，下同）超过这个设置的话，不会传往服务器。| 2*1024*1024 (2M) |
| fileSizeLimitOnUserSelect | 开放给用户选择的文件大小限制 <ol><li>会尽量将文件在客户端处理到可以传输的限制之内</li><li>目前只有图片文件有做客户端处理（缩小像素）</li><li>如果处理完后，文件大小仍然大于上传限制(fileSizeLimitOnTransfer)则会触发上传失败事件</li></ol> | 5*1024*1024 (5M) |

<small><del>关于文件尺寸的配置，目前以hardcode的方式写在Flash内部。因为根据v2的使用情况来看，产品线都不需要自己配置文件尺寸。等有需要的时候再考虑增加配置参数。</del> v3.2 中增加了文件尺寸的配置。 </small>

## API (methods)

1. disable
    说明：禁用上传组件的GUI，此时按钮呈不可用状态，用户无法通过点击按钮选择文件。

        uploader.disable();

2. enable
    说明：启用上传组件的GUI。此时用户可以点击按钮并选择文件

        uploader.enable();

2. isEnabled
    说明：返回UI是否处于启用状态

3. enableMultiple
    说明：允许用户一次选择多个文件

3. disableMultiple
    说明：调用这个方法后，用户一次只能选择1个文件

3. isMultiple
    说明：返回当前用户目前是否可以选择多个文件

3. setParallelUploadCount
    说明：设置并发传输的文件数量控制。

        //禁止并发，每个文件都会在上一个文件处理完毕后才进行处理
        uploader.setParallelUploadCount(0);

        //在uploader3.1+后，效果等同于设置成0，即禁止并发
        uploader.setParallelUploadCount(1);

        //允许同时处理3个文件
        uploader.setParallelUploadCount(3);

    并发传输带来速度上的优势，可以节约客户上传文件的等待时间。但是也需要后端能应对并发带来的风险。


3. getParallelUploadCount
    说明：返回并发传输的数量限制

3. getFileStatus
    说明：获取某个文件的状态
        
        var id = "file1";
        uploader.getFileStatus( id ); // 返回id为file1的文件的状态

        //返回
        {
            id: "file1",
            name: "screenshot.png",
            size: 340345,
            status: "done",
            finished: true,
            failed: false,
            msg: "upload accepeted!"
        }

    有关文件状态的详细内容，见最后的描述。

4. getFileStatuses
    说明：获取所有文件的状态

        uploader.getFileStatuses();

        //返回
        [{
            id: "file0",
            name: "screenshot.png",
            size: 340345,
            status: "done",
            finished: true,
            failed: false,
            msg: "upload accepeted!"
        },{
            id: "file1",
            name: "bear.png",
            size: 2048345,
            status: "transfering",
            finished: false,
            failed: false,
            msg: 1.68345734         //progress
        }, ...
        ]

    有关文件状态的详细内容，见最后的描述。

5. uploadAll
    说明：上传所有文件

    接口定义：

    ~~~
	public function uploadAll(
        //参数                  默认值             备注
        url:String              = null,          //目标url
        params:Object           = null,          //post变量
        fileFieldName:String    = 'FileData',    //文件字段名称
        identity:String         = 'filename'     //在中国站使用时，使用fname
    ):void
    ~~~

    示例：

    ~~~
    uploader.uploadAll( 'http://picman.china.alibaba.com', { username: 'qhwa' }, 'image', 'fname' )
    ~~~

    在中国站使用时，identity 参数必须使用<span style="color:red; font-weight:bold">fname</span>, 以解决flash播放器上传文件的一个bug.


6. clear
    说明：清空上传队列。默认情况下，每次上传完毕后，原先的上传队列会保留。可以调用该方法清空上传队列。

        uploader.clear();


7. setBrowseFilter
    说明：设置浏览文件的类型过滤

    ~~~actionscript 
    //接口定义：
    public function setBrowseFilter(filter:Array):void 
    ~~~

    filter 数组的元素数据结构如下：

    ~~~
    {
        //description是用户能看到的描述
        description: '图片文件 (jpg,jpeg,gif)', 

        //extensions 是以分号分隔的后缀列表
        extensions: '*.jpg; *.jpeg; *.gif;'
    }
    ~~~

    ~~~
    uploader.setBrowseFilter([
        {  
            description: 'word文件(*.doc; *.docx)',
            extensions: '*.doc; *.docx;'
        },{
            description: '所有文件',
            extensions: '*.*'
        }
    ]);

8. setFileCountLimit
    说明：设置有多少个文件可以选择。多出的文件将会被排除在上传队列之外，文件状态是refused. 

    接口定义：

    ~~~
    public function setFileCountLimit(n:uint):void
    ~~~

    参数n大于0 时，设置最多上传n个文件；参数n为0或null时，取消上传个数的限制

    示例：

    ~~~
    //设置成最上传10个
    uploader.setFileCountLimit(10);

    //取消数量限制
    uploader.setFileCountLimit(null);
    ~~~





## Events

| 事件名称  | 说明 | event对象的属性 |
|-----------|------|-----------|
| browse | 用户点击，弹出文件选择框时触发 | `type` |
| beforeFileSelect | 用户选择了文件之前触发 | `type` |
| fileSelect | 用户选择了文件之后触发 | `type` |
| processStart | 在客户端对文件进行处理，开始后触发 | `type`, `file` |
| processProgress | 在客户端对文件进行处理 | `type`, `file` |
| processFinish | 在客户端对文件处理结束 | `type`, `file` |
| transferStart | 文件开始网络传输 | `type`, `file` |
| transferProgress | 网络传输进度事件 | `type`, `file` |
| transferError | 网络传输发生错误，通常是超时、服务器端返回非HTTP 200响应、连接中断 | `type`, `file` |
| transferComplete | 网络上行传输完毕 | `type`, `file` |
| transferCompleteData | 网络下行传输完毕，已收到服务器响应 | `type`, `file` |
| finish | 所有文件都处理完毕。队列中已经不存在需要处理的文件。| `type` |

`file`是一个FileInfo结构，具体结构如下

## FileInfo

### 数据结构

    {
        id: "file9",
        name: "screenshot.png",
        size: 340345,
        status: "done",
        finished: true,
        failed: false,
        msg: "upload accepeted!"
    }

### status 和 msg

    'refused'           /** 已被客户端检测到不符合上传条件，处于被拒绝状态 **/
    'ready'             /** 准备被处理 */
    'cs_processing'     /** 正在客户端处理文件 **/
    'cs_processed'      /** 已经完成文件在客户端的处理 **/
    'not_transfered'    /** 不符合上传条件,没有传输到服务器  */
    'transfering'       /** 正传往服务器 */
    'transfer_fail'     /** 传输过程中发生失败 **/
    'transfer_canceled' /** 传输过程中被取消 **/
    'transfered'        /** 已传至服务器，等待服务器返回结果 **/
    'done'              /** 上传成功，服务器端返回正确接收的响应 **/

| status            |  msg  含义 |
|-------------------|------------|
|refused            |  不符合上传条件的原因 |
|ready              | N/A |
|csProcessing       |  进度(0-1的数值) |
|csProcessed        | N/A |
|notTransfered      | 通过客户端处理但是为被上传的原因，目前只有 `"COMPRESS_FAIL"` |
|transfering        |  进度(0-1的数值) |
|transferFail       | 上传出错的原因日志 |
|transferCanceled   | N/A |
|transfered         | N/A |
|done               | 服务器返回的response|

### 一些潜规则记录
| 图片类型          |   定义    |  是否压缩 |
|-------------------|-----------|-----------|
|普通图片           |  <2M |不压缩，直接上传，交由后台压缩|
|需要压缩的图片     | 2M<X<5M |客户端压缩到2M以内，再上传|
|超长图片           |  1.jpg格式；2.像素高度<8000;3.高宽比例>2;4.图片最佳宽度是724px，因为Detail页面宽度为724px |不压缩，直接上传|

图片压缩后，后台会生成一个缩略图和"原图",缩略图大小在100*100以内,"原图"大小在1024*1024以内。
