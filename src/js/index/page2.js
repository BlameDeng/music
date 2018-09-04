{
    let view = {
        el: '.page2',
        tempalate: `<header>官方榜</header>
        <main><div class="new"><img src="./img/new.png" alt=""><ol></ol>
        </div><div class="hot"><img src="./img/hot.png" alt=""><ol></ol></div></main>`,
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
