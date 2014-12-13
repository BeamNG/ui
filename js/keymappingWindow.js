var keymappingWindow = (function(){
    'use strict';
    
    var device = deviceToOpen;
    var maps = keyMapsForDevice;
    var devices = devicesThatKeyBindingsExistFor;

    var selector = "";



    function html () {
        var html = "<table><tr><td>Keybinding</td><td><select id='devices'>";
        
        $.each(devices, function (k, v) { //maybe v.name instead of k?
            html += "<option value='" + k + "'>" + k + "</option>";
        });
        
        html += "</select></td><td><select id='maps'>";

        $.each(maps, function (k, v) { //maybe v.name instead of k?
            html += "<option value='" + k + "'>" + k + "</option>";
        });
        html += "</select></td></tr>";

        html += "<tr>";
        $.each(device.actions, function (n, a) {
            html += "<td>" + n + "</td><td>";
                $.each(a.keys, function (k, v) {
                    html += "<div>" + k + "</div>";
                });
            html += "</td><td class='newTag'></td>";
        });
        html += "</tr>";
        html += "<tr><td colspan='3'>Add Action</td></tr>";
        html += "</table>";

        return html;
    }

    function setValues() {
        $.each()
    }

    function setListeners() {

    }

    function init () {
        setValues(); 
        setListeners();
    }

    function create(sel) {
        selector = sel;
        $(sel).html(html());
    }

    // public interface
    var keymappingWindow = {
        html: function() { return html() },
        create: function(selector) { create(selector) },
        init: function() { init() }
    };
    return keymappingWindow;
}());