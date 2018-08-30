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
        }
    };
    controller.init(view, model);
}

let audio = $('audio')[0];
$('.btn').on('click', 'span.play', (e) => {
    $(e.currentTarget).removeClass('active');
    $('span.pause').addClass('active');
    $('div.pointer').addClass('active');
    $('audio')[0].play();
})
$('.btn').on('click', 'span.pause', (e) => {
    $(e.currentTarget).removeClass('active');
    $('div.pointer').removeClass('active');
    $('span.play').addClass('active');
    $('audio')[0].pause();
})
$('.btn').on('click', 'span.stop', (e) => {
    $('audio')[0].currentTime = 0;
    $('audio')[0].pause();
    $('span.play').addClass('active');
    $('span.pause').removeClass('active')
    $('div.pointer').removeClass('active');
})
$('.btn').on('click', 'span.mutedT', (e) => {
    $(e.currentTarget).removeClass('active');
    $('span.mutedF').addClass('active');
    audio.volume=0;
})
$('.btn').on('click', 'span.mutedF', (e) => {
    $(e.currentTarget).removeClass('active');
    $('span.mutedT').addClass('active');
    audio.volume=1;
})

let currentTime, fullTime;
let progress;
$('audio')[0].ontimeupdate = () => {
    currentTime = audio.currentTime;
    fullTime = audio.duration;
    progress = `${currentTime / fullTime * 100}%`
    $('.current').css('width', progress);
}