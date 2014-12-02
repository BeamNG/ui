var VehicleChooser = (function(){
    'use strict';

    var state = 0;

    var mainDiv;
    var selector, buttonarea, stepBackButton, applyButton;

    var filterPanel, vehiclePanel, configurationsPanel,colorPanel;

    var vehicles;

    var vehicleinfo = {};
    var infoLoaderChain = [];
    var searchtree = {};

    var officialVehicles;

    var appliedFilters = {};

    var choosen = {};
    var current;

    var colorPicker;
    var colorVisualizer;
    var lastUsedColors;

    var firstRun = true;

    var defaultColor = '0.5 0 0 1.001';

    var heading;

    var startupTimer = new Timer('Startup');

    function init(){
        mainDiv = $("<div></div>").appendTo($("body")).attr('id', 'vehiclechooser');
        mainDiv.dialog({
            title: "Vehicle Selector",
            width: $(window).width()-70,
            height: $(window).height()-70,
            beforeClose : function(event, ui){
                close();
                return false;
            },
            resizable: false,
            draggable: false,
            closeOnEscape: true
        });
        selector = $("<div></div>").appendTo(mainDiv).addClass('selector');
        buttonarea = $("<div></div>").appendTo(mainDiv).addClass('buttonarea').hide();

        stepBackButton = $("<a><</a>").appendTo(buttonarea).css({
            background: 'gray'
        }).addClass('simplebutton').click(function(event) {
            setState(0);
        });

        applyButton = $("<a>Apply</a>").appendTo(buttonarea).css({
            background: 'green'
        }).addClass('simplebutton').click(function() {
            // get the used color
            try{
                setColor(colorPicker.spectrum("get", 'color'));
            }catch(e){}
            if(!choosen.color || choosen.color == 'InvisibleBlack' || choosen.color === ''){
                choosen.color = defaultColor;
            }
            // update the "last used colors"-list
            lastUsedColors.unshift(choosen.color);
            lastUsedColors = _.first(_.uniq(lastUsedColors),10);
            console.log(lastUsedColors);
            localStorage.bngVehicleSelectorColors = JSON.stringify(lastUsedColors);

            // get configfilename
            var configfile = "";
            if(choosen.configuration !== ""){
                configfile = vehicles[choosen.model].configs[choosen.configuration].file;
            }
            console.log('spawning: '+JSON.stringify(choosen));
            beamng.sendGameEngine('chooseVehicle( "'+choosen.model+'", "'+configfile+'", "'+choosen.color+'");');
            firstRun = false;
            close();
        });

        $(window).keyup(function(event) {
            if(event.which == 8 && state>0 && mainDiv.is(':visible')){
                setState(0);
            }
        });

        close();
    }

    function setState(s){
        state = s;
        if(state == 1){
            buttonarea.show(100);
            fillVehiclePanel();
        }else if(state == 0){
            buttonarea.hide(100);
            fillModelPanel();
        }
    }

    function dataProgress(){
        if(infoLoaderChain.length == 0){
            startupTimer.point("json loading");
            // everything loaded, now add the Creator tag
            $.each(vehicleinfo, function(name, data) {
                if(name.indexOf('\\')!=-1){ // we only want to iterate over vehicles
                    return;
                }
                if(_.contains(officialVehicles,name)){
                    vehicleinfo[name].Creator = "official";
                }else{
                    vehicleinfo[name].Creator = "community";
                }
            });            

            // enrich the configs with the info provided by the vehicle
            $.each(vehicleinfo, function(name, data) {
                if(name.indexOf('\\')==-1){ // we only want to iterate over the configs
                    return;
                }
                var nameParts = name.split('\\');
                var enrichedData = _.clone(vehicleinfo[nameParts[0]]); // Get the data from the vehicle
                $.each(data, function(index, val) { // and overwrite the basevalues with the confic specific ones
                    enrichedData[index] = val;
                });
                vehicleinfo[name] = enrichedData;
            });
            //console.log(vehicleinfo);

            // Now the other way round: a vehicle needs all attributes from its configs
            // First convert the vehicles
            $.each(vehicleinfo, function(name, data) {
                if(name.indexOf('\\')!=-1){ // we only want to iterate over the basevehicles
                    return;
                }
                $.each(vehicleinfo[name], function(key, val) {
                    vehicleinfo[name][key] = [val];
                });
            });
            // Now fill the basevehicle with all the stats from its various configs
            $.each(vehicleinfo, function(name, data) {
                if(name.indexOf('\\')==-1){ // we only want to iterate over the configs
                    return;
                }
                var basename = name.split('\\')[0];
                $.each(vehicleinfo[name], function(key, val) {
                    if(!(key in vehicleinfo[basename])){
                        vehicleinfo[basename][key] = [];
                    }
                    if(!(_.contains(vehicleinfo[basename][key],val))){
                        vehicleinfo[basename][key].push(val);
                    }
                });
            });
            //console.log(vehicleinfo);
            startupTimer.point('enrich Data');
            // Now build the searchtree

            $.each(vehicleinfo, function(vehicle, data) {
                $.each(data, function(key, val) {
                    if(!(key in searchtree)){
                        searchtree[key] = {};
                    }
                    if(typeof val == "string"){ // only a single value
                        if(!(val in searchtree[key])){
                            searchtree[key][val] = [];
                        }
                        if(!(vehicle in searchtree[key][val])){
                            searchtree[key][val].push(vehicle);
                        }
                    }else{ // multiple values
                        $.each(val, function(index, v) {
                            if(!(v in searchtree[key])){
                                searchtree[key][v] = [];
                            }
                            if(!(vehicle in searchtree[key][v])){
                                searchtree[key][v].push(vehicle);
                            }
                        });
                    }
                });
            });
            startupTimer.point('build searchtree');
            openFinalize();
        }
    }

    function getVehicleData(vehicle){
        infoLoaderChain.push(vehicle);
        $.getJSON("/vehicles/"+vehicle+"/info.json", function(data) {
            vehicleinfo[vehicle] = data;
        }).fail(function(){
            vehicleinfo[vehicle] = {Name: vehicles[vehicle].name, Brand: "Unknown"};
        }).always(function(){
            infoLoaderChain.splice(infoLoaderChain.indexOf(vehicle),1);
            dataProgress();
        });
    }

    function getConfigData(vehicle, config){
        if(config === ''){
            return;
        }
        infoLoaderChain.push(vehicle+"\\"+config);

        $.getJSON("/vehicles/"+vehicle+"/info_"+config+".json", function(data) {
            vehicleinfo[vehicle+"\\"+config] = data;
        }).fail(function(){
            vehicleinfo[vehicle+"\\"+config] = {Configuration: vehicles[vehicle].configs[config].name};
        }).always(function(){
            infoLoaderChain.splice(infoLoaderChain.indexOf(vehicle+"\\"+config),1);
            dataProgress();
        });
    }

    function getData(){
        $.each(vehicles, function(vehicle, vehicleData) {
            getVehicleData(vehicle);
            $.each(vehicleData.configs, function(config) {
                getConfigData(vehicle, config);
            });
        });
        // load the official vehicles list
        infoLoaderChain.push('offical');
        $.getJSON('/html/officialmods.json', function(json, textStatus) {
            officialVehicles = json
        }).fail(function(){
            officialVehicles = [];
        }).always(function(){
            infoLoaderChain.splice(infoLoaderChain.indexOf('official'),1);
            dataProgress();
        });
    }

    function renderFilterCriterias(){
        //$('<div class="filterbox filtername">Search:<br><input type="text" /></div>').appendTo(filterPanel);
        $.each(searchtree, function(key, values) {
            if(_.contains(['default_color','colors','default_pc','Name','Configuration'], key)){ // We want specific tags not to show
                return;
            }
            var filter = $('<div class="filterbox"></div>').appendTo(filterPanel);
            $('<div class="filtername">'+key+'</div>').appendTo(filter);
            $.each(values, function(value) {
                var checked ='';
                if(appliedFilters[key] && _.contains(appliedFilters[key],value)){
                    checked = ' checked ';
                }
                var valueContainer = $('<div class="filterValueContainer"></div>').appendTo(filter);
                $('<input type="checkbox" '+checked+'/>').appendTo(valueContainer).change(function() {
                    if($(this).is(':checked')){
                        addFilter(key,value);
                        $(this).parent().addClass("selected");
                    }else{
                        removeFilter(key, value);
                        $(this).parent().removeClass("selected");
                    }
                });
                if(checked !== ''){
                    valueContainer.addClass("selected");
                }
                valueContainer.append(value);
            });
        });
        $('<div class="filterbox filtername">Remove filters</div>').appendTo(filterPanel).click(function(){
            // empty the filters and rerender
            appliedFilters = {};
            updateResults();
        });
    }

    function updateResults(){
        console.log(state);
        if(state == 1){
            updateConfigs();
        }else if(state === 0){
            renderModels();
        }
    }

    function fillVehiclePanel(){
        selector.empty();
        filterPanel = $('<div class="filterPanel"></div>').appendTo(selector);
        vehiclePanel = $('<div class="vehiclePanel"></div>').appendTo(selector);
        renderFilterCriterias();
        renderVehicles();

    }

    function renderVehicles(){
        var configsExist = _.size(vehicles[choosen.model].configs) > 1;
        var root = vehiclePanel;
        if(!configsExist){
            root = selector;
        }
        root.empty();
        heading = $("<h1>"+getVehicleName(choosen.vehicle)+"</h1>").appendTo(root);


        if(configsExist){
            configurationsPanel = $("<div></div>").appendTo(root);
            configurationsPanel.append("<h2>Configurations</h2>");
            renderConfigs();
            updateConfigs();
        }

        colorPanel = $("<div></div>").appendTo(root);
        renderColors();

    }

    function renderColors(){
        // Colorpart
        colorPanel.empty();
        var startColor = defaultColor;
        if(choosen.color){
            startColor = choosen.color;
        }
        colorPanel.append("<h2>Color</h2>");
        var colorContainer = $('<div></div>').appendTo(colorPanel).css({
            float: "left",
            margin: "2px"
        });
        colorVisualizer = $("<div></div>").colorWidget({color:convertColor(startColor),size:200}).appendTo(colorContainer);
        colorContainer.append("<br />");
        colorPicker = $("<input></input>").appendTo(colorContainer).spectrum({
            flat: true,
            showAlpha: true,
            showButtons: false,
            color: convertColor(startColor)
        });
        $(colorPicker).on("dragstop.spectrum", function(e, color) {
            setColor(color);
        });
        // now get the last used colors
        if(localStorage.bngVehicleSelectorColors && localStorage.bngVehicleSelectorColors.length > 0){
            lastUsedColors = JSON.parse(localStorage.bngVehicleSelectorColors);
            colorPanel.append("<h3>Last used colors</h3>");
        }else{
            lastUsedColors = [];
        }
        
        $.each(lastUsedColors, function(index, color) {
            addColor(convertColor(color));
        });
        // now get the vehicle specific colors
        if(vehicleinfo[choosen.model].colors){
            colorPanel.append("<h3>Factorycolors</h3>");
            $.each(vehicleinfo[choosen.model].colors[0], function(name, color) {
                addColor(convertColor(color),name);
            });
        }
    }

    function renderConfigs(){
        var configsExist = _.size(vehicles[choosen.model].configs) > 1;
        $.each(vehicles[choosen.model].configs, function(config, val) {
            if(configsExist && val.name == 'Default')
                return;
            console.log(val);
            $("<div></div>").appendTo(configurationsPanel).bigButton({
                title: val.name,
                clickAction: function(element){
                    configurationsPanel.find('.appButton').each(function(index, el) {
                        $(el).removeClass('selected');
                    });
                    element.addClass('selected');
                    choosen.configuration = config;
                    var identifier = choosen.model+'\\'+choosen.configuration;

                    console.log(vehicleinfo[identifier])
                    if(vehicleinfo[identifier].default_color && vehicleinfo[identifier].colors[vehicleinfo[identifier].default_color]){
                        choosen.color = vehicleinfo[identifier].colors[vehicleinfo[identifier].default_color];
                        choosen.colorName = vehicleinfo[identifier].default_color;
                        renderColors();
                    }
                    console.log(choosen);
                    heading.text(getVehicleName(choosen.model+'\\'+choosen.configuration));
                    console.log(config);
                },
                images: ["/vehicles/"+choosen.model+"/"+config+".png", "/vehicles/"+choosen.model+"/default.png"]
            }).data('config',choosen.model+'\\'+config);
        });
    }

    function updateConfigs(){
        console.log(configurationsPanel);
        var results = getResults(true);
        configurationsPanel.find("div.appButton").each(function(){
            var config = $(this).data('config');
            var opacity = _.contains(results, config) ? 1 : 0.5;
            $(this).css('opacity',opacity);
        });
    }

    function addColor(color, name){
        var button = $("<div></div>").appendTo(colorPanel).colorButton({
            name:name,
            color:color,
            clickAction: function(element){
                vehiclePanel.find('.colorButton').each(function(index, el) {
                    $(el).removeClass('selected');
                });
                element.addClass('selected');
                setColor(color);
            }
        });
        if(name && name == choosen.colorName){
            button.addClass('selected');
        }
    }

    function getVehicleName(e){
        var model = vehicleinfo[e];
        var name = model.Name;
        if(model.Brand && model.Brand != "Unknown"){
            name = model.Brand + " " + name;
        }
        if(e.indexOf('\\') != -1){
            name = name + " " + model.Configuration;
        }
        return name;      
    }

    function fillModelPanel(){
        selector.empty();
        filterPanel = $('<div class="filterPanel"></div>').appendTo(selector);
        vehiclePanel = $('<div class="vehiclePanel"></div>').appendTo(selector);
        renderFilterCriterias();
        renderModels();

    }

function getResults(configurations){
    var result = [];
    if(_.size(appliedFilters) > 0){ // We need to filter
        var resulttree = {};
        $.each(appliedFilters, function(key, values) {
            resulttree[key] = [];
            $.each(values, function(i, value) {
                resulttree[key].push(searchtree[key][value]);
            });
            // merge the array
            resulttree[key] = _.union.apply(_,resulttree[key]);
        });
        var keyresults = [];
        $.each(resulttree, function(index, val) {
            keyresults.push(val);
        });
        // keyresults is the list of results for the unique key, now just merge them so only the ones appearing in all subresults are in the final list
        result = _.intersection.apply(_, keyresults); // <3 underscore.js
        // for the moment we only want vehicles to be displayed, not the individual configurations
        if(!configurations){
            result = _.filter(result,function(name){return name.indexOf('\\') == -1;});
        }else{
            result = _.filter(result,function(name){return name.indexOf('\\') != -1;});
        }
    }else{ // We don't need to filter, just get all the vehicles
        if(!configurations){
            result = _.filter(_.keys(vehicleinfo),function(name){return name.indexOf('\\') == -1;});
        }else{
            result = _.filter(_.keys(vehicleinfo),function(name){return name.indexOf('\\') != -1;});
        } 
    }
    return result;
}

    function renderModels(){
        var models = getResults(false);

        // Now render
        vehiclePanel.empty();
        $("<div></div>").appendTo(vehiclePanel).bigButton({
                title: "Current Vehicle",
                clickAction: function(){
                    choosen = current;
                    choosen.vehicle = choosen.model
                    if(choosen.configuration != ""){
                        choosen.vehicle += "\\" + choosen.configuration;
                    }
                    setState(1);
                },
                images: ["/vehicles/"+current.model+"/"+current.configuration+".png", "/vehicles/"+current.model+"/default.png"]
            }).addClass('selected');
        $.each(models, function(i,e) {
            $("<div></div>").appendTo(vehiclePanel).bigButton({
                title: getVehicleName(e),
                clickAction: function(){
                    choosen.vehicle = e;
                    var parts = choosen.vehicle.split('\\');
                    if(parts.length > 1){
                        choosen.model = parts[0];
                        choosen.configuration = parts[1];
                    }else{
                        choosen.model = choosen.vehicle;
                        choosen.configuration = "";
                        if(vehicleinfo[e].default_pc && vehicleinfo[choosen.model+"\\"+vehicleinfo[e].default_pc[0]]){
                            choosen.configuration = vehicleinfo[e].default_pc[0];
                        }
                    }
                    if(vehicleinfo[e].default_color && vehicleinfo[e].colors[0][vehicleinfo[e].default_color[0]]){
                        choosen.color = vehicleinfo[e].colors[0][vehicleinfo[e].default_color[0]];
                        choosen.colorName = vehicleinfo[e].default_color[0];
                    }
                    setState(1);
                },
                images: ["/vehicles/"+e+"/default.png"]
            });
        });
    }

    function addFilter(key, value){
        if(!(key in appliedFilters)){
            appliedFilters[key] = [];
        }
        appliedFilters[key].push(value);
        updateResults();
    }

    function removeFilter(key, value){
        appliedFilters[key].splice(appliedFilters[key].indexOf(value),1);
        if(appliedFilters[key].length === 0){
            delete appliedFilters[key];
        }
        updateResults();
    }

    function setColor(color){
        console.log(color);
        colorVisualizer.colorWidget("color",color);
        colorPicker.spectrum("set", color);
        colorPicker.spectrum("reflow");
        var c = tinycolor(color).toRgb();
        if(c.a == 1){
            c.a = 1.001;
        }
        c.a = Math.max(c.a,0.004);
        choosen.color = (c.r/255)+" "+(c.g/255)+" "+(c.b/255)+" "+(c.a*2);
        console.log(choosen.color);
    }
    
    function convertColor(torqueColor){
        if(torqueColor == 'InvisibleBlack'){
            torqueColor = "0 0 0 0";
        }
        var components = torqueColor.split(' ');
        return tinycolor("rgba ("+(components[0]*255 |0)+", "+(components[1]*255 |0)+", "+(components[2]*255 |0)+", "+(components[3]*0.5)+")");
    }
    
    function open(reset){
        startupTimer.start();
        // reset the variables
        vehicleinfo = {};
        infoLoaderChain = [];
        searchtree = {};
        //appliedFilters = {};
        choosen = {};

        selector.empty();

        callGameEngineFuncCallback("getVehicleList()", function(res){
            startupTimer.point("VehicleList");
            vehicles = res;
            getData();
        });

        callGameEngineFuncCallback("getVehicle()", function(res){
            current = res;
            var configparts = current.configuration.split('/');
            current.configuration = configparts[configparts.length-1].split('.')[0];
        });
    }

    function openFinalize(){
        setState(0);
        startupTimer.point("build GUI");
        mainDiv.parent().show();
        mainDiv.dialog( "moveToTop" );
        startupTimer.point("show GUI");
        startupTimer.print();
    }

    function close(){
        mainDiv.parent().hide();
    }

    // run init
    $(document).ready(function() {
        init();
    });
    // public interface
    var VehicleChooser = {
        open: open,
        close:close
    };
    return VehicleChooser;
}());

