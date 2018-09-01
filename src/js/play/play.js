{
    let view = {
        el: '#el',
        template: `<header>
        <p>{{name}}</p>
        <p>{{singer}}</p>
    </header>
    <div class="distwrapper">
        <div class="pointer"><img src="./img/pointer.png" alt=""></div>
        <div class="innerdist">
        <div class="cover"><img src="{{cover}}" alt=""></div>
        <div class="dist"><img src="./img/dist.png" alt=""></div>
        <div class="dist-light"><img src="./img/dist-light.png" alt=""></div>
        </div>
    </div>`,
        render(data) {
            let { name, singer, url, cover, wordarr, timearr } = data;
            if(cover===''){cover=`./img/default-cover.jpg`};
            let html = this.template.replace('{{name}}', name).replace('{{singer}}', singer)
                .replace('{{cover}}', cover);
            $(this.el).html(html);

            $('audio').attr('src', url);

            for (let i = 0; i < wordarr.length; i++) {
                let word = wordarr[i];
                let domp = $(`<p>${word}</p>`);
                let time = timearr[i];
                domp.attr('data-song-time', time);
                $('.lrc').append(domp);
            }
        },
        active(...els) {
            for (let i = 0; i < els.length; i++) {
                $(els[i]).addClass('active');
            }
        },
        deactive(...els) {
            for (let i = 0; i < els.length; i++) {
                $(els[i]).removeClass('active');
            }
        }
    };
    let model = {
        data: {}
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
                let { lrc, url, name, cover, singer } = song.attributes;
                let lrcarr = [];
                let regexp = /\[([\d]{2}):([\d]{2})\.([\d]{2})\](.*)/;
                let templrcarr = lrc.split('\n');
                templrcarr.map((item) => {
                    let arr = item.match(regexp);
                    if (arr !== null) {
                        lrcarr.push(arr);
                    }
                });
                let wordarr = [], timearr = [];
                lrcarr.map((arr) => {
                    wordarr.push(arr[4]);
                    let time = (+arr[1]) * 60 + (+arr[2]) + (+arr[3]) / 100
                    timearr.push(time)
                })
                this.model.data = { wordarr, timearr, url, name, singer, cover };
            }, function (error) {
                // 异常处理
            });
        },
        bindEvents() {
            let audio = $('audio')[0];
            $('.btn').on('click', 'span.play', (e) => {
                $(e.currentTarget).removeClass('active');
                this.view.active('span.pause', 'div.pointer');
                $('.innerdist').addClass('active').removeClass('pause');
                audio.play();
            })
            $('.btn').on('click', 'span.pause', (e) => {
                $(e.currentTarget).removeClass('active');
                $('.innerdist').addClass('pause');
                $('div.pointer').removeClass('active');
                $('span.play').addClass('active');
                audio.pause();
            })
            $('.btn').on('click', 'span.stop', (e) => {
                audio.currentTime = 0;
                audio.pause();
                $('span.play').addClass('active');
                this.view.deactive('span.pause', 'div.pointer', '.innerdist');
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
            $('.btn').on('click', 'span.lrcT', (e) => {
                $(e.currentTarget).removeClass('active');
                $('span.lrcF').addClass('active');
                $('.lrc').removeClass('active');
            })
            $('.btn').on('click', 'span.lrcF', (e) => {
                $(e.currentTarget).removeClass('active');
                this.view.active('span.lrcT', '.lrc')
            })
            $('audio').on('timeupdate', (e) => {
                let timearr = this.model.data.timearr;
                let currentTime = e.target.currentTime;
                let fullTime = e.target.duration;
                let progress = `${currentTime / fullTime * 100}%`
                $('.current').css('width', progress);
                for (let i = 0; i < timearr.length - 1; i++) {
                    if (currentTime >= timearr[i] && currentTime < timearr[i + 1]) {
                        $(`.lrc>p`).css('transform', `translateY(${-20 * i}px)`)
                    }
                }
            })
        }
    };
    controller.init(view, model);
}