let lastActive;

$('.nav-item').on('click', function () {
    $(lastActive).removeClass('active');
    $(this).addClass('active');
    lastActive = this;
});


$('#volume-contour').on('click', function () {
    prepareDiv();
});
$('#sliced-image').on('click', function () {
    prepareDiv();
});
$('#render-volume').on('click', function () {
    prepareDiv()
});

$('#color-transform').on('click', function () {
    prepareDiv()
});

function prepareDiv() {
    $('#main-container').empty();
    setTimeout(function () {
        let divs = $('#main-container > div');
        if (divs.length = 2) {
            let menu = divs[1];
            $(menu).css({
                'top':'100px'
            }).addClass('control-panel')
        }
    }, 100);
}

