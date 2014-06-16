var VehicleChooser = (function() {
	'use strict';

	var mainDiv;
	
	var vehicleChoose;
	var configurationChoose;

	var changeButton;

	var vehicles;

	function init(){
		callGameEngineFuncCallback("getVehicleList()", function(res){
			var cChooseBox, vChooseBox;
			vehicles = res;

			vChooseBox = $('<div><label>Choose Vehicle</label></div>').appendTo(mainDiv);
			vehicleChoose = $('<select style="width: 100%"></select>').appendTo(vChooseBox);

			vehicleChoose.change(function(event) {
				updateConfigurations(vehicleChoose.children('option:selected').attr('value'));
			});


			$.each(vehicles, function(index, val) {
				$('<option value="'+index+'">'+val[1]+'</option>').appendTo(vehicleChoose);
			});

			cChooseBox = $('<div><label>Choose Configuration</label></div>').appendTo(mainDiv);
			configurationChoose = $('<select style="width: 100%"></select>').appendTo(cChooseBox);

			updateConfigurations(0);

			changeButton = $('<a style="ui-widget">Change</a>').appendTo(mainDiv).button().click(function(event) {
				changeVehicle();
			});
		});


		mainDiv = $("<div id='vehiclechooser' style='background: #fff; overflow: hidden'></div>").appendTo($("body"));
		mainDiv.dialog({
			title: "Vehicle Selector",
			width: 350,
			height: 'auto',
			beforeClose : function(event, ui){
				close();
				return false;
			},
			resizable: false,
			closeOnEscape: true
		});
		close();
	}

	function updateConfigurations(vehicle){
		configurationChoose.empty();
		$.each(vehicles[vehicle][2], function(index, val) {
			$('<option value="'+index+'">'+val[1]+'</option>').appendTo(configurationChoose);
		});
	}

	function changeVehicle(){
		var vehicleID = vehicleChoose.children('option:selected').attr('value');
		var vehicle = vehicles[vehicleID][0];
		var configurationID = configurationChoose.children('option:selected').attr('value');
		var configuration = vehicles[vehicleID][2][configurationID][2];
		console.log(vehicle);
		console.log(configuration);
		beamng.sendGameEngine('chooseVehicle( "'+vehicle+'", "'+configuration+'", "", 1);');
		close();
	}

	function open(){
		mainDiv.parent().show();
		mainDiv.dialog( "moveToTop" );
	}

	function close(){
		mainDiv.parent().hide();
	}

	// run init
	$(document).ready(function() {
		init();
	});
	// public interface
	var VehicleChooser = {
		open: open,
		close:close
	};
	return VehicleChooser;
}());