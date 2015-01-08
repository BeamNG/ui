//Some Singleton to create the sidepanel options, later Polymer?
//TODO: Build Singleton
// var controls = {
//     "range": function () {

//     },
//     "select": function () {

//     }
// }


var currentDescription = "";

function rangeChangeOutput (elem) {
    var value = parseFloat(elem.value).toFixed(1);
    var list = elem.list.children;
    for(var i=0; i < list.length; i++) {
        if(list[i].value == value)
            value = list[i].label;
    }
    document.getElementById(elem.id + "Output").value = value;
}

function changeDescription (text) {
    document.getElementsByClassName("description")[0].innerHTML = text;
}


$(document).ready(function() {
    currentDescription = document.getElementsByClassName("description")[0].innerHTML

    //To every element the class hoverDes can be applied with the combination of a title,
    //So as long as the mouse stays over that element the Description in the Sidepanel will change to the String stored in title
    $(".hoverDes").hover(function () {
        changeDescription(this.title);
    }, function () {
        changeDescription(currentDescription);
    }); 
});