{
    let view = {
        el: '.page',
        template: `<header><div class="pre"><svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-leftt-2"></use>
            </svg></div>
        <p>歌单</p>
    </header>
    <div class="info">
        <div class="list-cover"><img src="__listcover__" alt="">
        </div><div class="des"><h3>__name__</h3><div class="sumwrapper"><p class="summary">__summary__</p>
    <div class="full"><p class="full-summary"></p><span>［收起］</span></div></div></div></div>
    <div class="list">
        <div class="top">
            <div><svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-yinle"></use>
                </svg></div>
            <p>歌曲列表</p><span>（共__length__首）</span>
        </div>
        <ul class="songlist"></ul>
    </div>`,
        render(data) {
            let length = data.songs.length;
            let { name, listcover, summary } = data.list;
            let html = this.template.replace('__name__', name).replace('__listcover__', listcover)
                .replace('__summary__', summary).replace('__length__', length);
            $(this.el).html(html);
            let songs = data.songs;
            songs.map((song) => {
                let { name, singer, url, cover, id, lrc } = song;
                if (cover === '') {
                    cover = `http://pe9h96qe0.bkt.clouddn.com/default-cover.jpg`;
                }
                let domLi = $(`<li><div class="songicon"><svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-yinle"></use></svg></div><div class="songinfo">
                <p>${name}</p><svg class="icon" aria-hidden="true"><use xlink:href="#icon-geshou"></use>
                </svg><span>${singer}</span></div><div class="play">
                <svg class="icon" aria-hidden="true"><use xlink:href="#icon-bofang1"></use></svg></div></li>`);
                domLi.attr('data-song-id', id);
                $('ul.songlist').append(domLi);
            });
        }
    };
    let model = {
        data: {
            list: { listId: null },
            songs: []
        }
    };
    let controller = {
        view: null,
        model: null,
        init(view, model) {
            this.view = view;
            this.model = model;
            this.getList().then(() => {
                return this.getSongs();
            }).then(() => { this.view.render(this.model.data); })
            this.bindEvents();
        },
        getList() {
            let string = window.location.search;
            if (string.indexOf('?') === 0) {
                string = string.substring(1);
            }
            let array = string.split('&').filter((v) => v);
            let listId;
            array.map((str) => {
                arr = str.split('=');
                if (arr[0] === 'listid') {
                    listId = arr[1];
                }
            });
            this.model.data.list.listId = listId;

            var query = new AV.Query('SongList');
            return query.get(listId).then((songlist) => {
                this.model.data.list = Object.assign(this.model.data.list, songlist.attributes);
            }, function (error) {
                // 异常处理
            });
        },
        getSongs() {
            let listId = this.model.data.list.listId
            var list = AV.Object.createWithoutData('SongList', listId);
            var query = new AV.Query('Song');
            query.equalTo('dependent', list);
            return query.find().then((songs) => {
                songs.map((song) => {
                    let id = song.id;
                    let { name, singer, url, cover, lrc } = song.attributes;
                    let obj = { name, singer, url, cover, id, lrc };
                    this.model.data.songs.push(obj);
                });
            });
        },
        bindEvents() {
            $(this.view.el).on('click', '.pre', () => {
                window.history.go(-1);
            });
            $(this.view.el).on('click', 'p.summary', (e) => {
                e.stopPropagation();
                let txt = $(e.currentTarget).text();
                $(this.view.el).find('div.full').addClass('active').find('p').text(txt);
                $(document).one('click', () => {
                    $(this.view.el).find('div.full').removeClass('active');
                });
            });
            $(this.view.el).on('click', 'div.full>span', () => {
                $(this.view.el).find('div.full').removeClass('active')
            });
            $(this.view.el).on('click', 'li', (e) => {
                let tagName = e.target.tagName
                let id = $(e.currentTarget).attr('data-song-id');
                let songs = this.model.data.songs;
                let obj = {};
                for (let i = 0; i < songs.length; i++) {
                    if (songs[i].id === id) {
                        obj = Object.assign({ tagName }, songs[i]);
                        break;
                    }
                };
                window.eventHub.emit('click-li-play', obj);
            });
        }
    };
    controller.init(view, model);
}