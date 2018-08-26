{
    let view = {
        el: '.upload',
        template: `<div id="dragArea" class="dragArea">请选择文件或将文件拖拽到此区域进行上传</div>
        <div id="uploadBtn" class="uploadBtn">选择文件</div>`,

        render(data) {
            $(this.el).html(this.template);
        },
        active(){
            $(this.el).addClass('active');
        },
        deactive(){
            $(this.el).removeClass('active');
        },
    };

    let model = {
        data: {}
    };

    let controller = {
        view: null,
        model: null,

        init(view, model) {
            this.view = view;
            this.model = model;

            this.view.render(this.model.data);
            this.bindEventhub();
            this.upload();
        },

        bindEventhub() {
            window.eventHub.on('add', () => {
                this.view.active();
            });
            window.eventHub.on('new',()=>{
                this.view.deactive();
            })
        },

        upload() {
            let upload = Qiniu.uploader({
                disable_statistics_report: false,
                runtimes: 'html5',
                browse_button: 'uploadBtn',
                uptoken_url: 'http://localhost:8001/uptoken',
                get_new_uptoken: false,
                domain: 'http://pe20rmk2n.bkt.clouddn.com',
                container: 'dragArea',
                max_file_size: '8mb',
                max_retries: 1,
                dragdrop: true,
                drop_element: 'dragArea',
                auto_start: true,
                init: {
                    'FilesAdded': function (up, files) {
                        plupload.each(files, function (file) {
                            // 文件添加进队列后,处理相关的事情
                        });
                    },
                    'BeforeUpload': function (up, file) {
                        // 每个文件上传前,处理相关的事情
                    },
                    'UploadProgress': function (up, file) {
                        // 每个文件上传时,处理相关的事情
                    },
                    'FileUploaded': function (up, file, infomation) {
                        // 每个文件上传成功后,处理相关的事情
                        // 其中 info.response 是文件上传成功后，服务端返回的json，形式如
                        // {
                        //    "hash": "Fh8xVqod2MQ1mocfI4S4KpRL6D98",
                        //    "key": "gogopher.jpg"
                        //  }
                        var domain = up.getOption('domain');
                        var response = JSON.parse(infomation.response);
                        let name = response.key;
                        var url = domain + '/' + encodeURIComponent(response.key);
                        let data = { 'name': name, 'url': url };
                        window.eventHub.emit('new', data);  //new事件，上传文件完毕
                    },
                    'Error': function (up, err, errTip) {
                        //上传出错时,处理相关的事情
                    },
                    'UploadComplete': function () {
                        //队列文件处理完毕后,处理相关的事情
                    },
                }
            });
        },

    };

    controller.init(view, model);
}
