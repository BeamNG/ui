function Freeroam() {
    this.init = function () {
        this.setHidable(true);
        this.buildPanel();
        this.buildDashboard(this.dashboardData);

        this.contractDashboard(function () {
            this.showDashboard();
            this.addNav("Dashboard", this.navMainMenu.bind(this));
        }.bind(this));
    };

    this.navMainMenu = function () {
        this.restore();
    };

    this.changeLevel = function () {
        dashboard.setState(this.NAVIGATION.CHANGE_LEVEL);

        dashboard.clickDashboard(2, function () {
            dashboard.addNav("Environment");
            $("#content").load(function () {
                $("#content").animate({"opacity": 1}, 250);
            }).attr("src", "levelchooser.html");
        }.bind(this));
    };

    this.changeVehicle = function () {
        this.setState(this.NAVIGATION.CHANGE_VEHICLE);

        this.hidePanel(function() {
            VehicleChooser.open()
        });
    };

    this.changeEnvironment = function () {

    };

    this.partsManager = function () {
        this.setState(this.NAVIGATION.PARTS_MANAGER);

        dashboard.changeExpandType(1);
        dashboard.clickDashboard(5, function () {
            dashboard.changeExpandType(0);
            dashboard.addNav("Vehicle parts");
            $("#content").load(function(){
                $("#content").animate({"opacity": 1}, 250);
            }).attr("src", "templatePartmgmt.html");
        }.bind(this));
    };

    this.actionMenu = function () {
        this.hidePanel(function () {
            actionmenu.show();
        });
    };

    this.menuOptions = function () {
        this.setState(this.NAVIGATION.OPTIONS);

        dashboard.changeExpandType(1);
        dashboard.clickDashboard(7, function () {
            dashboard.changeExpandType(0);
            dashboard.addNav("Options");
            $("#content").load(function(){
                $("#content").animate({"opacity": 1}, 250);
            }).attr("src", "templateOptions.html");
        }.bind(this));
    };

    this.closeDash = function () {
        switch (this.getState()) {
            case this.NAVIGATION.PLAY:
                this._backPlay();
                break;
            case this.NAVIGATION.DD_SINGLEPLAYER:
                this._playMode();
                break;
            default:
                this.hidePanel();
                break;
        }
    };

    this.menuPlay = function () {
        switch (this.getState()) {
            case this.NAVIGATION.MAINMENU:
                this._playMode();
                break;
            default:
                this.closeDash();
                break;
        }
    };

    this._playMode = function () {
        var options = {
            positionTop: 134,
            items: [
                {
                    title: "SinglePlayer",
                    onclick: this.playSingleplayer.bind(this)
                }
            ]
        };

        $("#dashboard_play").removeClass("selected").children("span").html("Play");
        this.setState(this.NAVIGATION.PLAY);

        this.hideDropdown(false, function () {
            this.createDropdown("dashboard_" + this.dashboardData[1].id, "dashboard_" + this.dashboardData[0].id, options);
        }.bind(this));
    };

    this.playSingleplayer = function (callback) {
        var options = {
            positionTop: 134,
            items: [
                {
                    "title": "Freeroam",
                    "onclick": this.spFreeroam.bind(this)
                },
                {
                    "title": "Race",
                    "onclick": this.spRace.bind(this)
                }
            ]
        };

        // workaround since playSingleplayer() is also called as event, this is to bypass default event object
        if (Object.prototype.toString.call(callback) == "[object Object]") {
            callback = null
        }

        $("#dashboard_play").removeClass("selected").children("span").html("SinglePlayer");
        this.setState(this.NAVIGATION.DD_SINGLEPLAYER);

        this.hideDropdown(false, function () {
            this.createDropdown("dashboard_" + this.dashboardData[1].id, "dashboard_" + this.dashboardData[0].id, options,
                callback);
        }.bind(this));
    };

    this.spFreeroam = function () {
        this.setState(this.NAVIGATION.DD_SP_FREEROAM);
        $("#dashboard_play").removeClass("selected").children("span").html("Freeroam");

        this.hideDropdown(false, function () {
            dashboard.clickDashboard(2, function () {
                dashboard.addNav("Freeroam");
                $("#content").load(function () {
                    $("#content").animate({"opacity": 1}, 250);
                }).attr("src", "levelchooser.html");
            }.bind(this));
        }.bind(this));
    };

    this.spRace = function () {
        this.setState(NAVIGATION.DD_SP_FREEROAM);
        $("#dashboard_play").removeClass("selected").children("span").html("Race");

        this.hideDropdown(false, function () {
            this.clickDashboard(1, function () {
                this.addNav("Singleplayer", this.navSingleplayer.bind(this));
                this.addNav("Race");
            }.bind(this));
        }.bind(this));
    };

    this.navSingleplayer = function () {
        this.removeNav(0);

        this.contractDashboard(function () {
            this.buildDashboard(this.dashboardData);

            this.playSingleplayer(function () {
                this.showDashboard()
            }.bind(this));
        }.bind(this));
    };

    this._backPlay = function () {
        $("#dashboard_close").removeClass("selected").children("span").html("Close");

        this.hideDropdown(true);
        this.setState(this.NAVIGATION.MAINMENU);
    };

    this.quitBack = function () {
        beamng.sendGameEngine('disconnect();')
    };

    this.dashboardData = [
        {
            id: "close",
            title: "close",
            classname: "back",
            mouseup: this.closeDash.bind(this),
            top: true
        },
        {
            id: "play",
            title: "Play",
            classname: "play",
            mouseup: this.menuPlay.bind(this),
            top: true
        },
        {
            id: "change_level",
            title: "change level",
            classname: "changelevel",
            mouseup: this.changeLevel.bind(this)
        },
        {
            id: "change_environment",
            title: "Environment",
            classname: "environment",
            mouseup: this.changeEnvironment.bind(this)
        },
        {
            id: "change_vehicle",
            title: "change vehicle",
            classname: "changevehicle",
            mouseup: this.changeVehicle.bind(this)
        },
        {
            id: "partsconf",
            title: "vehicle parts",
            classname: "partsmanagement",
            mouseup: this.partsManager.bind(this)
        },
        {
            id: "actionmenu",
            title: "action menu",
            classname: "actionmenu",
            mouseup: this.actionMenu.bind(this)
        },
        {
            id: "options",
            title: "options",
            classname: "options",
            mouseup: this.menuOptions.bind(this)
        },
        {
            id: "quit",
            title: "quit",
            classname: "quit",
            mouseup: this.quitBack.bind(this),
            bottom: true
        }
    ];

    this.init();
};

Freeroam.prototype = new Dashboard();