var VehicleChooserOld = (function(){
    'use strict';

    var mainDiv;
    var breadcrumb, selector, buttonarea, stepOneButton, stepBackButton, applyButton;
    var vehicles;

    var states = ["Brand","Model","Configuration","Color"];
    var state = 0;

    var Brands = ["Gavril","Bruckell","Ibishu","Civetta","Hirochi","Other"]; // We need some way to add/load Brands here dynamically
    var brandCars = {};

    var choosen = {};
    var choosenReadable = {};

    var colorPicker;

    var firstRun = true;

    var defaultColor = '0.5 0 0 1.001';

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
        breadcrumb = $("<div>Brand</div>").appendTo(mainDiv).addClass('breadcrumb');
        selector = $("<div></div>").appendTo(mainDiv).addClass('selector');
        buttonarea = $("<div></div>").appendTo(mainDiv).addClass('buttonarea').hide();

        stepOneButton = $("<a><<</a>").appendTo(buttonarea).css({
            background: 'grey'
        }).addClass('simplebutton').click(function(event) {
    		setState(0);
        });

        stepBackButton = $("<a><</a>").appendTo(buttonarea).css({
            background: 'gray'
        }).addClass('simplebutton').click(function(event) {
    		setState(state-1);
        });

        applyButton = $("<a>Apply</a>").appendTo(buttonarea).css({
            background: 'green',
            display: 'none'
        }).addClass('simplebutton').click(function() {
        	try{
        		setColor(colorPicker.spectrum("get", 'color'));
        	}catch(e){}
        	if(choosen.Color == 'InvisibleBlack' || choosen.Color === ''){
        		choosen.Color = defaultColor;
        	}
        	console.log('spawning: '+JSON.stringify(choosen));
            beamng.sendGameEngine('chooseVehicle( "'+choosen.Model+'", "'+choosen.Configuration+'", "'+choosen.Color+'");');
            firstRun = false;
            close();
        });

        $(window).keyup(function(event) {
        	if(event.which == 8 && state>0 && mainDiv.is(':visible')){
        		setState(state-1);
        	}
        });

        close();
    }

    function findBrand(name){
        for (var i = 0; i < Brands.length; i++) {
            if(name.indexOf(Brands[i]) === 0){
                return Brands[i];
            }
        }
        return "Other";
    }

    function fillBrandPanel(){
        var BrandButtons = Brands.slice();
            BrandButtons.unshift("All");
            $.each(BrandButtons, function(index, brand) {
                var amount = 0;
                if(brand == "All"){
                    $.each(brandCars, function(index, val) {
                        amount += val.length;
                    });
                }else{
                    amount = brandCars[brand].length;
                }
                // generate imagearray
                var imgArr = ["/vehicles/common/brand_"+brand+".png"];
                if(brandCars[brand]){
                    $.each(brandCars[brand], function(index, val) {
                         imgArr.push("/vehicles/"+val+"/brand_"+brand+".png");
                    });
                }
                $("<div></div>").appendTo(selector).bigButton({
                    title:brand,
                    clickAction: function(){
                        setBrand(brand);
                    },
                    smallTitle : amount + " Vehicle" + (amount>1 ? "s" : ""),
                    images : imgArr
                });
            });
    }

    function fillModelPanel(){
        $.each(vehicles, function(index, val) {
            if(val.brand == choosen.Brand || choosen.Brand == "All"){
                $("<div></div>").appendTo(selector).bigButton({
                    title: val.name,
                    clickAction: function(){
                        setModel(index);
                    },
                    images: ["/vehicles/"+index+"/default.png"]
                });
            }
        });
    }

    function fillConfigurationPanel(){
        var configsExist = _.size(vehicles[choosen.Model].configs) > 1;
        $.each(vehicles[choosen.Model].configs, function(index, val) {
            if(configsExist && val.name == 'Default')
                return;
            $("<div></div>").appendTo(selector).bigButton({
                title: val.name,
                clickAction: function(){
                    setConfiguration(index);
                },
                images: ["/vehicles/"+choosen.Model+"/"+index+".png", "/vehicles/"+choosen.Model+"/default.png"]
            });            
        });
    }

    function fillColorPanel(){
        colorPicker = $("<input></input>").appendTo(selector).spectrum({
            flat: true,
            showAlpha: true,
            showButtons: false,
            color: convertColor(defaultColor)
        });
        $(colorPicker).on("dragstop.spectrum", function(e, color) {
            setColor(color);
        });
    }

    function setBrand(Brand){
        choosen.Brand = Brand;
        choosenReadable.Brand = Brand;
        setState(1);
    }

    function setModel(Model){
        choosen.Model = Model;
        choosenReadable.Model = vehicles[Model].name;

        if(_.size(vehicles[Model].configs) > 1){
            setState(2);
        }else{
            setConfiguration("");
        }
    }

    function setConfiguration(config){
        choosen.Configuration = vehicles[choosen.Model].configs[config].file;
        choosenReadable.Configuration = vehicles[choosen.Model].configs[config].name;

        setState(3);
        colorPicker.spectrum("reflow");

    }

    function setColor(color){
    	console.log(color);
    	colorPicker.spectrum("set", color);
    	colorPicker.spectrum("reflow");
		var c = color.toRgb();
		if(c.a == 1){
			c.a = 1.001;
		}
		c.a = Math.max(c.a,0.004);
        choosen.Color = (c.r/255)+" "+(c.g/255)+" "+(c.b/255)+" "+(c.a*2);
        console.log(choosen.Color);
    }

    function convertColor(torqueColor){
    	console.log('converting color: '+torqueColor);
    	if(torqueColor == 'InvisibleBlack'){
    		torqueColor = "0 0 0 0";
    	}
    	var components = torqueColor.split(' ');
    	console.log(components);
    	return tinycolor("rgba ("+(components[0]*255 |0)+", "+(components[1]*255 |0)+", "+(components[2]*255 |0)+", "+(components[3]*0.5)+")");
    }

    function renderBreadcrumb(){
        breadcrumb.empty();
        
        for (var i = 0; i < state; i++) {
            renderBreadcrumbState(i);
            breadcrumb.append(" > ");
        }

        breadcrumb.append(states[state]);
    }

    function renderBreadcrumbState(i){
        var currentLink = $("<a></a>").appendTo(breadcrumb);
        currentLink.html("<span style='color:grey'>"+states[i]+":</span> "+choosenReadable[states[i]]);
        currentLink.click(function() {
            setState(i);
        });
    }

    function setState(st){
        state = st;
        renderBreadcrumb();
        for (var i = state; i < 4; i++) {
            choosen[states[i]] = "";
            choosenReadable[states[i]] = "";
        }
        selector.empty();

        switch(st){
            case 0:
                fillBrandPanel();
                break;
            case 1:
                fillModelPanel();
                break;
            case 2:
                fillConfigurationPanel();
                break;
            case 3:
                fillColorPanel();
        }
        if(state > 1){
            applyButton.show(100);
        }else{
            applyButton.hide(100);
        }
        if( state > 0){
        	buttonarea.show(100);
        }else{
        	buttonarea.hide(100);
        }
    }
    
    function open(reset){
        breadcrumb.empty();
        selector.empty();

        callGameEngineFuncCallback("getVehicleList()", function(res){
            vehicles = res;
            console.log(vehicles);
            brandCars = {};
            $.each(vehicles, function(index, val) {
                var brand = findBrand(val.name);
                vehicles[index].brand = brand;
                if(!brandCars[brand]){
                    brandCars[brand] = [index];
                }else{
                    brandCars[brand].push(index);
                }
            });

            if((reset && reset === true) || firstRun === true){
                setState(0);
                openFinalize();
            }else{
            	callGameEngineFuncCallback("getVehicle()", function(res){
            		console.log(res);
            		setBrand(vehicles[res.model].brand);
            		setModel(res.model);
            		var config = "";
            		$.each(vehicles[res.model].configs, function(index, val) {
            			if(val.file == res.configuration){
            				config = index;
            				return;
            			}
            		});
            		setConfiguration(config);
            		openFinalize();
            		setColor(convertColor(res.color));
            	});
            }
        });
    }

    function openFinalize(){
        mainDiv.parent().show();
        mainDiv.dialog( "moveToTop" );
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

var VehicleChooser = (function(){
    'use strict';

    var mainDiv;
    var selector, buttonarea, stepBackButton, applyButton;

    var filterPanel, vehiclePanel;

    var vehicles;

    var vehicleinfo = {};
    var infoLoaderChain = [];
    var searchtree = {};

    var appliedFilters = {};

    var choosen = {};

    var colorPicker;

    var firstRun = true;

    var defaultColor = '0.5 0 0 1.001';

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
            try{
                setColor(colorPicker.spectrum("get", 'color'));
            }catch(e){}
            if(choosen.Color == 'InvisibleBlack' || choosen.Color === ''){
                choosen.Color = defaultColor;
            }
            console.log('spawning: '+JSON.stringify(choosen));
            beamng.sendGameEngine('chooseVehicle( "'+choosen.Model+'", "'+choosen.Configuration+'", "'+choosen.Color+'");');
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

    function dataProgress(){
        if(infoLoaderChain.length == 0){
            console.log(vehicleinfo);
            // Everything loaded, now enrich the configs with the info provided by the vehicle
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
            console.log(vehicleinfo);

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
                var basename = name.split('\\')[0]
                $.each(vehicleinfo[name], function(key, val) {
                    if(!(key in vehicleinfo[basename])){
                        vehicleinfo[basename][key] = [];
                    }
                    if(!(_.contains(vehicleinfo[basename][key],val))){
                        vehicleinfo[basename][key].push(val);
                    }
                });
            });
            console.log(vehicleinfo);

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
            console.log(searchtree);

            // All done, show the dialog now
//            if((reset && reset === true) || firstRun === true){
                openFinalize();
/*            }else{
                callGameEngineFuncCallback("getVehicle()", function(res){
                    console.log(res);
                    openFinalize();
                });
            }*/

        }
    }

    function getVehicleData(vehicle){
        infoLoaderChain.push(vehicle);
        $.getJSON("/vehicles/"+vehicle+"/info.json", function(data) {
            vehicleinfo[vehicle] = data;
        }).fail(function(){
            vehicleinfo[vehicle] = {Name: vehicles[vehicle].name, Brand: "Unknown"}
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
            vehicleinfo[vehicle+"\\"+config] = {Configuration: vehicles[vehicle].configs[config].name}
        }).always(function(){
            infoLoaderChain.splice(infoLoaderChain.indexOf(vehicle+"\\"+config),1);
            dataProgress();
        });
    }

    function getData(){
        $.each(vehicles, function(vehicle, vehicleData) {
            getVehicleData(vehicle);
            $.each(vehicleData.configs, function(config, configData) {
                getConfigData(vehicle, config);
            });
        });
    }

    function renderFilterCriterias(){
        $.each(searchtree, function(key, values) {
            if(_.contains(['default_pc','Name','Configuration'], key)){ // We want specific not to show
                return;
            }
            var filter = $('<div class="filterbox"></div>').appendTo(filterPanel);
            $('<div class="filtername">'+key+'</div>').appendTo(filter);
            $.each(values, function(value) {
                console.log(value);
                $('<input type="checkbox" />').appendTo(filter).change(function(event) {
                    if($(this).is(':checked')){
                        addFilter(key,value);
                    }else{
                        removeFilter(key, value);
                    }
                });
                filter.append(value+"<br/>");
            });
        });
    }

    function fillModelPanel(){
        selector.empty();
        filterPanel = $('<div class="filterPanel"></div>').appendTo(selector);
        vehiclePanel = $('<div class="vehiclePanel"></div>').appendTo(selector);
        renderFilterCriterias();
        renderModels();
    }

    function renderModels(){
        console.log(appliedFilters);
        var models = [];
        var resulttree = {};
        if(_.size(appliedFilters) > 0){ // We need to filter
            console.log(appliedFilters);
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
            console.log(keyresults); // this is the list of results for the unique key, now just merge them so only the ones appearing in all subresults are in the final list
            models = _.intersection.apply(_, keyresults); // <3 underscore.js
            // for the moment we only want vehicles to be displayed, not the individual configurations
            models = _.filter(models,function(name){return name.indexOf('\\') == -1;});

        }else{ // We don't need to filter, just get all the vehicles
            models = _.filter(_.keys(vehicleinfo),function(name){return name.indexOf('\\') == -1;});
        }

        // Now render
        vehiclePanel.empty();
        $.each(models, function(i,e) {
            var model = vehicleinfo[e];
            var name = model.Name;
            if(model.Brand && model.Brand != "Unknown"){
                name = model.Brand + " " + name;
            }
            if(e.indexOf('\\') != -1){
                name = name + " " + model.Configuration;
            }
            $("<div></div>").appendTo(vehiclePanel).bigButton({
                title: name,
                clickAction: function(){
                    alert('Now do something here');
                    choosen.Model = 'pickup';
                    fillConfigurationPanel();
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
        renderModels();
    }

    function removeFilter(key, value){
        appliedFilters[key].splice(appliedFilters[key].indexOf(value),1)
        if(appliedFilters[key].length == 0){
            delete appliedFilters[key];
        }
        renderModels();
    }

    function setColor(color){
        console.log(color);
        colorPicker.spectrum("set", color);
        colorPicker.spectrum("reflow");
        var c = color.toRgb();
        if(c.a == 1){
            c.a = 1.001;
        }
        c.a = Math.max(c.a,0.004);
        choosen.Color = (c.r/255)+" "+(c.g/255)+" "+(c.b/255)+" "+(c.a*2);
        console.log(choosen.Color);
    }

    function convertColor(torqueColor){
        console.log('converting color: '+torqueColor);
        if(torqueColor == 'InvisibleBlack'){
            torqueColor = "0 0 0 0";
        }
        var components = torqueColor.split(' ');
        console.log(components);
        return tinycolor("rgba ("+(components[0]*255 |0)+", "+(components[1]*255 |0)+", "+(components[2]*255 |0)+", "+(components[3]*0.5)+")");
    }
    
    function open(reset){

        // reset the variables
        vehicleinfo = {};
        infoLoaderChain = [];
        searchtree = {};
        appliedFilters = {};
        choosen = {};

        selector.empty();

        callGameEngineFuncCallback("getVehicleList()", function(res){
            vehicles = res;
            getData();
        });
    }

    function openFinalize(){
        mainDiv.parent().show();
        mainDiv.dialog( "moveToTop" );
        fillModelPanel();
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
            this.element.click(function() {
                act();
            });
        }

    }
});