$.widget("beamNG.bigButton", {
    _create : function(){

        // creating the widget
        this.element.addClass('appButton');

        this.front = $("<div class='appButtonImage'></div>").appendTo(this.element);
        this.title = $("<div class='appButtonTitle'>"+this.options.title+"</div>").appendTo(this.element);
        if(this.options.smallTitle){
            this.title.append(" <span class='appButtonSmall'>"+this.options.smallTitle+"</span>");
        }
        this.detail = $("<div class='appButtonInfo'></div>").appendTo(this.element);

        var imageString = "";
        if(this.options.images){
            for (var i = 0; i < this.options.images.length; i++) {
                imageString += "url("+this.options.images[i]+"), ";
            }
        }
        imageString += "url(images/appDefault.png)";
        this.front.css('background-image', imageString);

        // interactivity
        if(this.options.description){
            $("<div class='appButtonSmall'>by "+this.options.author+"</div>").appendTo(this.detail);
            $("<div>"+this.options.description+"</div>").appendTo(this.detail);

            this.element.hover(function() {
                $(this).children('.appButtonImage').first().stop(true, false).animate({height: 0}, 300);
            }, function() {
                $(this).children('.appButtonImage').first().stop(true, false).animate({height: 120}, 300);
            });
        }
        if(this.options.clickAction){
            var act = this.options.clickAction;
            var element = this.element;
            this.element.click(function() {
                act(element);
            });
        }
    }
});

