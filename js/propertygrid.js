function BeamNGPropertyGrid(givenData) {
    var data = givenData;
    var html = "";
    var optionsElements = {};
    var usageElements = {};
    var changedInputs = {};

    var instance = this;

    //$().ready(function () {
    //});

    BeamNGPropertyGrid.prototype.init = function () {
        instance.work();
        $('.pgPlus').next('tr').toggle();

        $('.propertyGridContainer .pgGroupTitle').on("click", function() {
            $(this).children('td').toggleClass('pgPlus pgMinus');
            $(this).next('tr').toggle();
        });

        //$( document ).tooltip();
    };

    function escapeJQuerySelector(str)
    {
        if (str)
            return str.replace(/([ #;?%&,.+*~\':"!^$[\]()=>|\/@])/g,'\\$1');
        return str;
    }

    function onValueChanged(element, info) {
        var path = info.path.split(".");
        var id = path[0];

        // always update the current value so we can use it in the changed list
        info.val = element.get()
        var changed = info.valOrig != info.val;
        if(typeof info.onChange == "function") {
            var res = info.onChange(info);
            // TODO: if res == true, then reset highlighting, as it was applied directly
            if(res) {
                return;
            }
        }

        for (var i = 0; i < path.length; i++) {
            var color = changed ? '#ffdddd' : info.orgColor;
            id += "."+path[i];

            if(typeof changedInputs[id] == "undefined") {
                changedInputs[id] = 0;
            }
            //TODO: Decide as what to use changedInputs
            //1. As a counter for all fields how many changed inputs rely on it
            //2. An object, containing all informations? Or what was the plan with the following line?
            changedInputs[id] = info;

            if(changedInputs[id] == 0) {
                color = "";
            } else if( changedInputs[id] < 0) {
                console.log("ERROR: There should not be two Elements to select, where the value is the same");
            }

            var c = colorElement(escapeJQuerySelector(id), "", color);
            if(changed) {
                info.orgColor = c;
            }


            if(i == path.length-1) {
                colorElement(escapeJQuerySelector(id), info.type, color);
            }
        }
    }

    function colorElement(selector, type, color) {
        var element;
        if(type == "slider") {
            element = $("#"+selector).closest("table");
        } else if(type == "combo") {
            element = $("#"+selector).closest("td");
            $("#"+selector).css("background-color", color);
        } else {
            element = $("#"+selector).closest("td");
        }
        var oldColor = element.css("background-color");
        element.css("background-color", color);
        return oldColor;
    }

  function buildSingleOptionLines (d, topBottom) {
        var options = "";
        if(d[topBottom]) {
            $.each(d[topBottom], function (key, value) {
                if(value.type in controls) {
                    value.path = d.path+"."+key;
                    value.valOrig = value.val;
                    d.ctrl = new controls[value.type](value);
                    usageElements[value.path] = d;
                    options += " "+d.ctrl.create();
                }
            });
        }
        return options;
    }

     controls = {
        'bool' : function PGBool(d) {
            this.selector = '#' + escapeJQuerySelector(d.path);
            PGBool.prototype.get    = function()    { return $(this.selector).prop('checked'); };
            PGBool.prototype.set    = function(v)   { $(this.selector).prop('checked', v); };
            PGBool.prototype.create = function()    { return '<input type="checkbox" name="' + d.path + '" id="' + d.path + '">'; }; // class="regular-checkbox"
        },
        'color' : function PGColor(d) {
            this.selector = '#' + escapeJQuerySelector(d.path);
            PGColor.prototype.get    = function()    { return $(this.selector).val(); };
            PGColor.prototype.set    = function(v)   { $(this.selector).val(v); };
            PGColor.prototype.create = function()    { return '<input type="text" name="' + d.path + '" id="' + d.path + '">'; };
            PGColor.prototype.init   = function(v)   { $(this.selector).spectrum({showInput: true, allowEmpty:false, showAlpha:true}); };
        },
        'enable' : function PGEnable (d) {
            this.selector = '#' + escapeJQuerySelector(d.path);
            PGEnable.prototype.get    = function()    { return $(this.selector).prop('checked'); };
            PGEnable.prototype.set    = function(v)   { $(this.selector).prop('checked', v); };
            PGEnable.prototype.create = function()    { return '<input type="checkbox" name="' + d.path + '" id="' + d.path + '"><label for="' +d.path+ '">' + d.name + '</label>'; };
        },
        'combo' : function PGCombo(d) {
            this.selector ='#' + escapeJQuerySelector(d.path);
            PGCombo.prototype.get    = function()   { return $(this.selector).val(); };
            PGCombo.prototype.set    = function(v)  { $(this.selector).val(v); };
            PGCombo.prototype.create = function()   {
                var res = '<select name="' + d.path + '" id="' + d.path + '">\n';
                var o;
                if($.isArray(d.options)) {
                    // simple array
                    for(var oi in d.options) {
                        o = d.options[oi];
                        res += '<option value="' + o + '">' + o + '</option>';
                    }
                } else {
                    // dict
                    for(var k in d.options) {
                        o = d.options[k];
                        res += '<option value="' + k + '">' + o + '</option>';
                    }
                }
                res += '</select>';
                return res;
            };
        },
        'slider' : function PGIntSlider (d) {
            this.selector ='#' + escapeJQuerySelector(d.path);
            PGIntSlider.prototype.get    = function()   { return $(this.selector).val(); };
            PGIntSlider.prototype.set    = function(v)  { $(this.selector).val(v); };
            PGIntSlider.prototype.create = function()   { return '<table width="100%"><tr><td width="100%"><input type="range" name="' + d.path + '" id="' + d.path + '" min="' +d.min+ '" max="' +d.max+ '" step="' + d.step + '"></td><td><label id="' + d.path + '.label">' + d.val.toFixed(1) + '</label></td></tr></table>'; };
            //Two input posibillities:
            //instead of value do textContent in onchange()
            //<input type="number" id="label.' + d.path + '" value="' + d.val + '" min="' +d.min+ '" max="' +d.max+ '" step="' + d.step + '" onChange="document.getElementById(\'' + d.path + '\').value = this.value">
        },
        'button' : function PGButton (d) {
            this.selector ='#' + escapeJQuerySelector(d.path);
            this.has_commands = true;
            PGButton.prototype.create = function()  { return '<input type="button" id="' + d.path + '" value="' + d.name + '">';};
        }
    };

    BeamNGPropertyGrid.prototype.errormsg = function(msg) {
        console.log("ERROR: " + msg);
    };

    BeamNGPropertyGrid.prototype.work = function() {
        html = this.workRec(data, '', 0); // first level is special
        var container = data.rootElement;
        container.html(html);
        this.setDefaultValuesAndListeners();

        //container.flexigrid();
        //console.log(html);
    };

    BeamNGPropertyGrid.prototype.workRec = function(d, path, level) {
        // this function is called "per value" / "per control" - not for lists of controls
        var res = '';
        var maxLevel;
        if(typeof maxLevel == "undefined") { maxLevel = 0 };

        // set path correctly
        d.path = path;
        if(d.id) {
            if(d.path != '')
                d.path +=  '.';
            d.path += d.id;
        }

        // backup value
        d.valOrig = d.val;

        if(level == 0) { res += '<table border="0" class="propertyGridContainer">'; }

        var spacetd = '<td class="pgSpacer" ';
        if(level%2 == 0) { spacetd += 'style="background-color:DarkGray"'; }
        spacetd += '></td>';

        if(d.childs) {
            // work off all child data
            if(d.name) {
                var title = buildSingleOptionLines(d, "top");
                usageElements[d.path] = d;
                res += '</table><table border="0" class="propertyGridContainer"><tr class="pgGroupTitle"><td colspan="3"' 
                if(typeof data.collapsed != "undefined" && !data.collapsed) {
                    res += 'class="pgMinus"';
                } else {
                    res += 'class="pgPlus"';
                    console.log("test");
                }
                res += 'id="' + d.path + '">' + d.name + title + '</td></tr><tr>'+spacetd+'<td colspan="2"><table border="0" class="propertyGridContainer">\n';
            }
            for(var k in d.childs) {
                d.childs[k].id = k; // always assign the id
                if(!d.childs[k].name)
                    d.childs[k].name = d.childs[k].id; // use the id as name if no name was provided

                d.childs[k].id = k; // always assign the id
                if(maxLevel<level+1) { maxLevel = level+1; }
                res += this.workRec(d.childs[k], d.path, level + 1) + '\n';
            }

            // TODO: fix this and refactor in combination with above code
            //Like this?
            var footer = buildSingleOptionLines(d, "bottom");
            res += '</table></td></tr><tr><td colspan="' + maxLevel + '">' + footer + '</td></tr>\n';
            maxLevel = 0;
        } else {
            if(d.type in controls) {
                d.ctrl = new controls[d.type](d);
                optionsElements[d.path] = d;
                res += '<tr class="pgItemRow"';
                if(d.description)
                    res += ' title="' + d.description + '" ';

                if(d.type != "button") {
                    res += '><td class="pgGroupItemText"><label for="'+d.path+'">' + d.name + '</label></td><td class="pgInputHolder">' + d.ctrl.create() + '</td></tr>';
                } else {
                     res += '><td class="pgInputHolder" colspan="2">' + d.ctrl.create() + '</td></tr>';
                }
            } else {
                this.errormsg('unknown control type: ' + d.type);
            }

        }

        if(level == 0)
            res += '</table><input type="button" value="Close" style="position:fixed" onClick="'+data.rootElement.html("")+'" />';

        return res;
    };

    BeamNGPropertyGrid.prototype.setDefaultValuesAndListeners = function() {
        $.each(optionsElements, function(key, d) {

            if(typeof d.ctrl.init == "function") {
                d.ctrl.init();
            }
            d.ctrl.set(d.valOrig);

            if(d.type == "slider") {
                // change function is not called when the slider is still moving, oninput is
                $(d.ctrl.selector)[0].oninput = function() {
                    onValueChanged(d.ctrl, d);
                    // this seems to work surprisingly well, even if no label is defined:
                    document.getElementById(d.path + '.label').textContent = parseFloat(this.value).toFixed(1); // TODO: find out if we need 2 places behind the comma
                };
            } else {
                // onInput function seems not to affect checkboxes and selects
                $(d.ctrl.selector)[0].onchange = function() { 
                    onValueChanged(d.ctrl, d);
                };
            }
        });

        $.each(usageElements, function(key, d) {
            if(d.type == "enabler") { //is it an enabler?
                d.ctrl.set(d.valOrig);

                $(d.ctrl.selector).change( function () {

                    $.each($(d.ctrl.selector).closest("table").find("input"), function(k, v) {
                        if(typeof usageElements[v.id] == "undefined") {
                            v.disabled = !d.ctrl.get();
                        }
                    });
                });
            } else if(d.type == "button") { //is it a button?
                
                $(d.ctrl.selector).click(function() { //set
                    if(typeof d.cmdJs != "undefined") {
                        eval(d.cmdJs); //execute Javascript; should be string with valid js
                    }
                    if(typeof d.cmdTs != "undefined") {
                        executeGameEngineCode(d.cmdTs); //exectue Torquescript; should be string with valid ts
                    }
                    if(typeof d.cmdLua != "undefined") {
                        var lua = d.cmdLua;
                        for(var i=0; i<lua.length; i++) {
                            callLuaFunction(lua[i], d.paramLua[i]); //execute lua; schould be list of func in cmdLua and list of paramters as strings in paramLua
                        }
                    }
                    if(typeof d.clearChanges == "boolean" && d.clearChanges) {
                        $.each(changedInputs, function (key, value) {
                            //console.log(key);
                            //console.log(value);
                            // TODO: write function that resets the color of the changed things recursively
                            
                            /// NOT working: colorElement(escapeJQuerySelector(value.id), '', value.info.orgColor);
                        });
                        changedInputs = {}
                    }
                    
                });
            }
        });
    };

    BeamNGPropertyGrid.prototype.getChangedValues = function() {
        return changedInputs;
    };

    BeamNGPropertyGrid.prototype.revertChanges = function() {
        // TODO: FIXME
        // And decide the changedInput question (in onValueChanged)
        /*
        $.each(changedInputs, function(key, value) {
            if(typeof optionsElements[key] != "undefined" && changedInputs[key] > 0) {
                optionsElements[key][1].set(optionsElements[key][0].valOrig);
                changedInputs[key] = 0;
                colorElement(optionsElements[key][0].selector, optionsElements[key][0].type, "");
            }
        });
        */
    };
}
