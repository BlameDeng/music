let search = window.location.search;
if (search.indexOf('?') === 0) {
    search = search.substring(1);
};
let array = search.split('&').filter((v) => v);
let listId;
for (let i = 0; i < array.length; i++) {
    let arr = array[i].split('=');
    if (arr[0] === 'listid') {
        listId = arr[1];
        break;
    };
};

var query = new AV.Query('SongList');
query.get(listId).then((songlist) => {
    console.log(songlist);
}, function (error) {
    // 异常处理
});