{
    let view = {
        el: '.top',
        template: `<header>
        <div class="logo">
            <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-music"></use>
            </svg>
            <p>网易云音乐</p>
        </div>
        <div>下载APP</div>
    </header>
    <nav>
        <ul class="topnav">
            <li class="active">推荐</li>
            <li class="">排行榜</li>
            <li class="">搜索</li>
        </ul>
        <hr>
    </nav>`,
        render(data) {
            $(this.el).html(this.template);
        }
    };
    let model = {};
    let controller = {
        view: null,
        model: null,
        init(view, model) {
            this.view = view;
            this.model = model;
            this.view.render(this.model.data);
            this.bindEvents();
        },
        bindEvents() {
            $(this.view.el).on('click', 'li', (e) => {
                $(e.currentTarget).addClass('active').siblings().removeClass('active');
            })
        }
    };
    controller.init(view, model);
}