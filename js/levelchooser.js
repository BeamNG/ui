var levelList = [],
    selectedIndex = null,
    dblClickDelay = null;

function listColoring(name) {
    var newIndex = null;

    var list = document.getElementsByName(name);
    for (var i = 0; i < list.length; i++) {
        if (list[i].checked) {
            list[i].parentNode.style.backgroundColor = "rgb(253, 141, 0)";
            newIndex = i;
        } else {
            list[i].parentNode.style.backgroundColor = "white";
        }
    }

    selectedIndex = newIndex;

    return newIndex;
}

function createOptionsList(list, name, indexPrechecked) {
    var html = "";
    for (var i = 0; i < list.length; i++) {
        html += '<div class="listElement hoverDes" title="' + list[i].description + '">';
        html += '<input type="radio" id="' + name + list[i].value + '" value="' + list[i].value + '" name="' + name + '" ' +
        (i == indexPrechecked ? "checked " : "") + '>';
        html += '<label for="' + name + list[i].value + '">';
        html += '<img src="' + list[i].img + '" width="250" height="120">';
        html += '<p>' + list[i].name + '</p>';
        html += '</label>';
        html += '</div>';
    }
    return html;
}

function initOptionsList(wrapperId, list, name, indexPrechecked) {
    var oldIdx;

    console.log( document.getElementById(wrapperId))
    document.getElementById(wrapperId).innerHTML = createOptionsList(list, name, indexPrechecked);

    listColoring(name);

    changeDescription(levelList[indexPrechecked].description, levelImgPath(indexPrechecked), levelList[indexPrechecked].name);

    $("input[name=" + name + "]").click(function () {
        var idx = listColoring(this.name);

        if( dblClickDelay > new Date().getTime() && oldIdx == idx ) {
            startLevel();
        } else {
            oldIdx = idx;

            changeDescription(levelList[idx].description, levelImgPath(idx), levelList[idx].name);

            dblClickDelay = new Date().getTime() + 500;
        }
    });

    $("#startLevel").click(startLevel.bind(this));
    $("#backBtn").click(back.bind(this));
}

function levelImgPath(idx) {
    return "../levels/" + levelList[idx].baseName + "/" + levelList[idx].baseName + "_preview.png";
};

function startLevel() {
    $("body").hide();

    setTimeout(function() {
        beamng.sendGameEngine('startLevel("levels/' + levelList[selectedIndex].baseName + '/' + levelList[selectedIndex].baseName + '.mis");')
    }, 50);
};

function back( e ) {
    e.preventDefault();
    // parent
    if( window.top == window.self ) {
        history.go(-1);
        return false;
    } else {
        parent.dashboard.restore();
    }
}

$(document).ready(function () {
    // temporary
    $(".options *").attr("disabled", "disabled").off('click');


    setTimeout(function () {
        callGameEngineFuncCallback("getLevelList()", function (res) {
            for (var i = 0; i < res.length; i++) {
                levelList.push({
                    name: res[i][1],
                    baseName: res[i][0],
                    value: i,
                    img: "../levels/" + res[i][0] + "/" + res[i][0] + "_preview.png",
                    description: res[i][2]
                });
            }
            ;

            initOptionsList("levels", levelList, "level", 0);
        });
    }.bind(this), 1050);

//        callEngineLuaFunction("levelChooser.init");
});