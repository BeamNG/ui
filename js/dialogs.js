var VehicleChooser = (function() {
    'use strict';

    var mainDiv;

    var vehicleChoose;
    var ConfigurationChoose;

    var changeButton;

    var vehicles;

    var lastColor = "rgba(255,0,255,0.6)";


    function init(){
        callGameEngineFuncCallback("getVehicleList()", function(res){
            var cChooseBox, vChooseBox;
            vehicles = res;

            vChooseBox = $('<div><label>Choose Vehicle</label></div>').appendTo(mainDiv);
            vehicleChoose = $('<select style="width: 100%"></select>').appendTo(vChooseBox);

            vehicleChoose.change(function(event) {
                updateConfigurations(vehicleChoose.children('option:selected').attr('value'));
            });


            $.each(vehicles, function(index, val) {
                $('<option value="'+index+'">'+val[1]+'</option>').appendTo(vehicleChoose);
            });

            cChooseBox = $('<div><label>Choose Configuration</label></div>').appendTo(mainDiv);
            ConfigurationChoose = $('<select style="width: 100%"></select>').appendTo(cChooseBox);

            updateConfigurations(0);

            changeButton = $('<button>Change</button>').appendTo(mainDiv).click(function(event) {
                changeVehicle();
            });
        });


        mainDiv = $("<div id='vehiclechooser' style='background: #fff; overflow: hidden'></div>").appendTo($("body"));
        mainDiv.dialog({
            title: "Vehicle Selector",
            width: 350,
            height: 'auto',
            beforeClose : function(event, ui){
                close();
                return false;
            },
            resizable: false,
            closeOnEscape: true
        });
        close();
    }

    function updateConfigurations(vehicle){
        ConfigurationChoose.empty();
        $.each(vehicles[vehicle][2], function(index, val) {
            $('<option value="'+index+'">'+val[1]+'</option>').appendTo(ConfigurationChoose);
        });
    }

    function changeVehicle(){
        var vehicleID = vehicleChoose.children('option:selected').attr('value');
        var vehicle = vehicles[vehicleID][0];
        var ConfigurationID = ConfigurationChoose.children('option:selected').attr('value');
        var Configuration = vehicles[vehicleID][2][ConfigurationID][2];
        console.log(vehicle);
        console.log(Configuration);
        beamng.sendGameEngine('chooseVehicle( "'+vehicle+'", "'+Configuration+'", "", 1);');
        close();
    }

    function open(){
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

var VehicleChooser2 = (function(){
    'use strict';

    var mainDiv;
    var vehicles;

    var Brands = ["Gavril","Bruckell","Ibishu","Civetta","Hirochi","Other"]; // We need some way to add/load Brands here dynamically

    var states = {"Brand": 0, "Model": 1, "Configuration": 2, "Color": 3 };
    var state = states.Brand;

    var panels = [{},{},{},{},{}];

    var choosen = {};

    var colorPicker;
    var lastColor = "rgba(0,0,0,0.6)";

    var isOpen = false;

    function init(){
        mainDiv = $("<div id='vehiclechooser2' style='background: #fff; overflow: hidden'></div>").appendTo($("body"));
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
        panels[0].body.empty();
        var BrandButtons = Brands.slice();
            BrandButtons.unshift("All");
            panels[0].main.show();
            $.each(BrandButtons, function(index, val) {
                 $("<div></div>").appendTo(panels[0].body).bigButton({
                    title:val,
                    clickAction: function(){
                        panels[0].title.html("Brand: "+val);
                        setBrand(val);
                    } 
                });
            });
    }

    function fillModelPanel(){
        panels[1].body.empty();
        $.each(vehicles, function(index, val) {
            if(val[3] == choosen.Brand || choosen.Brand == "All"){
                $("<div></div>").appendTo(panels[1].body).bigButton({
                    title: val[1],
                    clickAction: function(){
                        panels[1].title.html("Model: "+val[1]);
                        setModel(val[0],index);
                    } 
                });
            }
        });
    }

    function fillConfigurationPanel(){
        panels[2].body.empty();
        console.log(vehicles[2]);
        $.each(vehicles[choosen.ModelPosition][2], function(index, val) {
            console.log(val);
            $("<div></div>").appendTo(panels[2].body).bigButton({
                title: val[1],
                clickAction: function(){
                    panels[2].title.html("Configuration: "+val[1]);
                    setConfiguration(val[2]);
                } 
            });            
        });
    }

    function fillColorPanel(){
        panels[3].body.empty();
        colorPicker = $("<input></input>").appendTo(panels[3].body).spectrum({
            flat: true,
            showAlpha: true,
            showButtons: false,
            color: lastColor
        });
        $(colorPicker).on("dragstop.spectrum", function(e, color) {
            console.log(color.toHexString()); // #ff0000
            var c = lastColor = color.toRgb();
            choosen.Color = (c.r/255)+" "+(c.g/255)+" "+(c.b/255)+" "+(c.a*2);
            console.log(choosen.Color);

        });
    }

    function resetBrand(){

        panels[0].title.html("Brand");
        panels[0].body.slideDown();

        for (var i = 1; i < 5; i++) {
            panels[i].main.slideUp();
        }     
    }

    function setBrand(Brand){
        choosen.Brand = Brand;
        panels[0].body.slideUp();

        fillModelPanel();

        panels[1].title.html("Model");
        panels[1].main.slideDown();
        panels[1].body.slideDown();

        for (var i = 2; i < 5; i++) {
            panels[i].main.slideUp();
        }
    }

    function setModel(Model,ModelPosition){
        choosen.Model = Model;
        choosen.ModelPosition = ModelPosition;
        panels[1].body.slideUp();

        fillConfigurationPanel();

        panels[2].title.html("Configuration");
        panels[2].main.slideDown();
        panels[2].body.slideDown();

        for (var i = 3; i < 4; i++) {
            panels[i].main.slideUp();
        }
        panels[4].main.show();
    }

    function setConfiguration(config){
        choosen.Configuration = config;
        panels[2].body.slideUp();

        fillColorPanel();

        panels[3].main.slideDown();
        panels[3].body.slideDown();
        colorPicker.spectrum("reflow");
        
        panels[4].main.show();
    }
    
    function open(){
        choosen = {"Brand":"","Model":"","Configuration":"","Color":""};
        mainDiv.empty();
        $("<img src='images/loading.gif'>").appendTo(mainDiv);

        mainDiv.parent().show();
        mainDiv.dialog( "moveToTop" );

        callGameEngineFuncCallback("getVehicleList()", function(res){
            vehicles = res;
            $.each(vehicles, function(index, val) {
                vehicles[index][3] = findBrand(val[1]);
            });

            mainDiv.empty();
            mainDiv.css('overflow', 'hidden');
            var titles = ["Brand","Model","Configuration","Color","Apply"];
            for (var i = 0; i < 5; i++) {
                panels[i].main = $("<div style='background: #aaa; padding: 5px; margin:2px; overflow: hidden'></div>").appendTo(mainDiv).hide();
                panels[i].title = $("<div style='background: #aaa; margin: 2px;'>"+titles[i]+"</div>").appendTo(panels[i].main);
                panels[i].body = $("<div style='background: #fff; overflow:auto; max-height:500px'></div>").appendTo(panels[i].main);
            }

            panels[0].title.click(function(event) {
                resetBrand();
            });
            panels[1].title.click(function(event) {
                setBrand(choosen.Brand);
            });
            panels[2].title.click(function(event) {
                setModel(choosen.Model,choosen.ModelPosition);
            });
            panels[4].title.click(function(event) {
                //Magic
                beamng.sendGameEngine('chooseVehicle( "'+choosen.Model+'", "'+choosen.Configuration+'", "'+choosen.Color+'");');
                close();
            });
            

            // Fill BrandPanel
            fillBrandPanel();
            isOpen = true;
            resize();
        });
    }

    function close(){
        mainDiv.parent().hide();
        isOpen = false;
    }

    function resize(){
        mainDiv.dialog("option","width",$(window).width()-70);
        mainDiv.dialog("option","height",$(window).height()-70); 

        if(isOpen){
            for (var i = 0; i < 5; i++) {
                panels[i].body.css('max-height', $(window).height()-200);
            }
        }
    }

    // run init
    $(document).ready(function() {
        init();
        $(window).resize(function(event) {
            resize();
        }); 
    });
    // public interface
    var VehicleChooser = {
        open: open,
        close:close
    };
    return VehicleChooser;
}());

var VehicleChooser3 = (function(){
    'use strict';

    var mainDiv;
    var breadcrumb, selector, applyButton;
    var vehicles;

    var states = ["Brand","Model","Configuration","Color"];
    var state = 0;

    var Brands = ["Gavril","Bruckell","Ibishu","Civetta","Hirochi","Other"]; // We need some way to add/load Brands here dynamically
    var brandCars = {};

    var choosen = {};
    var choosenReadable = {};

    var colorPicker;
    var lastColor = "rgba(0,0,0,0.6)";

    var firstRun = true;

    function init(){
        mainDiv = $("<div id='vehiclechooser3' style='background: #fff; overflow: hidden'></div>").appendTo($("body"));
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
        }).css({
            padding: '0'
        });
        breadcrumb = $("<div>Brand</div>").appendTo(mainDiv).css({
            'font-size': '90%',
            margin: 5
        });
        selector = $("<div></div>").appendTo(mainDiv).css({
            overflow: 'auto'
        });
        applyButton = $("<a>Apply</a>").appendTo(mainDiv).css({
            background: 'green',
            color: 'white',
            padding: 10,
            'border-radius': 5,
            'text-shadow': 'none',
            position: 'absolute',
            bottom: 5,
            right: 5,
            display: 'none'
        }).click(function() {
            beamng.sendGameEngine('chooseVehicle( "'+choosen.Model+'", "'+choosen.Configuration+'", "'+choosen.Color+'");');
            firstRun = false;
            close();
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
                var imgArr = ["file:///vehicles/common/brand_"+brand+".png"];
                if(brandCars[brand]){
                    $.each(brandCars[brand], function(index, val) {
                         imgArr.push("file:///vehicles/"+val+"/brand_"+brand+".png");
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
            if(val[3] == choosen.Brand || choosen.Brand == "All"){
                $("<div></div>").appendTo(selector).bigButton({
                    title: val[1],
                    clickAction: function(){
                        setModel(val[0],index, val[1]);
                    },
                    images: ["file:///vehicles/"+val[0]+"/default.png"]
                });
            }
        });
    }

    function fillConfigurationPanel(){
        var configsExist = vehicles[choosen.ModelPosition][2].length > 1;
        $.each(vehicles[choosen.ModelPosition][2], function(index, val) {
            if(configsExist && val[1] == 'Default')
                return;
            $("<div></div>").appendTo(selector).bigButton({
                title: val[1],
                clickAction: function(){
                    setConfiguration(val[2],val[1]);
                },
                images: ["file:///vehicles/"+vehicles[choosen.ModelPosition][0]+"/"+val[0]+".png", "file:///vehicles/"+vehicles[choosen.ModelPosition][0]+"/default.png"]
            });            
        });
    }

    function fillColorPanel(){
        colorPicker = $("<input></input>").appendTo(selector).spectrum({
            flat: true,
            showAlpha: true,
            showButtons: false,
            color: lastColor
        });
        $(colorPicker).on("dragstop.spectrum", function(e, color) {
            console.log(color.toHexString()); // #ff0000
            var c = lastColor = color.toRgb();
            choosen.Color = (c.r/255)+" "+(c.g/255)+" "+(c.b/255)+" "+(c.a*2);
        });
    }

    function setBrand(Brand){
        choosen.Brand = Brand;
        choosenReadable.Brand = Brand;
        setState(1);
    }

    function setModel(Model,ModelPosition,modelName){
        choosen.Model = Model;
        choosenReadable.Model = modelName;
        choosen.ModelPosition = ModelPosition;

        if(vehicles[choosen.ModelPosition][2].length > 1){
            setState(2);
        }else{
            setConfiguration("","Default");
        }
    }

    function setConfiguration(config,configName){
        choosen.Configuration = config;
        choosenReadable.Configuration = configName;

        setState(3);
        colorPicker.spectrum("reflow");

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
            applyButton.show();
        }else{
            applyButton.hide();
        }
    }
    
    function open(reset){
        if(reset && reset === true){
            breadcrumb.empty();
            selector.empty();            
        }


        mainDiv.parent().show();
        mainDiv.dialog( "moveToTop" );

        callGameEngineFuncCallback("getVehicleList()", function(res){
            vehicles = res;
            brandCars = {};
            $.each(vehicles, function(index, val) {
                var brand = findBrand(val[1]);
                vehicles[index][3] = brand;
                if(!brandCars[brand]){
                    brandCars[brand] = [val[0]];
                }else{
                    brandCars[brand].push(val[0]);
                }
            });

            resize();
            if((reset && reset === true) || firstRun === true){
                setState(0);
            }else{

            }
        });
    }

    function close(){
        mainDiv.parent().hide();
    }

    function resize(){
        mainDiv.dialog("option","width",$(window).width()-90);
        mainDiv.dialog("option","height",$(window).height()-70);
        selector.height(mainDiv.height()-breadcrumb.height()-30);
    }

    // run init
    $(document).ready(function() {
        init();
        $(window).resize(function(event) {
            resize();
        }); 
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