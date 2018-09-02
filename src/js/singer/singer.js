{
    let search = window.location.search;
    if (search.indexOf('?') === 0) {
        search = search.substring(1);
    };
    let array = search.split('&').filter((v) => v);
    let name;
    for (let i = 0; i < array.length; i++) {
        arr = array[i].split('=');
        if (arr[0] === 'name') {
            name = arr[1];
            break;
        }
    };
    name = decodeURIComponent(name);
    name = decodeURIComponent(name);
}