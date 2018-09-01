{
    let view = {
        el: '.song',
        template: `<li><p>{{name}}</p><p>{{singer}}</p><p class="add">添加</p><p class="remove">移除</p></li>`,
        render(data) {
            let songs = data.songs;
            songs.map((song) => {
                let { name, singer, id } = song;
                let html = this.template.replace('{{name}}', name).replace('{{singer}}', singer);
                let domli = $(html);
                domli.attr('data-song-id', id);
                $(this.el).append(domli);
            })
        }
    };
    let model = {
        data: {
            songs: [],
            listName: null,
            listId: null
        },
        fetch() {
            var query = new AV.Query('Song');
            return query.find().then((songs) => {
                return AV.Object.saveAll(songs);
            }
            ).then((songs) => {
                // 更新成功
                songs.map((item) => {

                    let { name, singer } = item.attributes;
                    let id = item.id;
                    let song = { name, singer, id };
                    this.data.songs.push(song);
                });
            }, function (error) {
                // 异常处理
            });
        },
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
        bindEvents() {
            $(this.view.el).on('click', '.add', (e) => {
                let songId = $(e.currentTarget).parent().attr('data-song-id');
                let listId = this.model.data.listId;
                $(e.currentTarget).addClass(' disable');
                //添加dependent
                var songlist = AV.Object.createWithoutData('SongList', listId);
                var song = AV.Object.createWithoutData('Song', songId);
                song.set('dependent', songlist);
                song.save();
            });
            $(this.view.el).on('click', '.remove', (e) => {
                let songId = $(e.currentTarget).parent().attr('data-song-id');
                //添加dependent===null
                var song = AV.Object.createWithoutData('Song', songId);
                song.set('dependent', null);
                song.save();
            });
        },
        bindEventHub() {
            window.eventHub.on('click-list', (obj) => {
                this.model.data.listName = obj.name;
                this.model.data.listId = obj.id;
            }),
                window.eventHub.on('get-list-song', (songs) => {
                    //songs [{},{}]
                    $('.song>li>p').removeClass('disable');
                    songs.map((song) => {
                        let id = song.songId;
                        $('.song').find(`[data-song-id='${id}']>p.add`).addClass('disable');
                    })
                })
        }
    };
    controller.init(view, model);
}