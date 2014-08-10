var VehicleChooser = (function() {
    'use strict';

    var mainDiv;

    var vehicleChoose;
    var configurationChoose;

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
            configurationChoose = $('<select style="width: 100%"></select>').appendTo(cChooseBox);

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
        configurationChoose.empty();
        $.each(vehicles[vehicle][2], function(index, val) {
            $('<option value="'+index+'">'+val[1]+'</option>').appendTo(configurationChoose);
        });
    }

    function changeVehicle(){
        var vehicleID = vehicleChoose.children('option:selected').attr('value');
        var vehicle = vehicles[vehicleID][0];
        var configurationID = configurationChoose.children('option:selected').attr('value');
        var configuration = vehicles[vehicleID][2][configurationID][2];
        console.log(vehicle);
        console.log(configuration);
        beamng.sendGameEngine('chooseVehicle( "'+vehicle+'", "'+configuration+'", "", 1);');
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

    var brands = ["Gavril","Bruckell","Ibishu","Civetta","Hirochi","Other"]; // We need some way to add/load brands here dynamically

    var states = {"brand": 0, "model": 1, "configuration": 2, "color": 3 };
    var state = states.brand;

    var panels = [{},{},{},{},{}];

    var choosen = {"brand":null,"model":null,"configuration":null,"color":null, "metallic":0};

    var colorPicker;
    var lastColor = "rgba(255,0,255,0.6)";

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
        for (var i = 0; i < brands.length; i++) {
            if(name.indexOf(brands[i]) === 0){
                return brands[i];
            }
        }
        return "Other";
    }

    function fillBrandPanel(){
    	panels[0].body.empty();
    	var brandButtons = brands.slice();
            brandButtons.unshift("All");
            panels[0].main.show();
            $.each(brandButtons, function(index, val) {
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
            if(val[3] == choosen.brand || choosen.brand == "All"){
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
        $.each(vehicles[choosen.modelPosition][2], function(index, val) {
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
    		choosen.color = (c.r/255)+" "+(c.g/255)+" "+(c.b/255)+" "+(c.a*2);
    		console.log(choosen.color);

		});
		$("<br>").appendTo(panels[3].body);
		var metallicCheckbox = $("<input type='checkbox'></input>").appendTo(panels[3].body);
		metallicCheckbox.change(function(event) {
			choosen.metallic = (metallicCheckbox.is(":checked") ? 1 : 0);
		});
		$("<span> metallic</span>").appendTo(panels[3].body);
    }

    function resetBrand(){

    	panels[0].title.html("Brand");
    	panels[0].body.slideDown();

        for (var i = 1; i < 5; i++) {
        	panels[i].main.slideUp();
        };    	
    }

    function setBrand(brand){
        choosen.brand = brand;
        panels[0].body.slideUp();

        fillModelPanel();

        panels[1].title.html("Model");
        panels[1].main.slideDown();
        panels[1].body.slideDown();

        for (var i = 2; i < 5; i++) {
        	panels[i].main.slideUp();
        };
    }

    function setModel(model,modelPosition){
        choosen.model = model;
        choosen.modelPosition = modelPosition;
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
        choosen.configuration = config;
        panels[2].body.slideUp();

        fillColorPanel();

		panels[3].main.slideDown();
        panels[3].body.slideDown();
        colorPicker.spectrum("reflow");
        
        panels[4].main.show();
    }
    
    function open(){
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
        		setBrand(choosen.brand);
            });
            panels[2].title.click(function(event) {
        		setModel(choosen.model,choosen.modelPosition);
            });
            panels[4].title.click(function(event) {
            	//Magic
            	beamng.sendGameEngine('chooseVehicle( "'+choosen.model+'", "'+choosen.configuration+'", "'+choosen.color+'", '+choosen.metallic+');');
            	close();
            });
            

            // Fill BrandPanel
            fillBrandPanel();
            resize();
        });
    }

    function close(){
        mainDiv.parent().hide();
    }

    function resize(){
        mainDiv.dialog("option","width",$(window).width()-70);
        mainDiv.dialog("option","height",$(window).height()-70);

            for (var i = 0; i < 5; i++) {
                panels[i].body.css('max-height', $(window).height()-200);
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

$.widget("beamNG.bigButton", {
    _create : function(){

        // creating the widget
        this.element.addClass('appButton');

        this.front = $("<div class='appButtonImage'></div>").appendTo(this.element);
        this.title = $("<div class='appButtonTitle'>"+this.options.title+"</div>").appendTo(this.element);
        if(this.options.smallTitle){
            $(" <span class='appButtonSmall'>"+this.options.smallTitle+"</span>").appendTo(this.title);
        }
        this.detail = $("<div class='appButtonInfo'></div>").appendTo(this.element);

        var imageString = "";
        if(this.options.images){
	        for (var i = 0; i < this.options.images.length; i++) {
	        	imageString += "url("+this.options.images[i]+"), ";
	        }
	    }
        imageString += "url(images/appDefault.png)";
        console.log(imageString);
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