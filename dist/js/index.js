{
    let view = {
        el: '.top',
    };
    let model = {};
    let controller = {
        view: null,
        model: null,
        init(view, model) {
            this.view = view;
            this.model = model;
            this.bindEvents();
        },
        bindEvents() {
            $(this.view.el).on('click', 'li', (e) => {
                $(e.currentTarget).addClass('active').siblings().removeClass('active');
                let index = $(e.currentTarget).index();
                $('.page').eq(index).addClass('active').siblings().removeClass('active');
            })
        }
    };
    controller.init(view, model);
}

{
    let view = {
        el: '.page1-inner',
        template: `<audio id="audio-p3"></audio>
        <section class="banner"><div class="recomWrapper">
        <h2>推荐歌单</h2>
        <div class="recommendation clearfix active"><div class="true">
        <div><img class="listcover" src="__cover0__" alt=""><p class="listname">__name0__</p></div>
        <div><img class="listcover" src="__cover1__" alt=""><p class="listname">__name1__</p></div>
        <div><img class="listcover" src="__cover2__" alt=""><p class="listname">__name2__</p></div>
        <div><img class="listcover" src="__cover3__" alt=""><p class="listname">__name3__</p></div>
        </div></div></div></section>
        <section class="newSong"><h2>最新音乐</h2><ol></ol></section>`,
        templateLi: `<li><div class="songicon"><svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-yinle"></use></svg></div><div class="songinfo">
        <p>__name__</p><svg class="icon" aria-hidden="true"><use xlink:href="#icon-geshou"></use>
        </svg><span>__singer__</span></div><div class="play">
        <svg class="icon" aria-hidden="true"><use xlink:href="#icon-bofang1"></use></svg></div></li>`,
        changeSlides(data) {
            let albums = data.albums;
            let len = albums.length;
            let ids = [], covers = [];
            albums.map((album) => {
                let { listId, listcover } = album;
                ids.push(listId); covers.push(listcover);
            });
            for (let i = 0; i < len; i++) {
                $(`#img${i}`).attr('src', covers[i]).attr('data-list-id', ids[i]);
            };
            var mySwiper = new Swiper('.swiper-container', {
                // Optional parameters
                loop: true,
                autoplay: {
                    delay: 3000
                },
                speed: 1000
            });
            $(`.swiper-slide`).on('click', 'img', (e) => {
                let listId = $(e.currentTarget).attr('data-list-id')
                window.location.href = `./album.html?listid=${listId}`;
            });
        },
        render(data) {
            let lists = data.lists;  //[{},{}]
            let len = lists.length;
            lists = lists.slice(len - 4, len);
            let names = [], ids = [], covers = [];
            lists.map((list) => {
                let { name, listId, listcover, summary } = list;
                names.push(name); ids.push(listId); covers.push(listcover);
            });
            let html = this.template;
            for (let i = 0; i < names.length; i++) {
                html = html.replace(`__cover${i}__`, covers[i]).replace(`__name${i}__`, names[i])
            }
            $(this.el).html(html);
            let divs = $('.true>div');
            for (let i = 0; i < divs.length; i++) {
                $(divs[i]).attr('data-list-id', ids[i]);
            };
        },
        addLi(data) {
            let songs = data.songs;
            let len = songs.length;
            songs = songs.slice(len - 10, len);
            songs.map((song) => {
                let { name, id, singer, url } = song;
                let html = this.templateLi.replace('__name__', name).replace('__singer__', singer)
                    .replace('__id__', id);
                let domLi = $(html);
                domLi.attr('data-song-id', id);
                $(this.el).find('ol').prepend(domLi);
            });
        }
    };
    let model = {
        data: {
            songs: [],
            lists: [],
            albums: []
        },
    };
    let controller = {
        view: null,
        model: null,
        init(view, model) {
            this.view = view;
            this.model = model;
            this.getList().then(() => {
                return this.fetch();
            }).then(() => {
                this.view.changeSlides(this.model.data);
                this.view.render(this.model.data);
                this.view.addLi(this.model.data);
            })
            this.bindEvents();
        },
        fetch() {
            var query = new AV.Query('Song');
            return query.find().then((songs) => {
                songs.map((song) => {
                    let id = song.id;
                    let { name, url, singer,lrc,cover,tag } = song.attributes;
                    let data = { name, singer, url, id ,lrc,cover,tag};
                    this.model.data.songs.push(data);
                });
                window.eventHub.emit('all-songs-get',this.model.data.songs);
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
                    let { name, listcover, summary, type } = songlist.attributes;
                    let obj = { listId, name, listcover, summary, type };
                    if (obj.type === 'list') {
                        this.model.data.lists.push(obj);
                    }
                    else if (obj.type === 'album') {
                        this.model.data.albums.push(obj);
                    }
                });
                return songlists;
            }).then(function (todos) {
                // 更新成功
            }, function (error) {
                // 异常处理
            });
        },
        bindEvents() {
            $(this.view.el).on('click', '.listcover,.listname', (e) => {
                let listId = $(e.currentTarget).parent().attr('data-list-id')
                window.location.href = `./songlist.html?listid=${listId}`;
            });
            $(this.view.el).on('click', 'ol>li', (e) => {
                let tagName=e.target.tagName;
                let songId = $(e.currentTarget).attr('data-song-id');
                let songs=this.model.data.songs;
                let obj={};
                for (let i = 0; i < songs.length; i++) {
                    if (songs[i].id===songId) {
                        obj=Object.assign({tagName},songs[i]);
                        break;
                    }
                };
                window.eventHub.emit('click-li-play', obj);
            })
        }
    };
    controller.init(view, model);
}

