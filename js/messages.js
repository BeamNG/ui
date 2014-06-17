function oMessage(args){
	MessageManager.message(args.category, args.msg, args.ttl);
}

var MessageManager = {
	message : function(category, message, time){
		if(time === undefined){
			time = 5;
		}
		var slot;
		var self = this;
		if(this.initialized === undefined){
			this.inititalize();
		}
		if( this.messageSlot[category] !== undefined ){
			slot = this.messageSlot[category];
			slot.stop(1);
		}else{
			this.messageSlot[category] = $("<div style='font-size: 20px; text-shadow: 1px 0 2px black, -1px 0 2px black, 0 1px 2px black, 0 -1px 2px black, 0 0 7px black; color: white;'></div>").appendTo(this.container);
			slot = this.messageSlot[category];
			slot.animate({opacity: 1}, 300);
		}

		slot.html(message);
		slot.animate({opacity: 1}, time * 1000);
		slot.animate({opacity: 0}, 300, function(){
			slot.remove();
			self.messageSlot[category] = undefined;
		});

	},
	inititalize : function(){
		console.log("initializing");
		this.container = $("<div></div>").appendTo($("body")).css({
			top: '10px',
			left: '10px',
			position: 'absolute',
			'z-index': 800
		});

		this.messageSlot = [];

		this.initialized = true;
	}
};