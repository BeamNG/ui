function BeamNGPropertyGrid(givenData) {
    var data = givenData;
    var html = "";
    var optionsElements = {};
    var usageElements = {};
    
    var instance = this;

    //$().ready(function () {
    //});

    BeamNGPropertyGrid.prototype.init = function () {
        instance.work();
        $('.pgPlus').parent().next("tr").toggle();

        $('.pgPlus, .pgMinus').on("click", function() {
            $(this).toggleClass('pgPlus pgMinus');
            $(this).parent().next('tr').toggle();

            if($(this).hasClass("pgMinus")) {
                sessionStorage.setItem(this.id, "open")
            } else {
                sessionStorage.setItem(this.id, "closed")
            }
        });

       // $( document ).tooltip();
    };

    function escapeJQuerySelector(str)
    {
        if (str)
            return str.replace(/([ #;?%&,\.+*~\':"!^$[\]()=>|\/@])/g,'\\$1');
        return str;
    }

    function buildInputLine(d, usage) {

        /*
        +-----------------+
        | key   | value   |
        +-----------------+
        */

        // decision variables
        var has_name   = (d.name);
        var has_value  = (d.type in controls);
        var has_childs = (typeof d.childs == 'object' && Object.keys(d.childs).length !== 0);


        var tr_classes = '';
        if(has_childs) tr_classes += ' pgGroupTitle ';
        
        // row start
        var res = '<tr class="' + tr_classes + '"';
        if(d.description)
            res += ' title="' + d.description + '" ';
        res += '>'; // row tr end

        // left key label
        var td_classes = '';
        if(has_childs) {
            if(sessionStorage.getItem(d.path + ".description") != null) {
                var open = sessionStorage.getItem(d.path + ".description") == "open"
            } else {
                var open = typeof d.collapsed == "boolean" && !d.collapsed
            }
            if(open)  {
                td_classes += ' pgMinus ';
                sessionStorage.setItem(d.path + ".description", "open")
            } else {
                td_classes += ' pgPlus ';
                sessionStorage.setItem(d.path + ".description", "closed")
            }
        }
        if(has_childs) td_classes += ' pgGroupTitle ';

        if(has_name) {
            res += '<td id="' + d.path + '.description" class="pgGroupItemText' /*when changing class name change as well in partmgmt.js*/+ td_classes + '"' + (has_value ? '' : ' colspan="2"') + '><label for="' + d.path + '">' + d.name + '</label></td>';
        }


        // right value
        if(has_value) {
            res += '<td id="' + d.path + '.valuetd" class="pgInputHolder"' + (has_name ? '' : ' colspan="2" ') + '>'; // if no name, use the whole table for value
            res += buildInput(d, usage);
            res += '</td>'; // closes pgInputHolder
        }


        // row end
        res += '</tr>'; // closes row
        return res;
    }
    
    function buildInput(d, usage) {
        var inputHtml = "";
        if(d.type in controls) {
            d.valOrig = d.val;
            d.ctrl = new controls[d.type](d);
            usage ? usageElements[d.path] = d : optionsElements[d.path] = d;
            inputHtml += " "+d.ctrl.create();
        }
        return inputHtml;
    }


     controls = {
        'bool' : function PGBool(d) {
            this.selector = '#' + escapeJQuerySelector(d.path);
            PGBool.prototype.get    = function()    { return $(this.selector).prop('checked'); };
            PGBool.prototype.set    = function(v)   { $(this.selector).prop('checked', v); };
            PGBool.prototype.create = function()    { return '<input type="checkbox" name="' + d.path + '" id="' + d.path + '">'; }; // class="regular-checkbox"
        },
        'file' : function PGFile(d) {
            this.selector = '#' + escapeJQuerySelector(d.path);
            PGFile.prototype.get    = function()    { return $(this.selector).val(); };
            PGFile.prototype.set    = function(v)   { $(this.selector).val(v); };
            PGFile.prototype.create = function()    { return '<input type="file" name="' + d.path + '" id="' + d.path + '">'; };
        },
        'color' : function PGColor(d) {
            this.selector = '#' + escapeJQuerySelector(d.path);
            PGColor.prototype.get    = function()    { return $(this.selector).val(); };
            PGColor.prototype.set    = function(v)   { $(this.selector).spectrum({preferredFormat: "rgb", showInput: true, allowEmpty:false, showAlpha:true, showButtons: false, color:v});};
            PGColor.prototype.create = function()    { return '<input type="text" name="' + d.path + '" id="' + d.path + '">'; };
            PGColor.prototype.init   = function(v)   { $(this.selector).spectrum({preferredFormat: "rgb", showInput: true, allowEmpty:false, showAlpha:true, showButtons: false, color:d.val}); console.log(d.val)};
        },
        'enable' : function PGEnable (d) {
            this.selector = '#' + escapeJQuerySelector(d.path);
            PGEnable.prototype.get    = function()    { return $(this.selector).prop('checked'); };
            PGEnable.prototype.set    = function(v)   { $(this.selector).prop('checked', v); };
            PGEnable.prototype.create = function()    { return '<input type="checkbox" name="' + d.path + '" id="' + d.path + '"><label id="' + d.path + '.valuelabel" for="' +d.path+ '">Enabled</label>'; };
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
            PGIntSlider.prototype.set    = function(v)  { $(this.selector).val(v); $(this.selector+'.label').find("label").text(v.toFixed(1))};
            PGIntSlider.prototype.create = function()   { return '<table width="100%"><tr><td width="100%"><input type="range" name="' + d.path + '" id="' + d.path + '" min="' +d.min+ '" max="' +d.max+ '" step="' + d.step + '"></td><td><label id="' + d.path + '.valuelabel">' + d.val.toFixed(1) + '</label></td></tr></table>'; };
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
        var container = data.rootElement;

        container.html(this.workRec(data, '', 0));  // first level is special
        container.css("display", "block");
        this.setDefaultValuesAndListeners();

        //container.flexigrid();
        //console.log(html);
    };

    BeamNGPropertyGrid.prototype.workRec = function(d, path, level) {
        var res = '';

        // set path correctly
        d.path = path + (d.id ? (path != "" ? ".": "") + d.id : ""); //just because I want to do it this way :-) this is exactly the same as the following 5 lines
        // d.path = path;
        // if(d.id) {
        //     if(d.path != '')
        //         d.path +=  '.';
        //     d.path += d.id;
        // }

        // backup value is done in buildInput()
        //d.valOrig = d.val;

        /*
        // table layout
        +---+------------------------+
        |   |                        |
        |   |   +-----------------+  |
        | S |   | key   | value   |  |
        | P |   +-----------------+  |
        | A |   | key   | value   |  |
        | C |   +-----------------+  |
        | E |   | key   | value   |  |
        | R |   +-----------------+  |
        |   |   | buttons         |  |
        |   |   +-----------------+  |
        +---+------------------------+
        */

        // set up things is done in the constructor
        // d.selector = "#" + escapeJQuerySelector(d.path);

        // SPACER
        res += '<table border="0" class="propertyGridContainer"><tr>';
        
        if(d.name && level > 1) {
            res += '<td class="pgSpacer ' + ((level%2 == 0) ? '' : 'pgSpacerOdd') + '">';
            //res += level; // < good for debugging the levels
            res += '</td>';
        }


        res += '<td>';

        // inner key value table
        res += '<table border="0" class="propertyGridContainer">';
        if(d.type == "enable") {
            res += buildInputLine(d, true);
        } else {
            res += buildInputLine(d, false);
        }

        if(d.childs) {
            res += '<tr class="pgChilds"><td colspan="2">'; // opens child row: holds all childs
            var self = this;
            $.each(d.childs, function(k, v) {
                
                if(!v.name && v.id) v.name = v.id;
                v.id = k;
                
                res += self.workRec(v, d.path, level + 1) + '\n';
            });
            res += '</td></tr>'; // closes child row
        }
        if(d.bottom) {
            res += '<tr class="pgChilds"><td colspan="2">'; // opens bottom row
            var self = this;
            $.each(d.bottom, function(k, v) {
                if(!v.name && v.id) v.name = v.id;
                v.path = path + (path != "" ? ".": "") + (v.id = k); // see above
                
                res += buildInput(v, true);
            });
            res += '</td></tr>'; // closes child row
        }


        res += '</table>';


        res += '</td></tr></table>'; // closes spacer completely

        return res;
    };

    function onDomEvent (d, event) {
        var addListener = function(d, event) {
            switch (event) {
                // case "onMouseenter":
                //     break;
                // case "onMouseleave":
                //     break;
                case "onChange":
                    d.valOrig = (d.val = d.ctrl.get());
                    break;
            }
        }
        if(typeof d[event] == "function") {
            addListener(d, event);
            d[event](d);
        }
    }

    BeamNGPropertyGrid.prototype.setDefaultValuesAndListeners = function() {
        var self = this; // store 'this'
        $.each(optionsElements, function(key, d) {

            if(typeof d.ctrl.init == "function") {
                d.ctrl.init();
            }
            d.ctrl.set(d.valOrig);

            var changeFunction = {
                "onChange" : function() {onDomEvent(d, "onChange")},
                "onMouseenter" : function() {onDomEvent(d, "onMouseenter")},
                "onMouseleave" : function() {onDomEvent(d, "onMouseleave")}
            }

            if(d.type == "slider") {
                // change function is not called when the slider is still moving, oninput is
                $(d.ctrl.selector)[0].oninput = function() {
                    changeFunction["onChange"]();
                    // additionally, update the text label
                    // this seems to work surprisingly well, even if no label is defined:
                    document.getElementById(this.id + '.valuelabel').textContent = parseFloat(this.value).toFixed(1); // TODO: find out if we need 2 places behind the comma
                };
            } else {
                var elem = $(d.ctrl.selector)[0];
                elem.onchange = changeFunction["onChange"];
                elem.oninput = changeFunction["onChange"];
                elem.onmouseenter = changeFunction["onMouseenter"];
                elem.onmouseleave = changeFunction["onMouseleave"];
            }
        });

        $.each(usageElements, function(key, d) {
            if(d.type == "enable") { //is it an enabler?
                d.ctrl.set(d.valOrig);
                $(d.ctrl.selector).change( function () {
                    $(d.ctrl.selector).next().text( d.ctrl.get() ? "Enabled" : "Disabled");
                    $.each($(d.ctrl.selector).closest("tr").next().find("input, select"), function(k, v) {
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
                    /*if(typeof d.clearChanges == "boolean" && d.clearChanges) {
                        self.revertChanges(data);   
                    }*/
                    
                });
            }
        });
    };
}
