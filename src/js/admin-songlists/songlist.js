{
    let view = {
        el: '.list',
        template: `<li class="active">{{name}}</li>`,
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
        data: { lists: [], songs: [] },
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
        },
        search(listId) {
            this.data.songs=[];  //重置songs
            var songlist = AV.Object.createWithoutData('SongList', listId);
            var query = new AV.Query('Song');
            query.equalTo('dependent', songlist);
            return query.find().then((objs) => {
                objs.map((obj)=>{
                    let songId=obj.id;
                    let {name,singer,dependent}=obj.attributes;
                    let dependentId=dependent.id;
                    let song={name,singer,songId,dependentId};
                    this.data.songs.push(song);
                });
                console.log(this.data)
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
            $('ul.list').on('click', 'li', (e) => {
                let id = e.currentTarget.getAttribute('data-list-id');
                let obj = {};
                let lists = this.model.data.lists;
                lists.map((list) => {
                    if (list.id === id) {
                        obj = JSON.parse(JSON.stringify(list));
                    }
                    window.eventHub.emit('click-list', obj);
                });
                this.model.search(id);
            })
        },
    };
    controller.init(view, model);
}