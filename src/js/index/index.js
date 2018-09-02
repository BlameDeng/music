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