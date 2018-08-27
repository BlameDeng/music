{
    let view = {
        el: '.edit',
        template: `<p class="editinfo">请编辑歌曲信息</p>
        <form>
            <div class="row"><span>歌曲：</span><input type="text" name="name" value="__name__"></div>
            <div class="row"><span>歌手：</span><input type="text" name="singer" value="__singer__"></div>
            <div class="row"><span>外链：</span><input type="text" name="url" value="__url__"></div>
            <div class="row"><input type="submit" value="保存"></div>
        </form>`,
        render(data) {
            // let {name,singer,url}=data;
            // let html=this.template.replace('__name__',name).replace('__singer__',singer).replace('__url__',url)            
            let needs = ['name', 'singer', 'url'];
            let html = this.template;
            needs.map((string) => {
                data[string] = data[string] || '';
                return html = html.replace(`__${string}__`, data[string])
            })
            $(this.el).html(html);

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
            name: '',
            singer: '',
            url: '',
            id: ''
        },
        save(data) {
            let Song = AV.Object.extend('Song');
            let song = new Song();
            let { name, singer, url } = data;
            return song.save({
                name: name,
                singer: singer,
                url: url
            }).then((response) => {
                let id = response.id;
                let { name, singer, url } = response.attributes;
                this.data.id = id;
                this.data.name = name;
                this.data.singer = singer;
                this.data.url = url;
                return response;
            })
        },
    };

    let controller = {
        view: null,
        model: null,

        init(view, model) {
            this.view = view;
            this.model = model;

            this.view.render(this.model.data);
            this.bindEvents();
            this.bindEventHub();
        },
        bindEventHub() {
            window.eventHub.on('add', () => {
                this.view.deactive();
            });
            window.eventHub.on('new', (data) => {
                let { name, url } = data;
                this.model.data.name = name;
                this.model.data.url = url;

                this.view.active();
                this.view.render(this.model.data);
            });
        },
        bindEvents() {
            $(this.view.el).on('submit', 'form', (e) => {
                e.preventDefault();
                let name = $(this.view.el).find('input[name=name]').val();
                let singer = $(this.view.el).find('input[name=singer]').val();
                let url = $(this.view.el).find('input[name=url]').val();
                this.model.data.name = name;
                this.model.data.singer = singer;
                this.model.data.url = url;
                let data = JSON.parse(JSON.stringify(this.model.data));
                this.view.render({});
                this.model.save(this.model.data);
                window.eventHub.emit('save', data);  //save事件，用户点击了保存
            })
        },

    };
    controller.init(view, model);
}