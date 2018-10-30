function printDiv(divName) {
    var printContents = document.getElementById(divName).innerHTML;
    var originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;

    window.print();

    document.body.innerHTML = originalContents;
}


//  review
let rate_input = document.getElementById('rate_input');
let rate_read_only = document.getElementById('rate_read_only').value;
let review_form = document.getElementById('review_form');

$(function () {

    $("#rateYo").rateYo({
        minValue: 1,
        numStars: 5,
        fullStar: true,
        rating: 5,
        //  rtl: true,
        starWidth: "25px",
        onSet: function (rating, rateYoInstance) {
            rate_input.value = rating;
        }

    });

    $("div[id=rateYoRead]").rateYo({
        minValue: 1,
        numStars: 5,
        readOnly: true,
        fullStar: true,
        rating: rate_read_only,
        //  rtl: true,
        starWidth: "20px",


    });
});




