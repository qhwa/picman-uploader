jQuery.namespace('Picman.FlashUploader');

(function($, window, PF, undefined){

    var dfd = new $.Deferred();

    function initUploader(container) {
        var cont = $(container || '.picman-flash-uploader:first');
        $.use('ui-flash', function(){
            if($.util.flash.version.major < 10){
                dfd.reject();
            } else { 
                showFlash( cont );
            }
        });

        return dfd;
    }

    function showFlash(container) {
        var cont = $(container);
        if(!cont.attr('id')) {
            cont.attr('id', 'id' + $.guid++);
        }
        
        var uploader = cont.flash({
            swf               : cont.data('config-swf'),
            width             : '100%',
            height            : '100%',
            allowScriptAccess : 'always',
            flashvars : {
                eventHandler  : 'jQuery.util.flash.triggerHandler',
                swfid         : cont.attr('id'),
                debug         : cont.data('debug')
            }
        });

        PF.instance = uploader;
        initEventBindings(uploader);
    }

    function initEventBindings(uploader) {

        uploader.bind('swfReady', function(){
            dfd.resolve(getFlash());
        });

        /**
        * 用户点击了上传按钮,触发此事件
        */
        uploader.bind('clickUploadBtn', uploadAllFiles);

        /**
        * 图片已经上传到服务器，并收到服务器返回的数据
        * 对返回数据在这里进行处理，判断上传是否成功
        * 若上传不成功，需要更新错误提示
        */
        uploader.bind('transferCompleteData', checkFileByResponse );
            
        /**
        * 图片经过客户端处理后，没有被传输到服务器
        * 原因是处理完后，图片仍然没有达到限定的字节数之内
        * 因此传输取消
        */
        uploader.bind('transferAbort', function(evt, o){
            var file = o.file;
            updateFileMsg( file, getErrorMsg(file.msg) );
        });

        /**
        * 传输失败事件的处理，
        * 因为各种原因，网络传输有可能失败
        */
        uploader.bind('transferError', function(evt, o){
            updateFileMsg( o.file, getErrorMsg() );
        });
    }

    function getFlash() {
        return PF.instance.flash('getFlash');
    }

    function uploadAllFiles() {
        var swf = getFlash();
        var o = PF.getUploadParams(swf);
        swf.uploadAll( o.url, o.params, o.fieldName, o.identity || 'fname');
    }

    function getUploadParams(swf){
        return {
            url           : 'http://localhost:4567/random',
            params : {
                watermark : swf.shouldAddWatermark()
            },
            fieldName : 'FileData',
            identity  : 'fname'
        };
    }
    
    function checkFileByResponse(evt, o){
        var file = o.file;
        var ret = getResultFromResponse( file.msg );
        var swf = getFlash();
        if(ret.success){
            swf.destroyFile( file.id );
            swf.updateFileList();
        } else {
            updateFileStatus( file.id, 'transfer_fail', ret.msg );

            // 当相册空间已满，剩下的图片都不再上传
            if( ret.err == 'maxImageSpaceExceed' || ret.err == 'maxImgPerAlbumExceeded' ){
                swf.dropRemainingFiles( ret.msg );
            }
        }
    }

    function getResultFromResponse( res ) {
        var obj={}, success, msg;

        try { obj = $.parseJSON(res); }
        catch(e) {}

        success = (obj.result === 'success');
        if( !success ){
            msg = getErrorMsg( obj.msg ); 
        }

        return { success: success, msg: msg, err: obj.msg };
    }

    function getErrorMsg( errCode ) {
        var map = {
            'COMPRESS_FAIL' : '无法压缩到2MB以内，请缩小后再上传',
            'notLogin'      : '您还未登录，无法上传图片！',
            'imgTooBig'     : '图片因大于2MB，无法上传!',
            'imgTypeErr'    : '图片格式不对，系统支持 jpg, jpeg, png, gif, bmp',
            'maxImageSpaceExceed'    : '相册总空间已满',
            'maxImgPerAlbumExceeded' : '目标相册已满，请更换上传相册继续上传'
        };
        
        return map[errCode] || '网络繁忙或其他原因，暂时无法上传，请稍后再试！';
    }

    function updateFileStatus( id, stt, msg ) {
        getFlash().updateFileStatus( id, stt, msg );
    }

    function updateFileMsg( file, msg ) {
        updateFileStatus( file.id, file.status, msg );
    }

    // ####################
    //       APIS          
    // ####################
    $.extend(PF, {
        /**
         * 初始化
         */
        initUploader    : initUploader,

        /**
         * 指定上传的目标和参数
         */
        getUploadParams : getUploadParams,

        /**
         * 获取Flash对象
         */
        getFlash        : getFlash
    });

})(jQuery, window, Picman.FlashUploader);
