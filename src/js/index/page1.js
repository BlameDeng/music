//let middle right

setInterval(()=>{
$('.left').addClass('right').removeClass('left');
$('.middle').addClass('left').removeClass('middle');
$('.right').addClass('middle').removeClass('right');
},3000)