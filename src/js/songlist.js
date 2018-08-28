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
            })
        },
        update(data){
            let selectId=data.selectId;
            let songs=data.songs;
            let template=`<div class="songicon">
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
        </div>`;
        songs.map((song)=>{
            let {name,singer,url,id}=song;
            let html=template.replace('__name__',name)
            .replace('__singer__',singer).replace('__url__',url);
            $(this.el).find(`[data-song-id=${selectId}]`).html(html);
        })
        },
        delete(data){
            let deleteID=data.selectId;
            $(this.el).find(`[data-song-id=${deleteID}]`).remove();
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
                responses.map((response)=>{
                    let song=response.attributes;
                    song['id']=response.id;
                    this.data.songs.push(song);
                });
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
            });
            $(this.view.el).find('ul').on('click','li',(e)=>{
             this.model.data.selectId = e.currentTarget.getAttribute('data-song-id');
            $(e.currentTarget).addClass('active').siblings().removeClass('active');
             let data=JSON.parse(JSON.stringify(this.model.data));
             window.eventHub.emit('click-songlist',data);
            })
        },
        bindEventHub(){
            window.eventHub.on('save-done',(data)=>{
                this.view.render(data);  //渲染页面
                $(this.view.el).find('ul>li:last-child>.add').addClass('active');
            });
            window.eventHub.on('click-change',(data)=>{
                this.view.update(data);
            });
            window.eventHub.on('click-delete',(data)=>{
                this.view.delete(data);
            })
        }
    };
    controller.init(view, model);
}