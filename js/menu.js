var videoConfig = [
    // video, title, description, mission name to load, position/rotation
    ["images/mainmenu_1.webm", "Small Island", "High speed asphalt and some technical dirt roads", "small_island.mis", "111.252 -375.783 30.0412 0 0 81.476"],
    ["images/mainmenu_2.webm", "Small Island", "High speed asphalt and some technical dirt roads", "small_island.mis", "111.252 -375.783 30.0412 0 0 81.476"],
    ["images/mainmenu_3.webm", "Small Island", "High speed asphalt and some technical dirt roads", "small_island.mis", "-354.373 170.426 39.4306 0 0 1 208.446"],
    ["images/mainmenu_4.webm", "Small Island", "High speed asphalt and some technical dirt roads", "small_island.mis", "111.252 -375.783 30.0412 -0.0613498 -0.0460925 0.997052 106.327"],
    ["images/mainmenu_5.webm", "Small Island", "High speed asphalt and some technical dirt roads", "small_island.mis", "-242.088 87.4816 39.6549 -0.00772832 -0.036043 0.99932 189.094"],
    ["images/mainmenu_6.webm", "Small Island", "High speed asphalt and some technical dirt roads", "small_island.mis", "16.6853 -395.176 31.446 0 0 1 73.887"],
    ["images/mainmenu_7.webm", "Small Island", "High speed asphalt and some technical dirt roads", "small_island.mis", "-172.176 235.843 48.1855 0 0 1 87.774"],
    ["images/mainmenu_8.webm", "Dry Rock Island", "A long abandoned industrial island", "dry_rock_island.mis", "-450.022 -106.288 63.4009 0 0 -1 4.68703"],
    ["images/mainmenu_9.webm", "Dry Rock Island", "A long abandoned industrial island", "dry_rock_island.mis", "-703.965 309.649 41.908 0 0 1 152.314"],
    ["images/mainmenu_10.webm", "Industrial", "Port, rallycross, circuit, offroad track", "dry_rock_island.mis", "216.223 116.715 42.6993 -0.0362537 0.0379904 -0.99862 87.399"],
];

var min_w = 300; // minimum video width allowed
var vid_w_orig;  // original video dimensions
var vid_h_orig;

var videoElement = null;

var fadeTime = 2; // in seconds

var randomArray = randomNumbers(videoConfig.length);

var randomPosition = -1;
var currentEntryID = -1;
var currentEntry = null;

function resizeToCover() {
    // set the video viewport to the window size
    $('#video-viewport').width($(window).width());
    $('#video-viewport').height($(window).height());

    // use largest scale factor of horizontal/vertical
    var scale_h = $(window).width() / vid_w_orig;
    var scale_v = $(window).height() / vid_h_orig;
    var scale = scale_h > scale_v ? scale_h : scale_v;

    // don't allow scaled width < minimum video width
    if (scale * vid_w_orig < min_w) { scale = min_w / vid_w_orig; }

    // now scale the video
    $('video').width(scale * vid_w_orig);
    $('video').height(scale * vid_h_orig);
    // and center it by scrolling the video viewport
    $('#video-viewport').scrollLeft(($('video').width() - $(window).width()) / 2);
    $('#video-viewport').scrollTop(($('video').height() - $(window).height()) / 2);
}


function checkTime() {
    if (videoElement.duration - videoElement.currentTime < fadeTime + 0.1) {
        $('#blending').fadeIn(fadeTime * 1000);
        setTimeout(checkTime, 4000);
    } else {
        setTimeout(checkTime, videoElement.duration - videoElement.currentTime - (fadeTime + 0.05) * 1000);
    }
}

function playNewEntry() {
    if (videoConfig.length < 1) return;

    randomPosition++;
    if (randomPosition == videoConfig.length) {
        randomPosition = 0;
        while (randomArray[0] == currentEntryID) {
            randomArray = randomNumbers(videoConfig.length);
        }
    }
    currentEntryID = randomArray[randomPosition];
    currentEntry = videoConfig[currentEntryID];

    // play the video
    $('#bgvid').attr("src", currentEntry[0]);
    videoElement.play();

    // update the info text
    $('#infobox').html(currentEntry[1] + '<br/>' + currentEntry[2]);
}

function gotGameVersion(versionStr) {
    $('#beamngversion').html('version ' + versionStr);
}
function gotSteamData(data) {
    //console.log("steam data:");
    //console.log(data);
    if(data.working && data.loggedin) {
        var t = '<b>' + data.playerName + '</b><br/>';
        if(data.branch != 'public')
            t += data.branch + '<br/>';
        if(data.language != 'english')
            t += data.language + '<br/>';
        $('#steaminfotext').html(t);
        $('#steaminfo').css("display","block");
    }
}
function timeSinceEpoch(epoch) {
    var date = new Date(0); // The 0 there is the key, which sets the date to the epoch
    date.setUTCSeconds(epoch);

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
        return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}
