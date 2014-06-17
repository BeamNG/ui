function Messages(){}

Messages.prototype.initialize = function(){
	this.messageSlot = [];
};

Messages.prototype.update = function(streams){
};

Messages.prototype.onMessage = function(args){
	var time = args.ttl;
	var message = args.msg;
	var category = args.category;
	if(time === undefined){
		time = 5;
	}
	var slot;
	var self = this;
	if( this.messageSlot[category] !== undefined ){
		slot = this.messageSlot[category];
		slot.stop(1);
	}else{
		this.messageSlot[category] = $("<div class='message'></div>").appendTo(this.rootElement);
		slot = this.messageSlot[category];
		slot.animate({opacity: 1}, 300);
	}

	slot.html(message);
	slot.animate({opacity: 1}, time * 1000);
	slot.animate({opacity: 0}, 300, function(){
		slot.remove();
		self.messageSlot[category] = undefined;
	});
};