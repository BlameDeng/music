{
    let view = {
        el: '.app',
        template: `<audio controls src="__url__"></audio>`,
        render(data) {
            console.log(data)
            let url=data.attributes.url;
            let html=this.template.replace('__url__',url);
            $(this.el).html(html);
        }
    };
    let model = {
        data: {},
    };
    let controller = {
        view: null,
        model: null,
        init(view, model) {
            this.view = view;
            this.model = model;
            this.fetch().then(() => {
                this.view.render(this.model.data);
            })
        },
        getId() {
            let search = window.location.search;
            if (search.indexOf('?') === 0) {
                search = search.substring(1);
            }
            let array = search.split('&').filter((n) => {
                return n;
            })
            let id = undefined;
            for (let i = 0; i < array.length; i++) {
                let key = array[i].split('=')[0];
                let value = array[i].split('=')[1];
                if (key === 'id') {
                    id = value;
                    break;
                }
            };
            return id;
        },
        fetch() {
            let query = new AV.Query('Song');
            let id = this.getId();
            return query.get(id).then((song)=> {
                // song 就是 id 对象实例 attributes,id
                this.model.data = song;
            }, function (error) {
                // 异常处理
            });
        }
    };
    controller.init(view, model);
}