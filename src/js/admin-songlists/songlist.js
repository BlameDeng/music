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
        }
    };
    controller.init(view, model);
}