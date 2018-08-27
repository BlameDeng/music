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
                let { name='', singer = '', url='' } = song;
                this.template = this.template.replace('__name__', name)
                    .replace('__singer__', singer).replace('__url__', url);
            })
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
            return song.save().then((response)=> {
                let obj=response.attributes;
                obj['id']=response.id;
                this.data.songs.push(obj);  //将回应的数据加到data的songs里
                //这里传数据只应该传这次保存生成的
                let emitdata={songs: [],selectId: null};
                emitdata.songs.push(obj);
                window.eventHub.emit('save-done',emitdata);
            }, function (error) {
                console.error(error);
            });
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
            this.bindEvents();
        },
        bindEventHub() {
            window.eventHub.on('click-add', () => {
                this.view.deactive();
            });
            window.eventHub.on('upload-done', (data) => {
                this.view.active();
                this.view.render(data);  //渲染页面
            })
        },
        bindEvents() {
            $(this.view.el).on('submit', 'form', (e) => {
                e.preventDefault();
                let name = $(this.view.el).find(`input[name=name]`).val();
                let singer = $(this.view.el).find(`input[name=singer]`).val();
                let url = $(this.view.el).find(`input[name=url]`).val();
                let obj = { 'name': name, 'singer': singer, 'url': url };
                this.model.save(obj);
                this.view.render({songs:[{}]});
            })
        }
    };
    controller.init(view, model);

}