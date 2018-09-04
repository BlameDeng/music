{
    let view = {
        el: '.page',
        template: `<header>
        <div class="headerinner"><div><div class="pre"><svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-leftt-2"></use></svg></div><p>__singer__</p></div></div>
        <img src="__cover__" alt="">
    </header>
    <main>
        <div class="title">
            <div><svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-yinle"></use>
                </svg></div>
            <p>热门歌曲</p>
        </div>
        <ul class="songlist">
        </ul>
    </main>`,
        render(data) {
            let songs = data.songs;
            let cover = '';
            for (let i = 0; i < songs.length; i++) {
                if (songs[i].cover !== '') { cover = songs[i].cover; break; };
            };
            if (cover === '') { cover = './img/default-cover.jpg' };
            let selectSinger = data.selectSinger;
            let html = this.template.replace('__cover__',cover)
            .replace('__singer__', selectSinger);
            $(this.el).html(html);

            songs.map((song) => {
                let { name, singer, url, cover, id } = song;
                if (cover === '') { cover = `./img/default-cover.jpg`; }
                let domLi = $(`<li><div class="songicon"><svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-yinle"></use></svg></div><div class="songinfo">
                <p>${name}</p><svg class="icon" aria-hidden="true"><use xlink:href="#icon-geshou"></use>
                </svg><span>${singer}</span></div><div class="play">
                <svg class="icon" aria-hidden="true"><use xlink:href="#icon-bofang1"></use></svg></div></li>`);
                domLi.attr('data-song-id', id);
                $('ul.songlist').append(domLi);
            });
        },
    };

    let model = {
        data: { selectSinger: undefined, allSongs: [], songs: [] }
    };

    let controller = {
        view: null,
        model: null,
        init(view, model) {
            this.view = view;
            this.model = model;
            this.fetch().then(() => {
                this.match();
                this.view.render(this.model.data);
            });
            this.bindEvents();
        },
        fetch() {
            var query = new AV.Query('Song');
            return query.find().then((objs) => {
                objs.map((obj) => {
                    let id = obj.id;
                    let { name, singer, url, cover ,lrc} = obj.attributes;
                    let song = { id, name, singer, url, cover ,lrc};
                    this.model.data.allSongs.push(song);
                });
                return objs;
            }).then(function (objs) {
                // 更新成功
            }, function (error) {
                // 异常处理
            });
        },
        match() {
            let search = window.location.search;
            if (search.indexOf('?') === 0) {
                search = search.substring(1);
            };
            let array = search.split('&').filter((v) => v);
            let selectSinger;
            for (let i = 0; i < array.length; i++) {
                arr = array[i].split('=');
                if (arr[0] === 'name') {
                    selectSinger = arr[1];
                    break;
                }
            };
            selectSinger = decodeURIComponent(selectSinger);
            selectSinger = decodeURIComponent(selectSinger);
            this.model.data.selectSinger = selectSinger;

            let allSongs = this.model.data.allSongs;
            allSongs.map((song) => {
                if (song.singer === selectSinger) {
                    this.model.data.songs.push(song);
                }
            })
        },
        bindEvents() {
            $(this.view.el).on('click', '.pre', () => {
                window.history.go(-1);
            });

            $(this.view.el).on('click', 'li', (e) => {
                let tag=e.target.tagName
                let id = $(e.currentTarget).attr('data-song-id');
                let songs=this.model.data.songs;
                let obj={};
                for (let i = 0; i < songs.length; i++) {
                    if (songs[i].id===id) {
                        obj=Object.assign({tag},songs[i]);
                        break;
                    }
                };
                window.eventHub.emit('click-li-play', obj);
            });
        }
    };
    controller.init(view, model);
}