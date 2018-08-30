{
    let view = {
        el: '.app',
        // template: `<audio src="__url__"></audio>`,
        render(data) {
            let url = data.attributes.url;
            $(this.el).find('audio').attr('src', url);
        }
    };
    let model = {
        data: {},
    };
    let controller = {
        view: null,
        model: null,
        init(view, model) {
            this.view = view;
            this.model = model;
            this.fetch().then(() => {
                this.view.render(this.model.data);
            });
            this.bindEvents();
        },
        getId() {
            let search = window.location.search;
            if (search.indexOf('?') === 0) {
                search = search.substring(1);
            }
            let array = search.split('&').filter((n) => {
                return n;
            })
            let id = undefined;
            for (let i = 0; i < array.length; i++) {
                let key = array[i].split('=')[0];
                let value = array[i].split('=')[1];
                if (key === 'id') {
                    id = value;
                    break;
                }
            };
            return id;
        },
        fetch() {
            let query = new AV.Query('Song');
            let id = this.getId();
            return query.get(id).then((song) => {
                // song 就是 id 对象实例 attributes,id
                this.model.data = song;
            }, function (error) {
                // 异常处理
            });
        },
        bindEvents() {
            let audio = $('audio')[0];
            $('.btn').on('click', 'span.play', (e) => {
                $(e.currentTarget).removeClass('active');
                $('span.pause').addClass('active');
                $('div.pointer').addClass('active');
                $('div.cover').addClass('active').removeClass('pause');
                audio.play();
            })
            $('.btn').on('click', 'span.pause', (e) => {
                $(e.currentTarget).removeClass('active');
                $('div.pointer').removeClass('active');
                $('div.cover').addClass('pause');
                $('span.play').addClass('active');
                audio.pause();
            })
            $('.btn').on('click', 'span.stop', (e) => {
                audio.currentTime = 0;
                audio.pause();
                $('span.play').addClass('active');
                $('span.pause').removeClass('active')
                $('div.pointer').removeClass('active');
                $('div.cover').removeClass('active');
            })
            $('.btn').on('click', 'span.volumeT', (e) => {
                $(e.currentTarget).removeClass('active');
                $('span.volumeF').addClass('active');
                audio.volume = 0;
            })
            $('.btn').on('click', 'span.volumeF', (e) => {
                $(e.currentTarget).removeClass('active');
                $('span.volumeT').addClass('active');
                audio.volume = 1;
            })

            let currentTime, fullTime;
            let progress;
            audio.ontimeupdate = () => {
                currentTime = audio.currentTime;
                fullTime = audio.duration;
                progress = `${currentTime / fullTime * 100}%`
                $('.current').css('width', progress);
            }
        }
    };
    controller.init(view, model);
}