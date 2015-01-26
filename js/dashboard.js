function Dashboard() {
    this.NAVIGATION = {
        "MAINMENU": "mainmenu",
        "OPTIONS": "options",
        "PLAY": "play",
        "DD_SINGLEPLAYER": "singleplayer",
        "DD_SP_FREEROAM": "freeroam",
        "DD_SP_RACE": "race",
        "CHANGE_LEVEL": "changelevel",
        "CHANGE_VEHICLE": "changevehicle",
        "CHANGE_ENVIRONMENT": "changeenvironment",
        "PARTS_MANAGER": "parts_manager"
    };

    this.dashboardExpandTypes = [
        {
            "width": window.innerWidth + 20,
            "height": window.innerHeight,
            "top": "0%",
            marginTop: 0
        },
        {
            "width": 345,
            "height": window.innerHeight,
            "top": "0%",
            marginTop: 0
        }
    ];

    this.dashboardContracted = {
        "width": 325,
        "height": 0,
        "top": "50%",
        marginTop: 0
    };

    this.dashboardExpanded = this.dashboardExpandTypes[0];

    this.dropdownCreated = false;

    this.currentState = this.NAVIGATION.MAINMENU;

    this.shown = false;

    this.hidable = true;

    this.dashboardData = null;

    this.setState = function (state) {
        this.currentState = state;
    };

    this.getState = function () {
        return this.currentState;
    };

    this.setHidable = function (hidable) {
        this.hidable = hidable;
    }

    this.isHidable = function () {
        return this.hidable;
    };

    this.contractDashboard = function (callback) {
        $("#content").animate({"opacity": 0}, 250, function() {
            $("#content").attr("src","");
            $("#overlay").animate({"height": this.dashboardContracted.height}, 200);
            this._resizeDashboard(this.dashboardContracted, callback);
        }.bind(this));
    };

    this.expandDashboard = function (callback) {
        $("#content").css("height", this.dashboardExpanded.height - 57)
        this._resizeDashboard(this.dashboardExpanded, callback);
    }

    this._resizeDashboard = function (data, callback) {
        $("#sidepanel").animate(data, 200, "linear", callback)
    };

    this.changeExpandType = function( type ) {
        this.dashboardExpanded = this.dashboardExpandTypes[type];
    };

    this.addNav = function (title, onclick) {
        var navLink = document.createElement("a");
        navLink.href = "#";
        navLink.style.opacity = 0;
        navLink.innerHTML = title;

        document.querySelector("#sidepanel .navigation .nav_options").appendChild(navLink)

        $(navLink).animate({"opacity": 1}, 150);

        if (onclick) {
            $(navLink).bind("click", onclick)
        }
    };

    this.removeNav = function (idx) {
        var navigation = $("#sidepanel .navigation .nav_options a");
        count = navigation.length;

        if (count > 1) {
            for (var i = idx + 1; i < count; i++) {
                $($("#sidepanel .navigation .nav_options a")[idx + 1]).remove();
            }
        }
    };

    this.showPanel = function () {
        this.shown = true;

        $("#sidepanel").show().animate({
            "left": "-5px"
        }, 220);
    };

    this.hidePanel = function (callback) {
        if (this.isHidable()) {
            this.shown = false;

            $("#sidepanel").animate({
                "left": "-322px"
            }, 220, function () {
                $("#sidepanel").hide();
                callback && callback();
            });
        }
    };

    this.isShown = function () {
        return this.shown;
    };

    this.restore = function () {
        if (this.isDropdownCreated()) {
            this.hideDropdown(true);
            this.clearDashboard();
            this.buildDashboard(this.dashboardData, true);
            this.setState(this.NAVIGATION.MAINMENU);

            return true;
        } else if (this.getState() != this.NAVIGATION.MAINMENU) {
            this.removeNav(0);

            this.contractDashboard(function () {
                this.buildDashboard(this.dashboardData);
                this.showDashboard();
                this.setState(this.NAVIGATION.MAINMENU);
            }.bind(this));

            return true;
        }

        return false;
    };

    this.mouseDownDashboard = function (clickedItem) {
        $(clickedItem).addClass("clicked");
    };

    this.mouseUpDashboard = function (clickedItem, callback) {
        $(clickedItem).removeClass("clicked");

        callback && callback();
    };

    this.clickDashboard = function (clickedItem, callback) {
        $($("#dashboard .button")[clickedItem]).addClass("selected");

        setTimeout(function () {
            $("#dashboard").animate({"opacity": 0}, 150, "linear", function () {
                $("#overlay").hide();
                $("#dashboard").hide().css("opacity", "1");

                this.clearDashboard();

                this.expandDashboard(function () {
                    callback && callback();
                });
            }.bind(this));
        }.bind(this), 260);
    };

    this.buildPanel = function() {
        // build dashboard DOM
        var sidepanel = document.createElement("div");
            sidepanel.id = "sidepanel";
            sidepanel.className = "sidepanel";
        var overlay = document.createElement("div");
            overlay.id = "overlay";
        var navigation = document.createElement("div");
            navigation.className = "navigation";
        var nav_options = document.createElement("div");
            nav_options.className = "nav_options";

        var ifr = document.createElement("iframe");
            ifr.id = "content";

        sidepanel.appendChild(overlay);
        navigation.appendChild(nav_options);
        sidepanel.appendChild(navigation);

        sidepanel.appendChild(ifr);

        document.getElementsByTagName("body")[0].appendChild(sidepanel);
        ////////////
    };

    this.buildDashboard = function (data, shown) {
        var element,
            title,
            thumb,
            bottomElements = 0,
            topElements = 0;

        var dashboard = document.createElement("div");
            dashboard.id = "dashboard";

        $("#sidepanel")[0].appendChild(dashboard);

        this.dashboardData = data;
        this.dropdownCreated = false;

        for (var i = 0; i < data.length; i++) {
            // create menu elements
            element = document.createElement("div");
            title = document.createElement("span");
            thumb = document.createElement("div");

            // add thumbnail
            thumb.className = "pic " + data[i].classname;
            element.appendChild(thumb);

            // add title
            title.innerHTML = data[i].title;
            element.appendChild(title);

            // assign option
            element.id = "dashboard_" + data[i].id;
            element.classList.add("button");

            if (data[i].bottom) {
                if (bottomElements == 0) {
                    element.classList.add('bottomFirst');
                } else {
                    element.classList.add('bottom');
                }

                bottomElements++;
            }

            if (data[i].top) {
                element.classList.add('top');

                topElements++;
            }

            // assign call functions
            $(element).bind('mousedown', this.mouseDownDashboard.bind(this, element));
            $(element).bind('mouseup', this.mouseUpDashboard.bind(this, element, data[i].mouseup));

            // append to dashboard
            document.getElementById("dashboard").appendChild(element);
        }

        if (shown) {
            $("#overlay").show();
            document.getElementById("dashboard").style.opacity = 1;
        } else {
            document.getElementById("dashboard").style.opacity = 0;
        }

        this.dashboardContracted.height = ( data.length * 47 ) + ( bottomElements ? 83 : 0) + ( topElements * 43 ) + 35;
        this.dashboardContracted.marginTop = this.dashboardContracted.height / 2 * -1;

        document.getElementById("dashboard").style.display = "block";
    };

    this.showDashboard = function (callback) {
        $("#overlay").show();
        $("#dashboard").animate({"opacity": 1}, 150, callback);
    };

    this.clearDashboard = function () {
        $("#dashboard").remove();
    };

    this.createDropdown = function (parent, backBtn, options, callback) {
        var dropdown = document.createElement("div"),
            content = document.createElement("div"),
            option,
            elHeight = 46;

        this.dropdownCreated = true;

        console.log(options);

        dropdown.id = "dropdown";
        dropdown.style.height = ( elHeight * options.length ) + "px";
        dropdown.style.top = options.positionTop + "px";
        content.className = "content";

        dropdown.appendChild(content);

        $("#" + parent).addClass("static").after(dropdown);
        $("#" + backBtn).addClass("static");

        for (var i = 0; i < options.items.length; i++) {
            option = document.createElement("div");
            option.className = "opt";
            option.innerHTML = options.items[i].title;

            $(option).bind('click', options.items[i].onclick);

            content.appendChild(option);
        }

        this._showDropdown(backBtn, parent, callback);
    };

    this._showDropdown = function (backBtn, parent, callback) {
        var dashboardElements = $("#dashboard").children(".button"),
            count = dashboardElements.length,
            slideDropdown,
            animationQueue = 0;

        slideDropdown = function (element) {
            animationQueue--;

            element.style.visibility = "hidden";

            if (animationQueue == 0) {
                $("#" + backBtn).children("span").html("Back");
                $("#" + backBtn + " .pic")[0].className = "pic back"

                $("#dropdown .content").animate({"top": "0%"}, 100, callback);
            }
        };

        for (var i = 0; i < count; i++) {
            if (dashboardElements[i].id != parent && dashboardElements[i].id != backBtn) {
                animationQueue++;
                $(dashboardElements[i]).animate({"opacity": 0}, 150, slideDropdown.bind(this, dashboardElements[i]));
            }
        }
    };

    this.hideDropdown = function (restoreDashboard, callback) {
        if ($("#dropdown").length > 0) {
            var animationQueue = 0;

            $("#dropdown .content").animate({"top": "-100%"}, 100, function () {
                var animationFinish = function () {
                    animationQueue--;

                    if (animationQueue <= 0) {
                        this.dropdownCreated = false;
                        $("#dropdown").remove();
                        callback && callback();
                    }
                };

                if (restoreDashboard) {
                    var dashboardElements = $("#dashboard").children(".button"),
                        count = dashboardElements.length;

                    for (var i = 0; i < count; i++) {
                        if (dashboardElements[i].style.visibility === "hidden") {
                            dashboardElements[i].style.visibility = "visible";

                            animationQueue++;
                            $(dashboardElements[i]).animate({"opacity": 1}, 100, animationFinish.bind(this));
                        } else {
                            $(dashboardElements[i]).removeClass("static");
                        }
                    }
                } else {
                    animationFinish.call(this);
                }
            }.bind(this));
        } else {
            this.dropdownCreated = false;
            callback && callback();
        }
    };

    this.isDropdownCreated = function () {
        return this.dropdownCreated;
    };
};