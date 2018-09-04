{
    let view = {
        el: '.page3',
        tempalate: `<audio id="audio-p3"></audio>
        <header>
            <form id="myForm">
                <div class="input"> <input type="text" name="txt" placeholder="歌曲或歌手名，如晴天，周杰伦">
                    <button type="submit">
                        <svg class="icon" aria-hidden="true">
                            <use xlink:href="#icon-sousuo"></use></svg>
                    </button></div>
            </form>
        </header>
        <main id="p3-main">
            <div class="resultnav"><p class="songbtn">歌曲</p><p class="singerbtn">歌手</p></div>
            <div class="songs">
                <ul class="songlist"></ul>
            </div>
            <div class="singer">
                <div class="info"></div>
            </div>
        </main>
        <div class="mask" id="mask">请输入想要搜索的歌曲或歌手名……</div>`,
        render(data) {
            $(this.el).html(this.tempalate);
        },
        showSongs(data) {
            //清空之前的展示
            $(this.el).find('.songs>ul.songlist').empty();
            let songs = data.matchSongs;
            songs.map((song) => {
                let { name, singer, url, cover,id,lrc } = song;
                if (cover === '') { cover = `./img/default-cover.jpg`; };
                let domLi = $(`<li><div class="songicon"><svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-yinle"></use></svg></div><div class="songinfo">
                <p>${name}</p><svg class="icon" aria-hidden="true"><use xlink:href="#icon-geshou"></use>
                </svg><span>${singer}</span></div><div class="play">
                <svg class="icon" aria-hidden="true"><use xlink:href="#icon-bofang1"></use></svg></div></li>`);
                domLi.attr('data-song-id', id);
                $('.songs>ul.songlist').append(domLi);
            });
        },
        showSinger(data) {
            //清空之前的展示
            $('main>.singer>.info').empty();
            let songs = data.matchSongs;
            let singer = data.matchSinger;
            //判断是否有匹配，有才更新页面
            if (singer !== undefined) {
                //找一个不为空的封面
                let coverurl = '';
                for (let i = 0; i < songs.length; i++) {
                    coverurl = songs[i].cover;
                    if (coverurl !== '') {
                        break;
                    }
                };
                if (coverurl === '') { coverurl = `./img/default-cover.jpg`; };
                let domSinger = $(`<div><img src="${coverurl}" alt=""></div>
                <p data-singer-name="${singer}">${singer}</p>`);
                $('.singer>.info').append(domSinger);
            } else {
                //没有匹配，什么也不做
            }
        },
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
            this.view.render();
            this.fetch();
            this.bindEvents();
        },
        fetch() {
            var query = new AV.Query('Song');
            return query.find().then((songs) => {
                songs.map((song) => {
                    let id = song.id;
                    let { name, singer, cover, url ,lrc} = song.attributes;
                    let obj = { id, name, singer, cover, url ,lrc};
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
            this.model.data.matchSinger = undefined;
            txt = txt.toLowerCase();
            let songs = this.model.data.songs;
            songs.map((song) => {
                if (song.name.toLowerCase() === txt || song.singer.toLowerCase() === txt) {
                    this.model.data.matchSongs.push(song);
                };
                if (song.singer.toLowerCase() === txt) {
                    this.model.data.matchSinger = txt;
                };
            });
        },
        active(...selectors) {
            for (let i = 0; i < selectors.length; i++) {
                $(this.view.el).find(selectors[i]).addClass('active');
            };
        },
        deactive(...selectors) {
            for (let i = 0; i < selectors.length; i++) {
                $(this.view.el).find(selectors[i]).removeClass('active');
            };
        },
        bindEvents() {
            $('.page3').on('submit', 'form', (e) => {
                e.preventDefault();
                let txt = $(`input[name='txt']`).val().trim();
                if (txt === '') {
                    this.active('div#mask');
                    setTimeout(() => {
                        this.deactive('div#mask');
                    }, 3500);
                } else {
                    this.match(txt);
                    this.view.showSongs(this.model.data);
                    this.view.showSinger(this.model.data);
                    this.active('#p3-main', 'main>div.songs');
                    this.deactive('main>div.singer');
                }
            });
            $(this.view.el).on('click', '.songbtn', (e) => {
                $(e.currentTarget).addClass('active').siblings().removeClass('active');
                this.active('main>div.songs');
                this.deactive('main>div.singer');
            });
            $(this.view.el).on('click', '.singerbtn', (e) => {
                $(e.currentTarget).addClass('active').siblings().removeClass('active');
                this.active('main>div.singer');
                this.deactive('main>div.songs');
            });
            $(this.view.el).on('click', 'li', (e) => {
                let tag=e.target.tagName
                let id = $(e.currentTarget).attr('data-song-id');
                let songs=this.model.data.matchSongs;
                let obj={};
                for (let i = 0; i < songs.length; i++) {
                    if (songs[i].id===id) {
                        obj=Object.assign({tag},songs[i]);
                        break;
                    }
                };
                window.eventHub.emit('click-li-play', obj);
            });
            $(this.view.el).on('click', `.info>p`, (e) => {
                let str = $(e.currentTarget).attr('data-singer-name');
                str = encodeURIComponent(str);
                str=encodeURIComponent(str); //两次转码
                window.location.href = `./singer.html?name=${str}`;
            })
        }
    };
    controller.init(view, model);
}
