{
    let view = {
        el: '.play-in-page',
        template: `<footer><div class="progress">
        <p class="current"></p></div><div class="play">
        <div class="coverwrapper">
        <img src="__cover__" alt="" id="song-cover"></div>
        <p>__name__</p><div class="btns">
        <span class="play active" id="play"><svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-bofang1"></use></svg></span>
        <span class="pause" id="pause"><svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-zanting-copy"></use></svg></span>
        <span class="stop" id="stop"><svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-tingzhi-copy"></use></svg></span>
        </div></div></footer>`,
        render(data) {
            console.log(data)
            let { name, cover } = data;
            if (cover === '') {
                cover = './img/default-cover.jpg'
            };
            let html = this.template.replace('__cover__', cover).replace('__name__', name);
            $(this.el).html(html);
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
            this.bindEventHub();
            this.bindEvents();
        },
        bindEventHub() {
            window.eventHub.on('click-li-play', (data) => {
                this.view.render(data);
            });
        },
        bindEvents() {
            let audio=$('#audio').get(0);
            $(this.view.el).on('click', '#play', () => {
                audio.play();
                $(this.view.el).find('#play').removeClass('active');
                $(this.view.el).find('#pause').addClass('active');
            });
            $(this.view.el).on('click', '#pause', () => {
                audio.pause();
                $(this.view.el).find('#pause').removeClass('active');
                $(this.view.el).find('#play').addClass('active');
            });
            $(this.view.el).on('click', '#stop', () => {
                audio.pause();
                audio.currentTime = 0;
                $(this.view.el).find('#pause').removeClass('active');
                $(this.view.el).find('#play').addClass('active');
            });
            $('#audio').on('timeupdate', () => {
                let pro = (audio.currentTime) / (audio.duration) * 100;
                $(this.view.el).find('.current').css('width', `${pro}%`);
            });
        }
    };
    controller.init(view, model);
}