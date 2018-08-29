{
    let view={
        el:'.mask',
        template:`<div class="loading">
        <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-shangchuanzhong"></use>
        </svg></div>`,
        render(){
            $(this.el).html(this.template);
        },
        active(){
            $(this.el).addClass('active');
        },
        deactive(){
            $(this.el).removeClass('active');
        }
    };
    let controller={
        view:null,
        init(view){
            this.view=view;
            this.view.render();
            this.bindEventHub();
        },
        bindEventHub(){
            window.eventHub.on('before-upload',()=>{
                this.view.active();
            });
            window.eventHub.on('upload-done',()=>{
                this.view.deactive();
            });
        }
    };
    controller.init(view);
}