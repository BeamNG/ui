function Messages(){}

Messages.prototype.initialize = function() {
    this.messageSlot = [];
    console.log('Messages initialize');

    /*
    var t = this;
    $('<button>Connect</button>').appendTo(this.rootElement).click(function(){
        t.onXIControllerChanged({ctrl0_c: "1",ctrl1_c: "0",ctrl2_c: "0",ctrl3_c: "0",eventType: "connected",subjectCtrl: "0"});
    });
    $('<button>Disconnect</button>').appendTo(this.rootElement).click(function(){
        t.onXIControllerChanged({ctrl0_c: "0",ctrl1_c: "0",ctrl2_c: "0",ctrl3_c: "0",eventType: "disconnected",subjectCtrl: "0"});
    });
    $('<button>b0</button>').appendTo(this.rootElement).click(function(){
        t.onXIControllerBatteryWarning({ctrlID: "0",batLevel: "0"});
    });
    $('<button>b1</button>').appendTo(this.rootElement).click(function(){
        t.onXIControllerBatteryWarning({ctrlID: "0",batLevel: "1"});
    });
    $('<button>b2</button>').appendTo(this.rootElement).click(function(){
        t.onXIControllerBatteryWarning({ctrlID: "0",batLevel: "2"});
    });
    $('<button>b3</button>').appendTo(this.rootElement).click(function(){
        t.onXIControllerBatteryWarning({ctrlID: "0",batLevel: "3"});
    });
    */
};

Messages.prototype.update = function(streams) {
};

Messages.prototype.onMessage = function(args) {
    console.log(args);
    var time = args.ttl !== undefined ? args.ttl : 5;
    var category = args.category !== undefined ? args.category : 'default';
    var css = args.css !== undefined ? args.css : '';
    var images = args.images !== undefined ? args.images : '';
    var fct = args.fct !== undefined ? args.fct : '';
    var message = args.msg;


    var slot;
    var self = this;
    if( this.messageSlot[category] !== undefined ) {
        slot = this.messageSlot[category];
        slot.stop(1);
    }else{
        var elem = $("<div class='message "+ css + "'></div>").appendTo(this.rootElement);
        this.messageSlot[category] = elem;
        slot = this.messageSlot[category];
        slot.animate({opacity: 1}, 300);
    }

    slot.html(message);
    slot.animate({opacity: 1}, time * 1000);
    slot.animate({opacity: 0}, 300, function() {
        slot.remove();
        self.messageSlot[category] = undefined;
    });


};

Messages.prototype.onEditmode = function(enabled) {
    if(enabled) {
        this.onMessage({msg:"<br/>do not delete this app<br/>it is essential for ingame messages of events.<br/><br/>example:<br/>40 times slower than realtime", ttl:60000, category:'editmodewarning'});
    } else {
        this.onMessage({msg:'', ttl:-1, category:'editmodewarning'});
    }
};

Messages.prototype.onXIControllerBatteryWarning = function(args) {
    var batStateStr = 'empty';
    if(args.batLevel == 3) batStateStr = "full";
    else if(args.batLevel == 2) batStateStr = "medium";
    else if(args.batLevel == 1) batStateStr = "low";
    else if(args.batLevel == 0) batStateStr = "empty";

    var msgStr = "Controller " + (parseInt(args.ctrlID) + 1) + " Battery " + batStateStr;    

    var m = "<div class='imgdiv'>";    
    m += "<img class='imgover' src='file:///html/images/messages/controllers_bg.png' />";

    var batClass = 'bat_' + batStateStr;

    m += "<div class='blink "   + batClass + " controller_mask_" + args.ctrlID + "'></div>";
    m += "<div class='imgover blink " + batClass + " battery_" + args.batLevel + "_mask'></div>";
    m += "</div>";
    m += "<div style='line-height:64px;'>" + msgStr + "</div>";
    console.log(m);
    this.onMessage({msg:m, ttl:5, category:'controllers'});
};

Messages.prototype.onXIControllerChanged = function(args) {
    var msgStr = "Controller " + (parseInt(args.subjectCtrl) + 1) + " " + args.eventType;

    var m = "<div class='imgdiv'>";    
    m += "<img class='imgover' src='file:///html/images/messages/controllers_bg.png' />";

    for(var i = 0; i < 4; i++) {
        m += "<div class=' ";
        if(parseInt(args.subjectCtrl) == i) {
            m += "blink ";
        } else {
            m += "imgover nonsubject ";
        }

        var connected = args['ctrl' + i + '_c'] == '1';
        if(connected) {
            m += "green ";
        } else {
            m += "red ";            
        }
        
        m += " controller_mask_" + i + "'></div>";

        // warn about the battery level when the device is connected, and only for connected devices
        if(connected && args.eventType == 'connected') {
            var batLvl = parseInt(args['ctrl' + i + '_b']);
            if(batLvl >= 0 && batLvl < 3) {
                var t = this;
                var ctrlID = i;
                window.setTimeout(function(){t.onXIControllerBatteryWarning({ctrlID:ctrlID, batLevel:batLvl});}, 5000);
            }
        }
    }
    
    m += "<div class='imgover " + (args.eventType == 'connected' ? 'green' : 'red') + " gamepad_mask'></div>";
    m += "</div>";
    m += "<div style='line-height:64px;'>" + msgStr + "</div>";
    //console.log(m);
    this.onMessage({msg:m, ttl:5, category:'controllers'});
};