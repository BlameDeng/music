{
    let view = {
        el: '.page',
        template: `<header>
        <div class="pre"><svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-leftt-2"></use>
            </svg></div>
        <p>专辑</p>
    </header>
    <div class="info">
        <div class="list-cover"><img src="__innercover__" alt="">
        </div>
        <div class="des">
            <h3>__name__</h3>
            <h5>歌手:__singername__</h5>
            <h5>发行时间：__time__</h5>
            <div class="sumwrapper">
                <p class="summary">__summary__</p>
                <div class="full">
                    <p class="full-summary"></p><span>［收起］</span></div>
            </div>
        </div>
    </div>
    <div class="list">
        <div class="top">
            <div><svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-yinle"></use>
                </svg></div>
            <p>歌曲列表</p><span>（共__length__首）</span>
        </div>
        <ul class="songlist"></ul>
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
        </footer>
        </div>`,
        render(data) {
            let album = data.album;  //对象
            let songs = data.songs;  //数组
            let length = songs.length;
            let { innercover, name, singername, time, summary } = album;
            let html = this.template;
            let needs = ['innercover', 'name', 'singername', 'time', 'summary'];
            needs.map((string) => {
                html = html.replace(`__${string}__`, album[string]);
            });
            html = html.replace('__length__', length);
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
        data: { album: null, songs: [] }
    };

    let controller = {
        view: null,
        model: null,
        init(view, model) {
            this.view = view;
            this.model = model;
            this.fetch().then(() => {
               return this.getSongs()
            }).then(()=>{this.view.render(this.model.data);});
            this.bindEvents();
        },
        fetch() {
            let search = window.location.search;
            if (search.indexOf('?') === 0) {
                search = search.substring(1);
            };
            let array = search.split('&').filter((v) => v);
            let listId;
            for (let i = 0; i < array.length; i++) {
                let arr = array[i].split('=');
                if (arr[0] === 'listid') {
                    listId = arr[1];
                    break;
                };
            };

            var query = new AV.Query('SongList');
            return query.get(listId).then((songlist) => {
                let { innercover, name, summary, singername, time } = songlist.attributes;
                let album = { innercover, name, summary, listId, singername, time };
                this.model.data.album = album;
                return songlist;
            }, function (error) {
                // 异常处理
            });
        },
        getSongs() {
            let listId = this.model.data.album.listId;
            var list = AV.Object.createWithoutData('SongList', listId);
            var query = new AV.Query('Song');
            query.equalTo('dependent', list);
            return query.find().then((songs) => {
                songs.map((song) => {
                    let songId = song.id;
                    let { name, singer, cover, url } = song.attributes;
                    let obj = { songId, name, singer, cover, url };
                    this.model.data.songs.push(obj);
                });
                return songs;
            });
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
                e.stopPropagation();
                let txt = $(e.currentTarget).text();
                $('div.full').addClass('active').find('p').text(txt);
                $(document).one('click', () => {
                    $('div.full').removeClass('active');
                });
            });
            $(this.view.el).on('click', 'div.full>span', () => {
                $('div.full').removeClass('active')
            })
        }
    };
    controller.init(view, model);
}