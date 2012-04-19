jQuery(function($){

    var uploader;

    function initUploader(container, swf) {
        if($.util.flash.version.major < 10){
            showFlashUpgradeMsg();
        } else { 
            swf = swf ||  'flash/picman-uploader.swf?v=2012041801'
            var cont = $(container).empty();
            uploader = cont.flash({
                swf               : swf,
                width             : '100%',
                height            : '100%',
                allowScriptAccess : 'always',
                flashvars : {
                    eventHandler  : 'jQuery.util.flash.triggerHandler',
                    swfid         : 'flash-alt',
                    debug         : true
                }
            });

            initEventBindings();
        }
    }

    function showFlashUpgradeMsg(container) {
        $('.upgrade-msg', container).show();
    }

    function initEventBindings() {

        uploader.bind('swfReady', function(){
            var swf = getFlash();
            swf.setRequestCharset( 'utf-8' );
            swf.setResponseCharset( 'utf-8' );
            swf.setTargetAlbum({id: -1, remain:10});
        });

        uploader.bind('setWatermark', function(){
            alert('TODO: 设置水印');
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

        /**
        * 所有文件都已经传输完毕
        * 有些文件的状态变化没有对应的事件，可以在这里统一处理
        */
        uploader.bind('finish', function(evt, o){});

        uploader.bind('skipToNextStep', function(evt, o){
            alert('TODO: skip to next step');
        });
    }

    function getFlash() {
        return uploader.flash('getFlash');
    }

    function uploadAllFiles() {
        var swf = getFlash();
        swf.uploadAll(
            'http://localhost:4567/random', {
                watermark: swf.shouldAddWatermark()
            }, 
            'FileData',  // 数据字段名称, 'imgFile' for ibank
            'fname'      // 如非必要,不要修改
        );
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

    window.initUploader = initUploader;

});
