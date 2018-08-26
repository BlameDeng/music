{
    let view = {
        el: 'aside',
        template: `<ul class="songList">
       <li>
           <div class="songicon"><svg class="icon" aria-hidden="true">
                   <use xlink:href="#icon-yinle"></use>
               </svg>
           </div>
           <div class="songinfo">
               <p>歌曲11111111111111111111</p>
               <svg class="icon" aria-hidden="true">
                   <use xlink:href="#icon-geshou"></use>
               </svg>
               <span>歌手1</span>
           </div>
       </li>
       <li class="active">
           <div class="songicon"><svg class="icon" aria-hidden="true">
                   <use xlink:href="#icon-yinle"></use>
               </svg>
           </div>
           <div class="songinfo">
               <p>to be</p>
               <svg class="icon" aria-hidden="true">
                   <use xlink:href="#icon-geshou"></use>
               </svg>
               <span>歌手2</span>
           </div>
       </li>
       <li>
           <div class="songicon"><svg class="icon" aria-hidden="true">
                   <use xlink:href="#icon-yinle"></use>
               </svg>
           </div>
           <div class="songinfo">
               <p>to be</p>
               <svg class="icon" aria-hidden="true">
                   <use xlink:href="#icon-geshou"></use>
               </svg>
               <span>歌手1</span>
           </div>
       </li>
   </ul>
   <div class="addSong"><svg class="icon" aria-hidden="true">
           <use xlink:href="#icon-ttpodicon"></use>
       </svg><span>新增歌曲</span></div>` ,
        render(data) {
            $(this.el).html(this.template);
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

            this.view.render(this.model.data);
            this.bindEvents();
        },

        bindEvents() {
            $(this.view.el).on('click', '.addSong', () => {
                window.eventHub.emit('add');  //add事件，用户点击了新建歌曲
            })
        },
    }
    controller.init(view, model);
}