var pgElementPm = null;
var wrapper = null;
var config = null;

function buildpartPGConfig(slotMap, description, prefix) {
    var res = {};
    $.each(slotMap, function(k, v) {
        // k : part type 'pickup_bed'
        // v : list of possible parts: 0 : object(active, author, partName, parts)

        // build this option
        var options = {none:'Empty'};
        var selection = 'none';
        $.each(v, function(k2, v2) {
            // k2 : part index, useless
            // v2 : part that fits into this slot

            options[v2.partName] = v2.name.replace(prefix, "");
            if(v2.active) {
                selection = v2.partName;
            }
        });


        // find childs recursively
        var childParts = {};
        $.each(v, function(k2, v2) {
            // k2 : part index, useless
            // v2 : part that fits into this slot

            if(typeof v2['parts'] == "object") {
                childParts = buildpartPGConfig(v2.parts, description, prefix);
            }
        });

        res[k] = {
            name: description[k].replace(prefix, ""),
            id: k,
            type: 'combo',
            collapsed: true, //to who ever changed this: do you think this is a good idea if you open everything allways and are confrontet with about 40 Parts at once instead of only the several groups? Feel free to set it to false again if you think so, I wont change it again 
            options: options,
            val: selection,
            childs: childParts,
            onMouseenter: selectPart,
            // onMouseleave: selectReset, // could be done here but would reset as well when moving mouse from one select to another (wich really hurts in the eyes)
            onChange: changePart
        };

    });
    return res;
}

function initPartmanager(wrapper_div) {
    if(!pgElementPm) {
        pgElementPm = $('<div id="pmpg" class="pg"></div>').appendTo($(wrapper_div)); //when changing the id: change it below to
    }
    $(wrapper_div).css('display', 'block');
    wrapper = wrapper_div;

    buildPartmanager();
}

function getPrefix(des) {//works if the substring is the same everywhere, also horrible btw
    var strings = [];
    var prefix = "";

    for(var k in des) {
        if(strings.length > 0) {
            break;
        } else {
            strings[strings.length] = des[k];
        }
    }

    for(var i=0; true; i++) {
        for(var k in des) {
            if(des[k].indexOf(prefix) != 0)
                return strings[0].substring(0, (i-2));
        }
        prefix = strings[0].substring(0, i);
    }
}

function buildPartmanager () {
    var pg = null;

    callLuaFuncCallback("partmgmt.getConfig()", function(res) {
        config = res;
        prefix = getPrefix(res.slotDescriptions);

        var data = {
            rootElement: pgElementPm,
            childs: buildpartPGConfig(res.slotMap, res.slotDescriptions, prefix)
        }
        // console.log("tree data: ");
        // console.log(data.childs);

        pg = new BeamNGPropertyGrid(data);
        pg.init();

        //TODO: think about applyinig this to the whole tr instead of the td (and how to do that)
        $("#pmpg").mouseleave(selectReset) //this is not good, but feeling ingame much better than other possibilities (see: buildpartPGConfig> res[k]> onMouseleave )
        $(".pgGroupItemText").mouseenter(selectReset) //same here! oh and should this be moved, please leave a note so the other comments don't reference the right spot 
    });
}

function generateConfig(changedPart, newValue, config, newConfig, checkFollowing) {
    if(typeof newConfig == "undefined") var newConfig = {};
    if(typeof checkFollowing == "undefined") var checkFollowing = true;
    
    for(var partKey in config) {
        var v = config[partKey];
        if(typeof v.partName == "string") {
            // console.log(v.name)
            // console.log(v.partName)
            // console.log(checkFollowing)
            // console.log(newConfig[v.partName])
            // console.log("")
            if(checkFollowing) newConfig[v.partType] = "none";
            if(v.active) {newConfig[v.partType] = v.partName; checkFollowing = false}
            if(v.partType == changedPart) newConfig[v.partType] = newValue

            if(typeof v.parts == "object" && Object.keys(v.parts).length != 0) {
                newConfig = generateConfig(changedPart, newValue, v.parts, newConfig, checkFollowing);
            }
        } else {
            newConfig = generateConfig(changedPart, newValue, v, newConfig, checkFollowing);
        }
    }
    return newConfig;
}

function selectPart (element) { // onmousenter
    if(typeof element.val == "string") {
        callLuaFunction("partmgmt.selectPart", "'"+element.val+"'");
    }
}

function selectReset() { // onmouseleave
    callLuaFunction("partmgmt.selectReset", '');
}

function changePart(element) { // onchange
    if(typeof element == "object") {
        var newConfig = generateConfig(element.id, element.val, config.slotMap);
        callLuaFunction("partmgmt.setConfig", serializeToLua(newConfig)+ ", true");
        // console.log(serializeToLua(newConfig))
        buildPartmanager();
        // setTimeout(buildPartmanager, 100); //fix this (having to call it twice) by adding update function in property grid
    }
}

HookManager.registerAllHooks({
    onVehicleChange: buildPartmanager
});