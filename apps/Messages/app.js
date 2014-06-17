function Messages(){}

Messages.prototype.initialize = function() {
    this.messageSlot = [];
    console.log('Messages initialize');
};

Messages.prototype.update = function(streams) {
};

Messages.prototype.onMessage = function(args) {
    if(this.messageSlot === undefined) return;

    var time = args.ttl !== undefined ? args.ttl : 5;
    var category = args.category !== undefined ? args.category : 'default';
    var message = args.msg;


    var slot;
    var self = this;
    if( this.messageSlot[category] !== undefined ) {
        slot = this.messageSlot[category];
        slot.stop(1);
    }else{
        this.messageSlot[category] = $("<div class='message'></div>").appendTo(this.rootElement);
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