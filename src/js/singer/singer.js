{
    let view = {
        el: '.page',
        template: `<header>
        <img src="__cover__" alt="">
        <div class="pre"><svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-leftt-2"></use>
            </svg></div>
        <p>__singer__</p>
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
    </main>
    <footer>
        <div class="progress">
            <p class="current"></p>
        </div>
        <div class="play">
            <div class="coverwrapper">
                <img src="./img/default-cover.jpg" alt="" id="song-cover">
            </div>
            <p></p>
            <div class="btns">
                <span class="play active" id="play"><svg class="icon" aria-hidden="true">
                        <use xlink:href="#icon-bofang1"></use>
                    </svg></span>
                <span class="pause" id="pause"><svg class="icon" aria-hidden="true">
                        <use xlink:href="#icon-zanting-copy"></use>
                    </svg></span>
                <span class="stop" id="stop"><svg class="icon" aria-hidden="true">
                        <use xlink:href="#icon-tingzhi-copy"></use>
                    </svg></span>
            </div>
        </div>
    </footer>`,
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
                let domLi = $(`<li><p>${name}</p><span>${singer}</span><div><svg class="icon" aria-hidden="true"><use xlink:href="#icon-bofang1"></use></svg></div></li>`);
                domLi.attr('data-song-url', url).attr('data-song-cover', cover)
                    .attr('data-song-name', name).attr('data-song-id', id);
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
                    let { name, singer, url, cover } = obj.attributes;
                    let song = { id, name, singer, url, cover };
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
            let audio = $('audio').get(0);
            $(this.view.el).on('click', 'li', (e) => {
                let url = $(e.currentTarget).attr('data-song-url');
                let cover = $(e.currentTarget).attr('data-song-cover');
                let name = $(e.currentTarget).attr('data-song-name');
                $('audio').attr('src', url);
                $('#song-cover').attr('src', cover);
                $('.play>p').text(name);
                $('footer').addClass('active');
                $('#pause').removeClass('active');
                $('#play').addClass('active');
                $('.current').css('width', `0`);
            });
            $(this.view.el).on('click', 'li>div', (e) => {
                e.stopPropagation();
                let url = $(e.currentTarget).parent().attr('data-song-url');
                let cover = $(e.currentTarget).parent().attr('data-song-cover');
                let name = $(e.currentTarget).parent().attr('data-song-name');
                $('audio').attr('src', url);
                $('#song-cover').attr('src', cover);
                $('.play>p').text(name);
                $('footer').addClass('active');
                audio.play();
                $('#play').removeClass('active');
                $('#pause').addClass('active');
            })
            $(this.view.el).on('click', '#play', () => {
                audio.play();
                $('#play').removeClass('active');
                $('#pause').addClass('active');
            });
            $(this.view.el).on('click', '#pause', () => {
                audio.pause();
                $('#pause').removeClass('active');
                $('#play').addClass('active');
            });
            $(this.view.el).on('click', '#stop', () => {
                audio.pause();
                audio.currentTime = 0;
                $('#pause').removeClass('active');
                $('#play').addClass('active');
            });
            $('audio').on('timeupdate', () => {
                let pro = (audio.currentTime) / (audio.duration) * 100;
                $('.current').css('width', `${pro}%`);
            });
            $(this.view.el).on('click', 'p.summary', (e) => {
                let txt = $(e.currentTarget).text();
                $('div.full').addClass('active').find('p').text(txt);
            });
            $(this.view.el).on('click', 'div.full>span', () => {
                $('div.full').removeClass('active')
            })
        }
    };
    controller.init(view, model);
}