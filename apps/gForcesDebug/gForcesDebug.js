function gForcesDebug(){
	this.info = {
		title: "gMeter",
		preferredSize: [400,200],
		streams: ["electrics"]
	};
}

gForcesDebug.prototype.initialize = function(){
	$(this.rootElement).css('background-color', 'RGBA(255,255,255,0.9)');

	this.canvas = $('<canvas></canvas>').appendTo(this.rootElement);

	this.canvas.css({
		width: '100%',
		height: '100%'
	});

	this.resize();
};

gForcesDebug.prototype.update = function(streams){
	c = this.canvas[0];
	ctx = c.getContext('2d');
	ctx.clearRect(0,0,c.width,c.height);
	ctx.font = "20px sans-serif";

	ctx.fillText("Rootelement: "+this.rootElement.width()+"x"+this.rootElement.height(),20,60);
	ctx.fillText("Canvas: "+c.width+"x"+c.height,20,90);
	ctx.fillText("Widget: "+toInt(this._widget.app("option","width"))+"x"+toInt(this._widget.app("option","height")),20,120);
	ctx.fillText("Diff: "+(toInt(this._widget.app("option","width"))-c.width)+"x"+(toInt(this._widget.app("option","height"))-c.height),20,150);
	//ctx.fillText()

	ctx.fillRect(0,0,5,5);
	ctx.fillRect(c.width-5,0,5,5);
	ctx.fillRect(c.width-5,c.height-5,5,5);
	ctx.fillRect(0,c.height-5,5,5);
};

gForcesDebug.prototype.resize = function(){
	c = this.canvas[0];
	c.width = this.canvas.width();
	c.height = this.canvas.height();
};
