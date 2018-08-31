{
    let view = {
        el: '.song',
        template: `<li>{{name}}--{{singer}}</li>`,
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
            songs: []
        },
        fetch() {
            var query = new AV.Query('Song');
            return query.find().then((songs) => {
                return AV.Object.saveAll(songs);
            }
            ).then((songs) => {
                // 更新成功
                console.log(songs)
                songs.map((item) => {

                    let { name, singer } = item.attributes;
                    let id = item.id;
                    let song = { name, singer, id };
                    this.data.songs.push(song);
                });
                console.log(this.data)
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