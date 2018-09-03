{
        let view = {
                el: '.edit',
                template: `<p class="editinfo">请编辑歌单信息</p>
                <form>
                    <div class="row"><span>歌单名称：</span><input type="text" name="name" value="__name__"></div>
                    <div class="row"><span>封面链接：</span><input type="text" name="listcover" value="__listcover__"></div>
                    <div class="row"><span>歌单描述：</span><textarea>__summary__</textarea></div>
                    <div class="row"><button type="submit" class="submit">新建</button><button type="button" class="change">修改</button></div>
                </form>`,
                render(data) {
                        let { name = '', listcover = '', summary = '' } = data.selectlist;
                        let html = this.template.replace('__name__', name).replace('__listcover__', listcover)
                                .replace('__summary__', summary);
                        $(this.el).html(html);
                }
        };
        let model = {
                data: { selectlist: '' },
                save(name, listcover, summary) {
                        // 声明类型
                        var SongList = AV.Object.extend('SongList');
                        // 新建对象
                        var songlist = new SongList();
                        // 设置名称
                        songlist.set('name', name);
                        songlist.set('listcover', listcover);
                        songlist.set('summary', summary);
                        // 设置优先级
                        songlist.set('priority', 1);
                        return songlist.save().then(function (songlist) {
                                
                        }, function (error) {
                                console.error(error);
                        });
                },
                update(name, listcover, summary, id) {
                        // 第一个参数是 className，第二个参数是 objectId
                        var songlist = AV.Object.createWithoutData('SongList', id);
                        songlist.set('name', name);
                        songlist.set('listcover', listcover);
                        songlist.set('summary', summary);
                        songlist.save();
                },
        }
        let controller = {
                view: null,
                model: null,
                init(view, model) {
                        this.view = view;
                        this.model = model;
                        this.view.render(this.model.data);
                        this.bindEvents();
                        this.bindEventHub();
                },
                bindEvents() {
                        $(this.view.el).on('submit', 'form', (e) => {
                                e.preventDefault();
                                let name = $(this.view.el).find(`input[name='name']`).val().trim();
                                let listcover = $(this.view.el).find(`input[name='listcover']`).val().trim();
                                let summary = $(this.view.el).find(`textarea`).val().trim();
                                this.model.save(name, listcover, summary);
                                window.eventHub.emit('addnewlist');
                        });
                        $(this.view.el).on('click', '.change', () => {
                                let name = $(this.view.el).find(`input[name='name']`).val().trim();
                                let listcover = $(this.view.el).find(`input[name='listcover']`).val().trim();
                                let summary = $(this.view.el).find(`textarea`).val().trim();
                                let id = this.model.data.selectlist.id;
                                this.model.update(name, listcover, summary, id);
                        })
                },
                bindEventHub() {
                        window.eventHub.on('click-list', (obj) => {
                                this.model.data.selectlist = obj;
                                this.view.render(this.model.data);
                                $(this.view.el).find(`[type='submit']`).attr('disabled', true);
                        })
                }
        };
        controller.init(view, model);
}