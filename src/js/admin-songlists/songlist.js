{
    let view = {
        el: '.list',
        template: `<li>{{name}}</li>`,
        render(data) {
            let lists = data.lists;
            lists.map((list) => {
                let { name, listcover, summary, id } = list;
                let html = this.template.replace('{{name}}', name);
                let domli = $(html);
                domli.attr('data-list-id', id);
                $(this.el).append(domli);
            })
        }
    };
    let model = {
        data: { lists: [] },
        fetch() {
            this.data.lists = [];
            var query = new AV.Query('SongList');
            return query.find().then((songlists) => {
                return AV.Object.saveAll(songlists);
            }
            ).then((songlists) => {
                // 更新成功
                songlists.map((songlist) => {
                    let { name, summary, listcover } = songlist.attributes;
                    let id = songlist.id;
                    let list = { name, summary, listcover, id };
                    this.data.lists.push(list);
                });
            }, function (error) {
                // 异常处理
            });
        }
    };
    let controller = {
        view: null,
        model: null,
        init(view, model) {
            this.view = view;
            this.model = model;
            this.model.fetch().then(() => {
                this.view.render(this.model.data)
            });
            this.bindEvents();
            this.bindEventHub();
        },
        bindEventHub() {
            window.eventHub.on('addnewlist', () => {
                this.model.fetch().then(() => {
                    this.view.render(this.model.data)
                });
            })
        },
        bindEvents() {
            $(this.view.el).on('click', 'li', (e) => {
                let id = e.currentTarget.getAttribute('data-list-id');
                let obj = {};
                let lists = this.model.data.lists;
                lists.map((list) => {
                    if (list.id === id) {
                        obj = JSON.parse(JSON.stringify(list));
                    }
                })
                window.eventHub.emit('click-list', obj);
            })
        }
    };
    controller.init(view, model);
}