function parseBBCode(text) {
    text = text.replace(/\[url=http:\/\/([^\s\]]+)\s*\](.*(?=\[\/url\]))\[\/url\]/g, '<a href="http-external://$1">$2</a>');
    text = text.replace(/\[url\]http:\/\/(.*(?=\[\/url\]))\[\/b\]/g, '<a href="http-external://$1">$1</a>');
    text = text.replace(/\[ico=([^\s\]]+)\s*\](.*(?=\[\/ico\]))\[\/ico\]/g, '<img src="images/icons/$1.png">$2</a>');
    text = text.replace(/\[b\](.*(?=\[\/b\]))\[\/b\]/g, '<span style="font-family:OpenSans-ExtraBold">$1</span>');
    text = text.replace(/\[u\](.*(?=\[\/u\]))\[\/u\]/g, '<u>$1</u>');
    text = text.replace(/\[s\](.*(?=\[\/s\]))\[\/s\]/g, '<s>$1</s>');
    text = text.replace(/\[i\](.*(?=\[\/i\]))\[\/i\]/g, '<i>$1</i>');
    text = text.replace(/\[ico=([^\s\]]+)\s*\]/g, '<img class="ico" src="images/icons/$1.png"/>');
    text = text.replace(/\[pre\](.*(?=\[\/pre\]))\[\/pre\]/g, '<span class="bbcode-pre">$1</span>');
    text = text.replace(/\n/g, '<br/>');
    return text
}
function updateChangelog() {
    $.getJSON('versioninfo.json', function(data) {
        //console.log(data);

        $('#updates_box').css("display","block");
        if(data.autohide) {
            setTimeout(function () { $('#updates_box').css('left', '-514px'); }, 3000);
        }
        
        var headerhtml = "<table border='0' width='100%'><tr><td>" + data.title[0] + "</td>";
        if(data.title.length > 1) {
            headerhtml += "<td align='right' valign='bottom' class='updates_header_sub'>" + data.title[1] + "</td>";
        }
        headerhtml += "</tr></table>";
        $('#updates_header').html(headerhtml);

        var versionhtml = ''
        $.each(data.content, function(k, v) {
            versionhtml += "<div class='updates_versionheader'>";
            versionhtml += "<table border='0' width='100%'><tr><td>" + v.title;
            if(v.title == data.current) {
                versionhtml += " (current)";
            }
            if(typeof v.type !== 'undefined') {
                versionhtml += " (" + v.type + ")";
            }
            versionhtml += "</td>";

            if(typeof v.timestamp !== 'undefined') {
                versionhtml += "<td class='updates_versionheader_sub'> " + timeSinceEpoch(v.timestamp) + " ago</td>";
            }
            versionhtml += "</tr></table></div>";
            versionhtml += "<div class='updates_inner_scrolling'>";
            if(typeof v.content === 'undefined') {
                //console.log("error: content broken");
                //console.log(v.content);
            } else if(typeof v.content === 'string' ) {
                versionhtml += "<div class='updates_content'>" + parseBBCode(v.content) + "</div>";
                versionhtml += "<div class='updates_spacer'></div>";
            } else if(typeof v.content === "object") {
                $.each(v.content, function(k2, v2) {
                    versionhtml += "<div class='updates_subheader'><table border='0'><tr><td><img class='updates_contenticon' src='images/icons/" + v2.icon + ".png'/></td><td>" + k2 + "</td></tr></table></div>";
                    versionhtml += "<div class='updates_content'><ul>";
                    $.each(v2.list, function(k3, v3) {
                        versionhtml += "<li>" + parseBBCode(v3) + "</li>";
                    });
                    versionhtml += "</ul></div>";
                });
                versionhtml += "<div class='updates_spacer'></div>";
            }
            versionhtml += "</div>";
        });
        $('#updates_inner').html(versionhtml);
    }).fail(function(jqxhr, textStatus, error) {
        $('#updates_box').css("display","none");
        console.log("error "+error+" : "+textStatus );
    });
}

function windowResized() {
    $("#menu").height($(window).height());
}

$(document).ready(function () {
    $("#bootfader").fadeOut(600);

    //setTimeout(function () { $('#menu').css('right', '-160px'); }, 3000); /* Change 'left' to 'right' for panel to appear to the right */
    //setTimeout(function () { $('#updates_box').css('left', '-514px'); }, 3000);

    videoElement = document.getElementById('bgvid');

    playNewEntry();
    $('#blending').fadeOut(fadeTime * 1000);

    $('#bgvid').bind('ended', function (event) {
        playNewEntry();
        $('#blending').fadeOut(fadeTime * 1000);
    });

    // fixes video size
    vid_w_orig = parseInt($('video').attr('width'));
    vid_h_orig = parseInt($('video').attr('height'));
    $(window).resize(function () { resizeToCover(); });
    $(window).trigger('resize');

    // run blending
    checkTime();

    // fix layout
    $(window).on('resize', function() {
        windowResized();
    });
    windowResized();

    // run beamng things
    if(typeof beamng !== 'undefined') {
        beamng.requestVersionInfo();
        beamng.requestSteamInfo();
        updateChangelog();
    }

});
