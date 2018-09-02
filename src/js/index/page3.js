{
    let view = {
        el: '.page3',
        tempalate: ``,
        render(data) {

        },
        showSongs(data) {
            //清空之前的展示
            $('.songs>ul.songlist').empty();
            let songs = data.matchSongs;
            songs.map((song) => {
                let { name, singer, url, cover } = song;
                if (cover === '') { cover = `./img/default-cover.jpg`; };
                let domLi = $(`<li><p>${name}</p><span>${singer}</span><div><svg class="icon" aria-hidden="true"><use xlink:href="#icon-bofang1"></use></svg></div></li>`);
                domLi.attr('data-song-url', url).attr('data-song-cover', cover)
                    .attr('data-song-name', name);
                $('.songs>ul.songlist').append(domLi);
            });
        },
        showSinger(data) {
            //清空之前的展示
            $('main>.singer>.info').empty();
            //找一个不为空的封面
            let coverurl = '';
            let songs = data.matchSongs;
            for (let i = 0; i < songs.length; i++) {
                coverurl = songs[i].cover;
                if (coverurl !== '') {
                    break;
                }
            };
            let singer = data.matchSinger;
            if (coverurl === '') { coverurl = `./img/default-cover.jpg`; };
            let domSinger = $(`<div><img src="${coverurl}" alt=""></div>
                <p>${singer}</p>`);
            $('.singer>.info').append(domSinger);
        }
    };
    let model = {
        data: {
            songs: [],
            matchSongs: [],
            matchSinger: undefined
        }
    };
    let controller = {
        view: null,
        model: null,
        init(view, model) {
            this.view = view;
            this.model = model;
            this.fetch();
            this.bindEvents();
        },
        fetch() {
            var query = new AV.Query('Song');
            return query.find().then((songs) => {
                songs.map((song) => {
                    let id = song.id;
                    let { name, singer, cover, url } = song.attributes;
                    let obj = { id, name, singer, cover, url };
                    this.model.data.songs.push(obj);
                });
                return songs;
            }).then(function (songs) {
                // 更新成功
            }, function (error) {
                // 异常处理
            });
        },
        match(txt) {
            //清空之前的匹配结果
            this.model.data.matchSongs = [];
            this.model.data.matchSinger = [];
            let songs = this.model.data.songs;
            songs.map((song) => {
                if (song.name === txt || song.singer === txt) {
                    this.model.data.matchSongs.push(song);
                };
                if (song.singer === txt) {
                    this.model.data.matchSinger = txt;
                };
            });
        },
        bindEvents() {
            $('.page3').on('submit', 'form', (e) => {
                e.preventDefault();
                let txt = $(`input[name='txt']`).val().trim();
                this.match(txt);
                this.view.showSongs(this.model.data);
                this.view.showSinger(this.model.data);
            });
            $(this.view.el).on('click', '.songbtn', (e) => {
                $(e.currentTarget).addClass('active').siblings().removeClass('active');
                $('main>div.songs').addClass('active');
                $('main>div.singer').removeClass('active');
            });
            $(this.view.el).on('click', '.singerbtn', (e) => {
                $(e.currentTarget).addClass('active').siblings().removeClass('active');
                $('main>div.singer').addClass('active');
                $('main>div.songs').removeClass('active');
            });
        }
    };
    controller.init(view, model);
}
