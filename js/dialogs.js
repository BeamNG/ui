var VehicleChooser = (function(){
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