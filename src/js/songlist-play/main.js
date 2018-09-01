{
    let view = {
        el: '.page',
        template: `<header>
        <div class="pre"></div>
        <div>
            <p>歌单</p>
            <span>编辑推荐：</span>
        </div>
    </header>
    <div class="info">
    </div>
    <div class="list">
        <ul class="songlist">
        </ul>
        <div class="play">
            <div><img src="" alt="" id="song-cover"><p>歌名</p>
                <div><span class="play" id="play">播放</span>
                    <span class="pause" id="pause">暂停</span>
                    <span class="stop" id="stop">停止</span></div>
            </div>
        </div>
    </div>`,
        render(data) {
            $(this.el).html(this.template);
            let songs = data.songs;
            songs.map((song) => {
                let { name, singer, url, cover } = song;
                let domLi = $(`<li>${name}--${singer}</li>`);
                domLi.attr('data-song-url', url).attr('data-song-cover', cover);
                $('ul.songlist').append(domLi);
            })
        }
    };
    let model = {
        data: {
            listId: null,
            songs: []
        }
    };
    let controller = {
        view: null,
        model: null,
        init(view, model) {
            this.view = view;
            this.model = model;
            this.getListId();
            this.getSongs().then(() => {
                this.view.render(this.model.data);
            });
            this.bindEvents();
        },
        getListId() {
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
            this.model.data.listId = listId;
        },
        getSongs() {
            let listId = this.model.data.listId
            var list = AV.Object.createWithoutData('SongList', listId);
            var query = new AV.Query('Song');
            query.equalTo('dependent', list);
            return query.find().then((songs) => {
                songs.map((song) => {
                    let songId = song.id;
                    let { name, singer, url, cover } = song.attributes;
                    let obj = { name, singer, url, cover, songId };
                    this.model.data.songs.push(obj);
                });
            });
        },
        bindEvents() {
            let audio=$('audio').get(0);
            $(this.view.el).on('click', 'li', (e) => {
                let url = $(e.currentTarget).attr('data-song-url');
                let cover = $(e.currentTarget).attr('data-song-cover');
                $('audio').attr('src', url);
                $('#song-cover').attr('src',cover);
            });
            $(this.view.el).on('click','#play',()=>{
                audio.play();
            })
            $(this.view.el).on('click','#pause',()=>{
                audio.pause();
            })
            $(this.view.el).on('click','#stop',()=>{
                audio.pause();
                audio.currentTime=0;
            })
        }
    };
    controller.init(view, model);
}