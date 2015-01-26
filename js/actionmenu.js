function ActionMenu( data ) {
    this.data = null;
    this.options = [];

    this.wheelDegrees = [0, -43, 43, -92, 92, -140, 140, 180];
    this.options = 8;
    this.previousElement;
    this.focusedItem = null;
    this.clickedItem = null;

    this.enabled = false;
    this.shown = false;

    this.show = function () {
        if (this.isEnabled()) {
            $("#actionmenu").show();
            this.shown = true;
        }
    }

    this.hide = function () {
        $("#actionmenu").hide();
        this.shown = false;
    };

    this.isShown = function () {
        return this.shown;
    };

    this.enable = function () {
        this.enabled = true;
    };

    this.disable = function () {
        this.enabled = false;
    };

    this.isEnabled = function () {
        return this.enabled;
    };

    this.init = function (data) {
        var option,
            span,
            triangle;

        $("#actionmenu").remove();

        // build actionmenu DOM
        var actionmenu = document.createElement('div');
            actionmenu.id = "actionmenu";
        var centerwheel = document.createElement('div');
            centerwheel.id = "centerwheel";
        var innerwheel = document.createElement('div');
            innerwheel.className = 'innerwheel';
        var items = document.createElement('div');
            items.className = 'items';

        centerwheel.appendChild(innerwheel);
        actionmenu.appendChild(centerwheel);
        actionmenu.appendChild(items);

        document.getElementsByTagName("body")[0].appendChild(actionmenu);
        ///////////

        this.options = [];
        this.data = data;

        for (var i = 0; i < data.length; i++) {
            option = document.createElement("div");
            option.id = "action_" + i;
            option.className = "option";

            span = document.createElement("span");
            span.innerHTML = data[i].title;

            option.appendChild(span);

            if (i == 0 || i == 7) { // triangles
                triangle = document.createElement("div");
                triangle.className = "triangle";
                option.appendChild(triangle);
            }

            $(option).bind("mouseenter", this._option_mouseenter.bind(this, i));
            $(option).bind("mousedown", this._option_mousedown.bind(this, i));
            $(option).bind("mouseup", this._option_mouseup.bind(this, i));

            this.options.push(option);

            document.querySelector("#actionmenu .items").appendChild(option);
        }

        this._option_mouseenter(0);

        this.enable();
    };

    this._option_mouseenter = function (idx) {
        if (this.clickedItem === null) {
            this.focusedItem = idx;

            $("#centerwheel").css("-webkit-transform", "rotate(" + this.wheelDegrees[idx] + "deg)");

            $(this.previousElement).removeClass("selected");

            $("#action_" + idx).addClass("selected");

            this.previousElement = "#action_" + idx;
        }
    };

    this._option_mousedown = function (idx) {
        this.clickedItem = idx;
        $("#action_" + idx).addClass("clicked");
    };

    this._option_mouseup = function (idx) {
        $("#action_" + this.clickedItem).removeClass("clicked");

        this.clickedItem = null;

        if (this.focusedItem === idx) {
            this.data[idx].onclick();
        }
    };

    this.init( data );
};
