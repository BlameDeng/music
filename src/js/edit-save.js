{
    let view = {
        el: '.edit',
        template: `<p class="editinfo">请编辑歌曲信息</p>
        <form>
            <div class="row"><span>歌曲：</span><input type="text" name="name" value="__name__"></div>
            <div class="row"><span>歌手：</span><input type="text" name="singer" value="__singer__"></div>
            <div class="row"><span>外链：</span><input type="text" name="url" value="__url__"></div>
            <div class="row"><button type="submit" class="submit">保存</button><button type="button" class="change">修改</button><button type="button" class="delete">删除</button></div>
        </form>`,
        render(data) {
            let songs = data.songs;  //对象组成的数组
            songs.map((song) => {
                let { name = '', singer = '', url = '' } = song;
                let html = this.template.replace('__name__', name)
                    .replace('__singer__', singer).replace('__url__', url);
                $(this.el).html(html);
            })
        },
        active() {
            $(this.el).addClass('active');
        },
        deactive() {
            $(this.el).removeClass('active');
        },
        disableSubmit() {
            $(this.el).find(`button[type=submit]`).attr('disabled', true)
                .addClass('disabled');
        }
    };

    let model = {
        data: {
            songs: [],
            selectId: null
        },
        fetch(){
            var query = new AV.Query('Song');
           return query.find().then((responses)=>{  //数组
            responses.forEach(function(response) {
                response.set('status', 1);
              });
              return AV.Object.saveAll(responses);
            }).then((responses)=> {
                // 更新成功
                responses.map((response)=>{
                    let song=response.attributes;
                    song['id']=response.id;
                    this.data.songs.push(song);
                });
              }, function (error) {
                // 异常处理
              });
        },
        save(obj) {
            // 声明类型
            var Song = AV.Object.extend('Song');
            // 新建对象
            var song = new Song();
            // 设置名称
            song.set('name', obj.name);
            song.set('singer', obj.singer);
            song.set('url', obj.url);
            // 设置优先级
            song.set('priority', 1);
            return song.save().then((response) => {
                let obj = response.attributes;
                obj['id'] = response.id;
                this.data.songs.push(obj);  //将回应的数据加到data的songs里
                //这里传数据只应该传这次保存生成的
                let emitdata = { songs: [], selectId: null };
                emitdata.songs.push(obj);
                window.eventHub.emit('save-done', emitdata);
            }, function (error) {
                console.error(error);
            });
        },
        update(data) {
            let songs = data.songs;
            let id = data.selectId;
            // 第一个参数是 className，第二个参数是 objectId
            var song = AV.Object.createWithoutData('Song', id);
            songs.map((item) => {
                let { name, singer, url } = item;
                // 修改属性
                song.set('name', name);
                song.set('singer', singer);
                song.set('url', url);
                // 保存到云端
                song.save();
            })
        },
        delete(data) {
            let deleteId=data.selectId;
            var song = AV.Object.createWithoutData('Song', deleteId);
            return song.destroy().then(function (success) {
                // 删除成功
            }, function (error) {
                // 删除失败
            });
        }
    };

    let controller = {
        view: null,
        model: null,
        init(view, model) {
            this.view = view;
            this.model = model;
            this.model.fetch();
            this.bindEventHub();
            this.bindEvents();
        },
        bindEventHub() {
            window.eventHub.on('click-add', () => {
                this.view.deactive();
            });
            window.eventHub.on('upload-done', (data) => {
                this.view.active();
                this.view.render(data);  //渲染页面
                $(this.view.el).find(`.change`).attr('disabled', true)
                    .addClass('disabled');
            });
            window.eventHub.on('click-songlist', (data) => {
                this.view.active();
                this.model.data.selectId = data.selectId;  //点击歌曲列表，会把当前选中的ID赋值到model的data
                let selectId = data.selectId;
                let songs = this.model.data.songs;
                let selectData = { 'songs': [], 'selectId': null };
                selectData.selectId = selectId;
                songs.map((song) => {
                    if (song.id === selectId) {
                        selectData.songs.push(song);
                    }
                });
                this.view.render(selectData);
                this.view.disableSubmit();
            });
            window.eventHub.on('click-change',()=>{
                this.model.data={songs: [],selectId: null};  //重置数据库
                this.model.fetch();  //更新数据库
            })
        },
        getFormVal(){
            let name = $(this.view.el).find(`input[name=name]`).val();
            let singer = $(this.view.el).find(`input[name=singer]`).val();
            let url = $(this.view.el).find(`input[name=url]`).val();
            return obj = { 'name': name, 'singer': singer, 'url': url };
        },
        bindEvents() {
            $(this.view.el).on('submit', 'form', (e) => {
                e.preventDefault();
                let obj=this.getFormVal();
                this.model.save(obj);
                this.view.render({ songs: [{}] });
            });
            $(this.view.el).on('click', '.change', () => {
                let obj=this.getFormVal();
                let data = { 'songs': [], 'selectId': this.model.data.selectId };
                data.songs.push(obj);
                this.model.update(data);
                this.view.render(data);
                this.view.disableSubmit();
                window.eventHub.emit('click-change', data);
            });
            $(this.view.el).on('click','.delete',()=>{
                let obj=this.getFormVal();
                let data = { 'songs': [], 'selectId': this.model.data.selectId };
                data.songs.push(obj);
                this.model.delete(data);
                this.view.render({ songs: [{}] });
                window.eventHub.emit('click-delete', data);
            })
        }
    };
    controller.init(view, model);
}