{
    let view = {
        el: '.upload',
        template: `<div id="dragArea" class="dragArea">请选择文件或将文件拖拽到此区域进行上传</div>
        <div id="uploadBtn" class="uploadBtn">选择文件</div>`,
        render(data) {
            $(this.el).html(this.template);
        },
        active() {
            $(this.el).addClass('active');
        },
        deactive() {
            $(this.el).removeClass('active');
        }
    };

    let model = {
        data: {
            songs: [],
            selectId: null
        }
    };

    let controller = {
        view: null,
        model: null,
        init(view, model) {
            this.view = view;
            this.model = model;
            this.view.render(this.model.data);
            this.bindEventHub();
            this.upload();
        },
        bindEventHub() {
            window.eventHub.on('click-add', () => {
                this.view.active();
            });
            window.eventHub.on('upload-done',()=>{
                this.view.deactive();
            });
            window.eventHub.on('click-songlist',()=>{
                this.view.deactive();
            })
        },
        upload() {
            var uploader = Qiniu.uploader({
                runtimes: 'html5',
                browse_button: 'uploadBtn',         
                uptoken_url: 'http://localhost:8001/uptoken', 
                get_new_uptoken: false, 
                domain: 'pe20rmk2n.bkt.clouddn.com', 
                container: 'dragArea', 
                max_file_size: '10mb', 
                max_retries: 1,
                dragdrop: true, 
                drop_element: 'dragArea', 
                auto_start: true,
                init: {
                    'FilesAdded': function (up, files) {
                        plupload.each(files, function (file) {
                            // 文件添加进队列后，处理相关的事情
                        });
                    },
                    'BeforeUpload': function (up, file) {
                        // 每个文件上传前，处理相关的事情
                        window.eventHub.emit('before-upload');
                    },
                    'UploadProgress': function (up, file) {
                        // 每个文件上传时，处理相关的事情
                    },
                    'FileUploaded': function (up, file, infomation) {
                        // 每个文件上传成功后，处理相关的事情
                        var domain = up.getOption('domain');
                        var response = JSON.parse(infomation.response);
                        let url = 'http://'+domain +"/"+ encodeURIComponent(response.key);
                        let name=response.key;
                        let data={songs: [],selectId: null};
                        let song={'name':name,'singer':undefined,'url':url,id:undefined}
                        data.songs.push(song);
                        let obj=JSON.parse(JSON.stringify(data));
                        window.eventHub.emit('upload-done',obj);
                    },
                    'Error': function (up, err, errTip) {
                        //上传出错时，处理相关的事情
                    },
                    'UploadComplete': function () {
                        //队列文件处理完毕后，处理相关的事情
                    },
                }
            });
        }
    };
    controller.init(view, model);
}
