{
    let view = {
        el: '.page',
        template: `<header>
        <img src="./img/nvdu.png" alt="">
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
            let songs=data.songs;
            let selectSinger=data.selectSinger;
            let html=this.template.replace('__singer__',selectSinger);
            $(this.el).html(html);
            
            songs.map((song) => {
                let { name, singer, url, cover,id } = song;
                if (cover === '') {cover = `./img/default-cover.jpg`;}
                let domLi = $(`<li><p>${name}</p><span>${singer}</span><div><svg class="icon" aria-hidden="true"><use xlink:href="#icon-bofang1"></use></svg></div></li>`);
                domLi.attr('data-song-url', url).attr('data-song-cover', cover)
                    .attr('data-song-name', name).attr('data-song-id',id);
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
        }
    };
    controller.init(view, model);
}