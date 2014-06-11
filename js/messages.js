function oMessage(args){
	MessageManager.message(args);
}

var MessageManager = {
	displaytime : 1000,
	message : function(args){
		if(this.initialized === undefined){
			this.inititalize();
		}
		console.log("new exisd" + JSON.stringify(args));
		var slot = this.messageSlot[args.ttl];

		if(slot.html() !== ""){
			slot.stop(1);
		}else{
			slot.animate({opacity: 1}, 300);
		}

		slot.html("<b>"+args.category+"</b> "+args.msg);
		slot.animate({opacity: 1}, 2000);
		slot.animate({opacity: 0}, 300, function(){
			slot.html("");
		});

	},
	inititalize : function(){
		console.log("initializing");
		this.container = $("<div></div>").appendTo($("body")).css({
			top: '40px',
			left: '5px',
			position: 'absolute'
		});

		this.messageSlot = [];
		
		for (var i = 0; i <= 5; i++){
			this.messageSlot[i] = $("<div></div>").appendTo(this.container);
		}

		this.initialized = true;
	}
};