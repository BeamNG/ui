function BeamNGPropertyGrid(data) {
    var data = data;
    var html = "";

    var instance = this;

    //$().ready(function () {
    //});

    BeamNGPropertyGrid.prototype.init = function () {
        //console.log(data);
        instance.work();

        $('.propertyGridContainer .pgGroupTitle').on("click", function() {
            $(this).children('td').toggleClass('pgPlus pgMinus');
            $(this).next('tr').toggle();
        });

        $(".pgSpacer:even").css("background-color", "DarkGray");

        $( document ).tooltip();
    }

    function escapeJQuerySelector(str) 
    {
        if (str)
            return str.replace(/([ #;?%&,.+*~\':"!^$[\]()=>|\/@])/g,'\\$1');
        return str;
    }

    var controls = {
        'bool' : function PGBool(d) {
            var selector = '#' + escapeJQuerySelector(d.path);
            PGBool.prototype.get    = function()  { return $(selector).is(':checked'); }
            PGBool.prototype.set    = function(v) { $(selector).prop('checked', v); }
            PGBool.prototype.create = function()  { return '<input type="checkbox" id="' + d.path + '" value="' + d.val + '" >'; } // class="regular-checkbox" 
        },
        'combo' : function PGCombo(d) {
            var selector = '#' + escapeJQuerySelector(d.path);
            PGCombo.prototype.get    = function()  { return $(selector).val(); }
            PGCombo.prototype.set    = function(v) { $(selector).val(v); }
            PGCombo.prototype.create = function()  {
                var res = '<select id="' + d.path + '">\n';
                if($.isArray(d.options)) {
                    // simple array
                    for(var oi in d.options) {
                        var o = d.options[oi];
                        res += '<option value="' + o + '">' + o + '</option>';
                    }
                } else {
                    // dict
                    for(var k in d.options) {
                        var o = d.options[k];
                        res += '<option value="' + k + '">' + o + '</option>';
                    }                    
                }
                res += '</select>';
                return res;
            }
        },
    }

    BeamNGPropertyGrid.prototype.errormsg = function(msg) {
        console.log("ERROR: " + msg);
    }

    BeamNGPropertyGrid.prototype.work = function() {
        html = this.workRec(data, data.div, 0);
        var container = $('#' + data.div);
        container.html(html);
        //container.flexigrid();
        //console.log(html);
    }
    
    BeamNGPropertyGrid.prototype.workRec = function(d, path, level) {
        // this function is called "per value" / "per control" - not for lists of controls
        var res = '';
        
        // set path correctly
        d.path = path;
        if(d.id)
            d.path +=  '.' + d.id;

        // backup value
        d.valOrig = d.val

        if(level == 0)
            res += '<table border="0" class="propertyGridContainer">';

        var spacetd = '<td class="pgSpacer"></td>';

        if(d.childs) {
            // work off all child data
            if(d.name)
                res += '</table><table border="0" class="propertyGridContainer"><tr class="pgGroupTitle"><td colspan="3" class="pgMinus">' + d.name + '</td></tr><tr>'+spacetd+'<td colspan="2"><table border="0" class="propertyGridContainer">\n';
            
            if(d.childs) {
                for(var k in d.childs) {
                    d.childs[k].id = k; // always assign the id
                    if(!d.childs[k].name) d.childs[k].name = d.childs[k].id; // usethe id as name if no name was provided
                    d.childs[k].id = k; // always assign the id
                    res += this.workRec(d.childs[k], d.path, level + 1) + '\n';
                }
            }
            res += '</table></td></tr>\n';
        } else {
            if(d.type in controls) {
                d.ctrl = new controls[d.type](d);
                res += '<tr class="pgItemRow"';
                if(d.description)
                    res += ' title="' + d.description + '" '
                res += '><td class="pgGroupItemText"><label for="'+d.path+'">' + d.name + '</label></td><td class="pgInputHolder">' + d.ctrl.create() + '</td></tr>';
            } else {
                this.errormsg('unknown control type: ' + d.type);
            }

        }

        if(level == 0)
            res += '</table>';

        return res;
    }

}