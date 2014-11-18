var pgElementPm = null;
var luaConfig = null;
var wrapper = null;

function buildpartPGConfig(slotMap) {
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

            options[v2.partName] = v2.name;
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
                childParts = buildpartPGConfig(v2.parts);
            }
        });

        res[k] = {
            name: k,
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

function buildPartmanager () {
    var pg = null;

    callLuaFuncCallback('partmgmt.getConfig()', function(res) {
        // console.log("lua result: ");
         test = res;

        var data = {
            rootElement: pgElementPm,
            childs: buildpartPGConfig(res.slotMap)
        }

        // console.log("tree data: ");
        // console.log(data.childs);

        pg = new BeamNGPropertyGrid(data);
        pg.init();

        //TODO: think about applyinig this to the whole tr instead of the td
        $("#pmpg").mouseleave(selectReset) //this is not good, but feeling ingame much better than other possibilities (see: buildpartPGConfig> res[k]> onMouseleave )
        $(".pgGroupItemText").mouseenter(selectReset) //same here! oh and should this be moved, please leave a note so the other comments don't reference the right spot 
    });
}

function setPartInConfig(config, part, newValue) {
    for(var partKey in config) {
        var v = config[partKey];
        if(typeof v.name == "string") {
            console.log(v.name)
            if(v.name == part) {console.log(v.name); return true}
 
            if(typeof v.parts == "object" && Object.keys(v.parts).length != 0) {
                setPartInConfig(v.parts, part, newValue)
            }
        } else {
            setPartInConfig(v, part, newValue);
        }

    }
}

// function setPartInConfig(config, part, newValue, element) {

//     for(var partKey in config) {
//         var funct = function () {for(var k in config[partKey]) {
//             var v = config[partKey][k];
//             if(typeof v.parts == "object" && Object.keys(v.parts).length != 0) {
//                 setPartInConfig(v.parts, part, newValue, element);
//             }
//             if (v.name == part) {
//                 return v;
//             }
//         }}
//         if(typeof funct() != "undefined") {return funct()}
//     }
// }


function selectPart (element) { // onmousenter
    if(typeof element.name == "string") {
        callLuaFunction("partmgmt.selectPart", "'"+element.name+"'");
    }
}

function selectReset() { // onmouseleave
    callLuaFunction("partmgmt.selectReset", '');
}

function changePart(element) { // onchange
    if(typeof element == "object") {
        obj = {} //list of parts like in e.g. i6_rwd.pc
        parts = "'" + serializeToLua(obj) + "'";
        callLuaFunction("partmgmt.setConfig", parts + ", true")
        // buildPartmanager()
    }
}