{
    let view = {
        el: 'div.play-out-page',
        template: `<div class="wrapper">
    <div class="pre"><svg class="icon" aria-hidden="true"><use xlink:href="#icon-leftt-2"></use>
        </svg></div>
    <header>
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
    </div>
    <div class="lrc"></div>
    <footer>
        <div class="progress">
            <p class="current"></p>
        </div>
        <div class="btn">
            <span class="stop"><svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-tingzhi"></use>
                </svg></span>
            <span class="play active"><svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-bofang1-copy"></use>
                </svg></span>
            <span class="pause"><svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-zanting"></use>
                </svg></span>
            <span class="volumeT active"><svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-yinliang1"></use>
                </svg></span>
            <span class="volumeF"><svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-yinliang1-copy"></use>
                </svg></span>
            <span class="lrcT"><svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-zhuomiangeci1"></use>
                </svg></span>
            <span class="lrcF active"><svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-zhuomiangeci1-copy"></use>
                </svg></span>
        </div>
    </footer>
</div>`,
        render(data) {
            let { name, singer, url, cover, wordarr, timearr } = data;
            if (cover === '') { cover = `./img/default-cover.jpg` };
            let html = this.template.replace('{{name}}', name).replace('{{singer}}', singer)
                .replace('{{cover}}', cover);
            $(this.el).html(html);

            $('#audio').attr('src', url);

            for (let i = 0; i < wordarr.length; i++) {
                let word = wordarr[i];
                let domp = $(`<p>${word}</p>`);
                let time = timearr[i];
                domp.attr('data-song-time', time);
                $('.lrc').append(domp);
            };
            $('div.play-out-page').addClass('active');
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
        data: { songId: undefined }
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
        fetch(obj) {
            return new Promise((resolve, reject) => {
                let { lrc, url, name, cover, singer, id } = obj;
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
                });
                this.model.data = { wordarr, timearr, url, name, singer, cover, lrc, id };
                resolve(this.model.data);
            });
        },
        bindEvents() {
            $(this.view.el).on('click', '.pre', () => {
                $('div.play-out-page').removeClass('active');
            });
            let audio = $('#audio')[0];
            $(this.view.el).on('click', 'span.play', (e) => {
                $(e.currentTarget).removeClass('active');
                this.view.active('span.pause', 'div.pointer');
                $(this.view.el).find('.innerdist').addClass('active').removeClass('pause');
                audio.play();
            })
            $(this.view.el).on('click', 'span.pause', (e) => {
                $(e.currentTarget).removeClass('active');
                $(this.view.el).find('.innerdist').addClass('pause');
                $(this.view.el).find('div.pointer').removeClass('active');
                $(this.view.el).find('span.play').addClass('active');
                audio.pause();
            })
            $(this.view.el).on('click', 'span.stop', (e) => {
                audio.currentTime = 0;
                $(this.view.el).find(`.lrc>p`).css('transform', `translateY(0)`);
                audio.pause();
                $(this.view.el).find('span.play').addClass('active');
                this.view.deactive('span.pause', 'div.pointer', '.innerdist');
            })
            $(this.view.el).on('click', 'span.volumeT', (e) => {
                $(e.currentTarget).removeClass('active');
                $(this.view.el).find('span.volumeF').addClass('active');
                audio.volume = 0;
            })
            $(this.view.el).on('click', 'span.volumeF', (e) => {
                $(e.currentTarget).removeClass('active');
                $(this.view.el).find('span.volumeT').addClass('active');
                audio.volume = 1;
            })
            $(this.view.el).on('click', 'span.lrcT', (e) => {
                $(e.currentTarget).removeClass('active');
                $(this.view.el).find('span.lrcF').addClass('active');
                $(this.view.el).find('.lrc').removeClass('active');
            })
            $(this.view.el).on('click', 'span.lrcF', (e) => {
                $(e.currentTarget).removeClass('active');
                this.view.active('span.lrcT', '.lrc')
            })
            $(audio).on('timeupdate', (e) => {
                let timearr = this.model.data.timearr;
                let currentTime = e.target.currentTime;
                let fullTime = e.target.duration;
                let progress = `${currentTime / fullTime * 100}%`
                $(this.view.el).find('.current').css('width', progress);
                for (let i = 0; i < timearr.length - 1; i++) {
                    if (currentTime >= timearr[i] && currentTime < timearr[i + 1]) {
                        $(this.view.el).find(`.lrc>p`).css('transform', `translateY(${-20 * i}px)`);
                    }
                }
            })
        },
        bindEventHub() {
            window.eventHub.on('click-li-play', (data) => {
                this.fetch(data).then(() => {
                    this.view.render(this.model.data);
                    $(this.view.el).find(`.lrc>p`).css('transform', `translateY(0)`);
                    $(this.view.el).find('.current').css('width', 0);
                    $(this.view.el).find('span.play').addClass('active');
                    this.view.deactive('span.pause', 'div.pointer', '.innerdist');
                });
            });
        }
    };
    controller.init(view, model);
}