$.widget("beamNG.colorButton", {
    _create : function(){

        // creating the widget
        this.element.addClass('colorButton');

        this.colorDiv = $("<div></div>").colorWidget({color: this.options.color}).appendTo(this.element).addClass('colorButtonColor');
        if(this.options.name){
            this.nameDiv  = $("<span class='colorButtonName'>"+this.options.name+"</span>").appendTo(this.element);
        }

        if(this.options.clickAction){
            var act = this.options.clickAction;
            var element = this.element;
            this.element.click(function() {
                act(element);
            });
        }
    }
});

$.widget("beamNG.colorWidget", {
    _create : function(){

        // creating the widget
        this.element.addClass('colorWidgetContainer');

        this.element.append('<div class="colorWidgetColor"></div><div class="colorWidgetChrome"></div><div class="colorWidgetShadow"></div>');

        this.colorDiv = this.element.find('.colorWidgetColor');
        this.transparencyDiv = this.element.find('.colorWidgetChrome');

        if(this.options.color){
            this.color(this.options.color);
        }

        if(this.options.size){
            this.element.css({
                width: this.options.size,
                height: this.options.size
            });
        }
    },
    _setOption: function( key, value ) {
        if(key == "color"){
            this.color(value);
            
        }else{
            this._super(key, value);
        }
    },
    color: function(color){
        this.options.color = color;
        color = tinycolor(color).toRgb();
        this.colorDiv.css('background-color', "rgb("+color.r+","+color.g+","+color.b+")");
        this.transparencyDiv.css('opacity', 1-color.a);
    }
});