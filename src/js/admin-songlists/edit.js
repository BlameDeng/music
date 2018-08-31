{
        let view = {
                el: '.edit',
                template: `<p class="editinfo">请编辑歌单信息</p>
                <form>
                    <div class="row"><span>歌单名称：</span><input type="text" name="name" value="__name__"></div>
                    <div class="row"><span>封面链接：</span><input type="text" name="listcover" value="__listcover__"></div>
                    <div class="row"><span>歌单描述：</span><textarea>__summary__</textarea></div>
                    <div class="row"><button type="submit" class="submit">保存</button><button type="button" class="change">修改</button></div>
                </form>`,
                render(data) {
                        $(this.el).html(this.template);
                }
        };
        let model = {
                data: {},
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
                                console.log(songlist);
                        }, function (error) {
                                console.error(error);
                        });
                }
        }
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
                        $(this.view.el).on('submit', 'form', (e) => {
                                e.preventDefault();
                                let name = $(this.view.el).find(`input[name='name']`).val();
                                let listcover = $(this.view.el).find(`input[name='listcover']`).val();
                                let summary = $(this.view.el).find(`textarea`).val();
                                this.model.save(name, listcover, summary);
                        })
                }
        };
        controller.init(view, model);
}