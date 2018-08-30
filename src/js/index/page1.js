{
    let view = {
        el: '.page1',
        template: `<section class="banner">
        <div class="slides">
            <div class="swiper-container">
                <div class="swiper-wrapper">
                    <div class="swiper-slide"><img src="./img/slide.png" alt=""></div>
                    <div class="swiper-slide"><img src="./img/slide.png" alt=""></div>
                    <div class="swiper-slide"><img src="./img/slide.png" alt=""></div>
                    <div class="swiper-slide"><img src="./img/slide.png" alt=""></div>
                    <div class="swiper-slide"><img src="./img/slide.png" alt=""></div>
                </div>
            </div>
            <div class="recomWrapper">    
            <div class="recommendation clearfix active">
                <div class="true">
                    <div><img src="./img/art1.jpg" alt=""></div>
                    <div><img src="./img/art2.png" alt=""></div>
                    <div><img src="./img/art1.jpg" alt=""></div>
                    <div><img src="./img/art2.png" alt=""></div>
                </div>
                <div class="fake">
                    <div><img src="./img/art1.jpg" alt=""></div>
                    <div><img src="./img/art2.png" alt=""></div>
                    <div><img src="./img/art1.jpg" alt=""></div>
                    <div><img src="./img/art2.png" alt=""></div>
                </div>
            </div>
            </div>
        </div>
    </section>
    <section class="newSong">
        <h2>最新音乐</h2>
        <ol></ol>
    </section>`,
    templateLi:`<li>
    <div class="songicon">
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
    <div class="play">
        <a href="./play.html?id=__id__"> <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-Symbols4"></use>
            </svg></a>
    </div>
</li>`,
        render(data) {
            $(this.el).html(this.template);
        },
        addLi(data){
            let songs=data.songs;
            songs.map((song)=>{
                let {name,id,singer,url}=song;
                let html=this.templateLi.replace('__name__',name).replace('__singer__',singer)
                .replace('__id__',id);
                let domLi=$(html);
                $(this.el).find('ol').append(domLi);
            });
        }
    };
    let model = {
        data: {
            songs: []
        },
        fetch() {
            var query = new AV.Query('Song');
            return query.find().then(function (songs) {
                songs.forEach(function (song) {
                    song.set('status', 1);
                });
                return AV.Object.saveAll(songs);
            }).then((songs) => { //songs对象数组 song有id和attributes属性
                // 更新成功
                songs.map((song) => {
                    let id = song.id;
                    let {
                        name,
                        url,
                        singer
                    } = song.attributes;
                    let data = {
                        name: name,
                        singer: singer,
                        url: url,
                        id: id
                    };
                    this.data.songs.push(data);
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
                this.view.addLi(this.model.data);
            })
            this.view.render(this.model.data);
        }
    };
    controller.init(view, model);
}