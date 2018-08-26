window.eventHub = {
    events: {},  //空的hash 形如"eventName":[fn1,fn2,fn3]

    on(eventName, fn) {  //订阅事件，fn为触发事件的回调
        if (this.events[eventName]===undefined) {  //如果events没有eventName这个属性，则定义一个，对应空数组，这样events里就有了事件
            this.events[eventName] = [];
        };
        this.events[eventName].push(fn);  //把回调添加到对应事件的数组
    },

    emit(eventName, data) {  //发布事件，接受两个参数，事件名和数据
        for (let key in this.events) {
            if (key === eventName) { //遍历，如果key===eventName，则找到了这个事件，拿到对应回调
                let fnArray = this.events[key];  //拿到的回调是个数组
                fnArray.map((fn) => {
                    fn(data);  //map这个数组，调用里面的函数，传参data
                })
            }
        }
    }
}