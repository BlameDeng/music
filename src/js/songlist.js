{
    let view = {
        el: 'aside',
        template: `<li><div class="songicon">
            <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-yinle"></use>
            </svg>
        </div>
        <div class="songinfo">
            <p>__name__</p>
            <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-geshou"></use>
            </svg>
            <span>__singer__</span>
        </div>
        <div class="add">
            <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-chenggongtianjia-"></use></svg>
        </div></li>`,
        render(data) {
            let songs=data.songs;  //是个对象数组
            songs.map((song)=>{
                let {name,singer,url,id}=song;
                let html=this.template.replace('__name__',name)
                .replace('__singer__',singer).replace('__url__',url);
                let domli=$(html).attr('data-song-id',id);
                $(this.el).find('ul').append(domli);
                $(this.el).find('ul>li:last-child>.add').addClass('active');
            })
        }
    };

    let model = {
        data: {
            songs: [],
            selectId: null
        },
        fetch(){
            var query = new AV.Query('Song');
           return query.find().then((responses)=>{  //数组
            responses.forEach(function(response) {
                response.set('status', 1);
              });
              return AV.Object.saveAll(responses);
            }).then((responses)=> {
                // 更新成功
                console.log(responses)
                responses.map((response)=>{
                    let song=response.attributes;
                    song['id']=response.id;
                    this.data.songs.push(song);
                });
                console.log(this.data)
              }, function (error) {
                // 异常处理
              });
        }
    };

    let controller = {
        view: null,
        model: null,
        init(view, model) {
            this.view = view;
            this.model = model;
            this.model.fetch().then(()=>{
                this.view.render(this.model.data);
            })
            this.bindEvents();
            this.bindEventHub();
        },
        bindEvents() {
            $(this.view.el).on('click', '.addSong', (e) => {
                window.eventHub.emit('click-add');
            })
        },
        bindEventHub(){
            window.eventHub.on('save-done',(data)=>{
                this.view.render(data);  //渲染页面
            })
        }
    };
    controller.init(view, model);
}