{
    let view = {
        el: '.page2',
        tempalate: `<header>官方榜</header>
        <main><div class="new"><img src="http://pedcq5s6m.bkt.clouddn.com/new.png" alt=""><ol></ol>
        </div><div class="hot"><img src="http://pedcq5s6m.bkt.clouddn.com/hot.png" alt=""><ol></ol></div></main>`,
        render(data) {
            $(this.el).html(this.tempalate);
            let newSongs = data.newSongs;
            let hotSongs = data.hotSongs;
            for (let i = 0; i < newSongs.length; i++) {
                let { id:nId, name:nName, singer:nSinger } = newSongs[i];
                let nLi = $(`<li><span>${i + 1}</span><p class="songname">${nName}</p><p class="singername">${nSinger}</p></li>`);
                nLi.attr('data-song-id', nId);
                if (i<=2) {
                    nLi.addClass('top3')
                }
                $(this.el).find('.new>ol').append(nLi);

                let { id:hId, name:hName, singer:hSinger } = hotSongs[i];
                let hLi = $(`<li><span>${i + 1}</span><p class="songname">${hName}</p><p class="singername">${hSinger}</p></li>`);
                hLi.attr('data-song-id', hId);
                if (i<=2) {
                    hLi.addClass('top3')
                }
                $(this.el).find('.hot>ol').append(hLi);
            }
        },
    };
    let model = {
        data: { newSongs: [], hotSongs: [] }
    };
    let controller = {
        view: null,
        model: null,
        init(view, model) {
            this.view = view;
            this.model = model;
            this.bindEventHub();
            this.bindEvents();
        },
        fetch(data) {
            return new Promise((resolve) => {
                data.map((song) => {
                    let { name, singer, cover, url, lrc, tag, id } = song;
                    if (tag === 'new') {
                        let obj = { id, name, singer, cover, url, lrc };
                        this.model.data.newSongs.push(obj);
                    } else if (tag === 'hot') {
                        let obj = { id, name, singer, cover, url, lrc };
                        this.model.data.hotSongs.push(obj);
                    }
                });
                resolve();
            })
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
            $(this.view.el).on('click', 'ol>li', (e) => {
                let tagName=undefined;  //榜单只在页面内播放
                let songId = $(e.currentTarget).attr('data-song-id');
                let songs=this.model.data.newSongs.concat(this.model.data.hotSongs);
                let obj={};
                for (let i = 0; i < songs.length; i++) {
                    if (songs[i].id===songId) {
                        obj=Object.assign({tagName},songs[i]);
                        break;
                    }
                };
                window.eventHub.emit('click-li-play', obj);
            })
        },
        bindEventHub() {
            window.eventHub.on('all-songs-get', (data) => {
                this.fetch(data).then(()=>{
                    this.view.render(this.model.data);
                })
            })
        }
    };
    controller.init(view, model);
}

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
                let { name, singer, url, cover, id, lrc } = song;
                if (cover === '') { cover = `http://pe9h96qe0.bkt.clouddn.com/default-cover.jpg`; };
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
                    let { name, singer, cover, url, lrc } = song.attributes;
                    let obj = { id, name, singer, cover, url, lrc };
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
            return new Promise((resolve) => {
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
                resolve();
            })
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
                    this.match(txt).then(() => {
                        this.view.showSongs(this.model.data);
                        this.view.showSinger(this.model.data);
                        this.active('#p3-main', 'main>div.songs');
                        this.deactive('main>div.singer');
                    })
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
                let tagName = e.target.tagName;
                let id = $(e.currentTarget).attr('data-song-id');
                let songs = this.model.data.matchSongs;
                let obj = {};
                for (let i = 0; i < songs.length; i++) {
                    if (songs[i].id === id) {
                        obj = Object.assign({ tagName }, songs[i]);
                        break;
                    }
                };
                window.eventHub.emit('click-li-play', obj);
            });
            $(this.view.el).on('click', `.info>p`, (e) => {
                let str = $(e.currentTarget).attr('data-singer-name');
                str = encodeURIComponent(str);
                str = encodeURIComponent(str); //两次转码
                window.location.href = `./singer.html?name=${str}`;
            })
        }
    };
    controller.init(view, model);
}
