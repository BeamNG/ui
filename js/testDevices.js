var maps = ["X-Box Controller"]

var map = {
    "name": "X-Box Controller",
    "axes":{
        "x":{
            "name":"Brake",
            "deadzone": 0.1
            "reversed": false
        }
    },
    "buttons":{
        "0":{
            "name":"horn",
            "toggle":false
        },
        "4":{
            "name":"handbrake",
            "toggle": false
        },
        "6":{
            "name":"handbrake",
            "toggle": true
        }
    }
}

var controls = [
    {
        "name":"Steering",
        "type":"BigAxis",
        "additionalOptions":{
            "Force Feedback Strength":{
                "type": "float",
                "min": 0,
                "max": 100
            },
            "Activate Force Feedback":{
                "type": "boolean"
            }
        },
        "action":{
        	"type": "lua",
        	"command": "steer()"
        }
    },
    {
        "name":"brake",
        "displayedname" : "Brake"
        "type": "Axis"
    },
    {
        "name":"handbrake",
        "displayedname":"Handbrake",
        "type": "Axis"
    }
    {
        "name":"horn",
        "displayedname":"Horn",
        "type": "Button"
    }
]