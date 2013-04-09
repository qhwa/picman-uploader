jQuery.namespace('Picman.FlashUploader');

(function($, window, PF, undefined){

    var dfd = new $.Deferred();
    var succ = [], lastAlbum;

    // ####################
    //       APIS          
    // ####################
    $.extend(PF, {
        /**
         * ��ʼ��
         */
        initUploader    : initUploader,

        /**
         * ָ���ϴ���Ŀ��Ͳ���
         */
        getUploadParams : getUploadParams,

        /**
         * ����һ�η��������ص����ݣ����ش����Ľ��
         */
        getResultFromResponse : getResultFromResponse,

        /**
         * ��ȡFlash����
         */
        getFlash        : getFlash,

        msgs: {
            'COMPRESS_FAIL' : '�޷�ѹ����2MB���ڣ�����С�����ϴ�',
            'notLogin'      : '����δ��¼���޷��ϴ�ͼƬ��',
            'imgTooBig'     : 'ͼƬ�����2MB���޷��ϴ�!',
            'imgTypeErr'    : 'ͼƬ��ʽ���ԣ�ϵͳ֧�� jpg, jpeg, png, gif, bmp',
            'maxImageSpaceExceed'    : '����ܿռ�����',
            'maxImgPerAlbumExceeded' : 'Ŀ�����������������ϴ��������ϴ�',
            'unknown'       : '���緱æ������ԭ����ʱ�޷��ϴ������Ժ����ԣ�'
        },

        succ: succ,

        setTargetAlbum: setTargetAlbum,

        markFileAsSuccessful : markFileAsSuccessful,

        _flashEventTrigger : flashEventTrigger
    });

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
            wmode             : 'opaque',
            flashvars : {
                eventHandler  : 'Picman.FlashUploader._flashEventTrigger',
                swfid         : cont.attr('id'),
                debug         : cont.data('config-debug')
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
        * �û�������ϴ���ť,�������¼�
        */
        uploader.bind('clickUploadBtn', uploadAllFiles);

        /**
        * ͼƬ�Ѿ��ϴ��������������յ����������ص�����
        * �Է���������������д����ж��ϴ��Ƿ�ɹ�
        * ���ϴ����ɹ�����Ҫ���´�����ʾ
        */
        uploader.bind('transferCompleteData', checkFileByResponse );
            
        /**
        * ͼƬ�����ͻ��˴����û�б����䵽������
        * ԭ���Ǵ������ͼƬ��Ȼû�дﵽ�޶����ֽ���֮��
        * ��˴���ȡ��
        */
        uploader.bind('transferAbort', function(evt, o){
            var file = o.file;
            updateFileMsg( file, getErrorMsg(file.msg) );
        });

        /**
        * ����ʧ���¼��Ĵ���
        * ��Ϊ����ԭ�����紫���п���ʧ��
        */
        uploader.bind('transferError', function(evt, o){
            updateFileMsg( o.file, getErrorMsg() );
        });
    }

    function getFlash() {
        return PF.instance.flash('getFlash');
    }

    function uploadAllFiles() {
        succ.length = 0;
        var swf = getFlash();
        var o = PF.getUploadParams(swf);
        swf.uploadAll( o.url, o.params, o.fieldName, o.identity || 'fname');
    }

    function getUploadParams(swf){
        return {
            url       : 'http://localhost:4567/random',
            params : {
                watermark : swf.shouldAddWatermark()
            },
            fieldName : 'FileData',
            identity  : 'fname'
        };
    }
    
    function checkFileByResponse(evt, o) {
        var file = o.file;
        var ret = PF.getResultFromResponse( file.msg );
        var swf = getFlash();
        if(ret.success){

            PF.markFileAsSuccessful( file.id );
        } else {
            updateFileStatus( file.id, 'transfer_fail', ret.msg );

            // �����ռ�������ʣ�µ�ͼƬ�������ϴ�
            if( ret.err == 'maxImageSpaceExceed' || ret.err == 'maxImgPerAlbumExceeded' ) {
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
        var msgs = PF.msgs;
        return msgs[errCode] || msgs['unknown'];
    }

    function setTargetAlbum( album ) {
        var last = {id:lastAlbum.id, remain:lastAlbum.remain};
        lastAlbum = album;

        if( last.id != lastAlbum.id ) {
            succ.length = 0;
        }
        getFlash().setTargetAlbum(album);
    }

    function markFileAsSuccessful( id ) {
        var swf = getFlash();
        succ.push( id );
        swf.destroyFile( id );
        swf.updateFileList();
    }

    function updateFileStatus( id, stt, msg ) {
        getFlash().updateFileStatus( id, stt, msg );
    }

    function updateFileMsg( file, msg ) {
        updateFileStatus( file.id, file.status, msg );
    }

    function flashEventTrigger(evt) {
        jQuery.util.flash.triggerHandler.apply(null, arguments);
    }

})(jQuery, window, Picman.FlashUploader);
