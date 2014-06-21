$(document).ready(function() {
    LoadIndicator.initialize();
});

var LoadIndicator = {
    initialize : function(){
        this.html = $("<div id='loadindicator'></div>").css({
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            'background-color': 'rgba(0,0,0,0.8)',
            'z-index': '10000',
            color: 'white',
            padding: '7px',
            'border-radius': '30px',
            'font-size':'20px',
        }).hide();
        this.html.appendTo('body');

        $("<img src='css/images/ajax-loader.gif' />").css('float','left').appendTo(this.html);
        this.loadingText = $("<div></div>").css({'margin': '10px', 'margin-left': '60px', 'margin-right': '15px'}).appendTo(this.html);

    },
    loading : function(item){
        this.html.show();
        this.loadingText.html("loading "+item);
    },
    done : function(){
        this.html.hide();
    }
};
