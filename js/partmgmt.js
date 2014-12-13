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
            collapsed: true,
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
        pgElementPm = $('<div id="pmpg" class="pg"></div>').appendTo($(wrapper_div)); //when changing the id change it below to
    }
    $(wrapper_div).css('display', 'block');
    wrapper = wrapper_div;

    buildPartmanager();
}

function getPrefix(des) {//works if the substring is the same every where, also horrible btw
    var strings = [];

    for(var k in des) {
        if(strings.length > 1) {
            break;
        } else {
            strings[strings.length] = des[k];
        }
    }

    for(var i=0; (i<strings[0].length && i<strings[1].length && strings[0].charAt(i) == strings[1].charAt(i)); i++) {}

    return strings[0].substring(0, i);
}

function buildPartmanager () {
    var pg = null;

    callLuaFuncCallback('partmgmt.getConfig()', function(res) {
        // console.log("lua result: ");
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

        //TODO: think about applyinig this to the whole tr instead of the td (and how to do this)
        $("#pmpg").mouseleave(selectReset) //this is not good, but feeling ingame much better than other possibilities (see: buildpartPGConfig> res[k]> onMouseleave )
        $(".pgGroupItemText").mouseenter(selectReset) //same here! oh and should this be moved, please leave a note so the other comments don't reference the right spot 
    });
}

function generateConfig(changedPart, newValue, config, newConfig, changeFollowing) {
    if(typeof newConfig == "undefined") var newConfig = {};
    if(typeof changeFollowing == "undefined") var changeFollowing = false;
    
    for(var partKey in config) {
        var v = config[partKey];
        if(typeof v.partName == "string") {
            if(!changeFollowing) changeFollowing = v.partName == changedPart; //newValue != oldValue does not have to be checked because otherwise the person to call this onChange event without changing anything should get a reward
            
            if(changeFollowing) {
                newConfig[v.partName] = newValue; //why ever this works on childs as well as on the parent...
            } else {
                newConfig[v.partName] = v.active ? v.partName : "none"; //save the value to a new config
            }
            // console.log(v.name)
            // console.log(v.partName)
            // console.log(changeFollowing)
            // console.log(newConfig[v.partName])
            // console.log("")

            if(typeof v.parts == "object" && Object.keys(v.parts).length != 0) {
                newConfig = generateConfig(changedPart, newValue, v.parts, newConfig, changeFollowing);
            }
        } else {
            newConfig = generateConfig(changedPart, newValue, v, newConfig, changeFollowing);
        }
    }
    return newConfig;
}

function selectPart (element) { // onmousenter
    if(typeof element.id == "string") {
        callLuaFunction("partmgmt.selectPart", "'"+element.id+"'"); //somehow this doesn't work on the engine and suspennsion stuff while the rest works perfectly well
    }
}

function selectReset() { // onmouseleave
    callLuaFunction("partmgmt.selectReset", '');
}

function changePart(element) { // onchange
    if(typeof element == "object") {
        var newConfig = generateConfig(element.id, element.val, config.slotMap)
        callLuaFunction("partmgmt.setConfig", serializeToLua(newConfig)+ ", true")
        console.log(serializeToLua(newConfig))
        buildPartmanager()
        setTimeout(buildPartmanager, 100) //fix this (having to call it twice) by adding update function in property grid
    }
}

HookManager.registerAllHooks({
 onVehicleChange: buildPartmanager
});