$(document).ready(function () {

    $("#menu").height($(document).height());

    setTimeout(function () { $('#menu').css('right', '-160px'); }, 3000); /* Change 'left' to 'right' for panel to appear to the right */

    $("#start_utah").click(function () { beamng.sendGameEngine('StartLevel("Utah", "SinglePlayer");'); });

    //$(".icon").hover(function () {
    //    $(this).show("slide", { direction: "left" }, 3000);  //toggleClass("hover");
    //});

    //$("#menu").hover(function () { $(this).show("slide", { direction: "left" }, 1000); },function () { $(this).hide("slide", { direction: "right" }, 1000); });
});
