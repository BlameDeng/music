{
    let view = {
        el: 'aside',
        template: `
           <li><div class="songicon"><svg class="icon" aria-hidden="true">
                   <use xlink:href="#icon-yinle"></use>
               </svg>
           </div>
           <div class="songinfo">
               <p>__name__</p>
               <svg class="icon" aria-hidden="true">
                   <use xlink:href="#icon-geshou"></use>
               </svg>
               <span>__singer__</span>
           </div></li>` ,
        render(data) {
            let songs = data;  //对象数组
            songs.map((song) => {
                let { id, name, singer, url } = song;

                html = this.template.replace(`__name__`, name).replace('__singer__', singer);
                let domli = $(html);
                domli.attr('data-song-id', id);
                $(this.el).find('ul').append(domli);
            })
        }
    };

    let model = {
        data: {
            songs: []
        },
        fetch() {
            let query = new AV.Query('Song');
            return query.find().then((songs) => {
                let array = [];
                songs.map((song) => {
                    let id = song.id;
                    let { name, singer, url } = song.attributes;
                    let obj = {
                        'id': id,
                        'name': name,
                        'singer': singer,
                        'url': url
                    }
                    array.push(obj);
                });
                this.data.songs = array
            }).then((songs) => {
                //成功处理
            }, function (error) {
                // 异常处理
            });
        },
    };

    let controller = {
        view: null,
        model: null,

        init(view, model) {
            this.view = view;
            this.model = model;

            this.model.fetch().then(() => {
                this.view.render(this.model.data.songs);
            })
            // this.view.render(this.model.data);
            this.bindEvents();
            this.bindEventHub();
        },

        bindEvents() {
            $(this.view.el).on('click', '.addSong', () => {
                window.eventHub.emit('add');  //add事件，用户点击了新建歌曲
            })
        },
        bindEventHub() {
            window.eventHub.on('save', (data) => {  //data是个对象
                let array = Array(data);
                this.view.render(array);
                $(this.view.el).find(`li[data-song-id='']`).addClass('active');
            })
        },
    }
    controller.init(view, model);
}