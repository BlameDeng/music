{
    let view = {
        el: '.page1-inner',
        template: `<section class="banner"><div class="recomWrapper">
        <h2>推荐歌单</h2>
        <div class="recommendation clearfix active"><div class="true">
        <div><img src="__cover0__" alt=""><p>__name0__</p></div>
        <div><img src="__cover1__" alt=""><p>__name1__</p></div>
        <div><img src="__cover2__" alt=""><p>__name2__</p></div>
        <div><img src="__cover3__" alt=""><p>__name3__</p></div>
        </div></div></div></section>
        <section class="newSong"><h2>最新音乐</h2><ol></ol></section>`,
        templateLi: `<li><div class="songicon"><svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-yinle"></use></svg></div><div class="songinfo">
        <p>__name__</p><svg class="icon" aria-hidden="true"><use xlink:href="#icon-geshou"></use>
        </svg><span>__singer__</span></div><div class="play">
        <a href="./play.html?id=__id__"> <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-bofang1"></use></svg></a></div></li>`,
        render(data) {
            let lists = data.lists;  //[{},{}]
            let len=lists.length;
            lists=lists.slice(len-4,len);
            let names = [], ids = [], covers = [];
            lists.map((list) => {
                let { name, listId, listcover, summary } = list;
                names.push(name);ids.push(listId);covers.push(listcover);
            })
            let html=this.template;
            for (let i = 0; i < names.length; i++) {
                html=html.replace(`__cover${i}__`,covers[i]).replace(`__name${i}__`,names[i])
            }
            $(this.el).html(html);
            let divs=$('.true>div');
            for (let i = 0; i < divs.length; i++) {
                $(divs[i]).attr('data-list-id',ids[i]);
            };
        },
        addLi(data) {
            let songs = data.songs;
            let len = songs.length;
            songs = songs.slice(len - 10, len)
            songs.map((song) => {
                let { name, id, singer, url } = song;
                let html = this.templateLi.replace('__name__', name).replace('__singer__', singer)
                    .replace('__id__', id);
                let domLi = $(html);
                $(this.el).find('ol').prepend(domLi);
            });
        }
    };
    let model = {
        data: {
            songs: [],
            lists: []
        },
    };
    let controller = {
        view: null,
        model: null,
        init(view, model) {
            this.view = view;
            this.model = model;
            this.fetch().then(() => {
                this.view.addLi(this.model.data);
            });
            this.getList().then(() => {
                this.view.render(this.model.data);
            });
        },
        fetch() {
            var query = new AV.Query('Song');
            return query.find().then((songs) => {
                songs.map((song) => {
                    let id = song.id;
                    let { name, url, singer } = song.attributes;
                    let data = { name, singer, url, id };
                    this.model.data.songs.push(data);
                });
                return songs;
            }).then(() => {
                // 更新成功
            }, function (error) {
                // 异常处理
            });
        },
        getList() {
            var query = new AV.Query('SongList');
            return query.find().then((songlists) => {
                songlists.map((songlist) => {
                    let listId = songlist.id;
                    let { name, listcover, summary } = songlist.attributes;
                    let obj = { listId, name, listcover, summary };
                    this.model.data.lists.push(obj);
                })
                return songlists;
            }).then(function (todos) {
                // 更新成功
            }, function (error) {
                // 异常处理
            });
        }
    };
    controller.init(view, model);
}