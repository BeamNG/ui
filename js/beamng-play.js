function updateSparcLines()
{
	if(debugObjectData) {
		var objDataDump = "<h3>Object data</h3><table border='0'>";
		for(var attr in objectData) {
			objDataDump += "<tr><td colspan='4'>" + attr + "</td></tr>";
			var keys = Object.keys(objectData[attr]);
			keys.sort();
			for (var i=0; i<keys.length; i++) {
				var attr2 = keys[i];
				objDataDump += "<tr><td width='15'>&nbsp;</td><td>" + attr2 + "</td><td><span id='sl_"+attr2+"'></span></td><td>" + JSON.stringify(objectData[attr][attr2]) + "</td></tr>";
				if(typeof objectData[attr][attr2] == 'number') {
					if(sparkPoints[attr2] === undefined)
						sparkPoints[attr2] = [];
					sparkPoints[attr2].push(objectData[attr][attr2]);
					if (sparkPoints[attr2].length > 40)
						sparkPoints[attr2].shift();
				}
			}
		}
		objDataDump += "</table>";

		$('#objdebug').html(objDataDump);

		for(var attr in objectData) {
			for(var attr2 in objectData[attr]) {
				if(typeof objectData[attr][attr2] == 'number') {
					$('#sl_'+attr2).sparkline(sparkPoints[attr2], { width: sparkPoints[attr2].length*2, tooltipSuffix: '', disableHiddenCheck:true });
				}
			}
		}
	}
	setTimeout(updateSparcLines, 100);
}

function filledArc(ctx, x, y, r, w, v, c)
{
	if(v > 1) v = 1;
	else if(v < -1) v = -1;
	ctx.beginPath();
	var rads = v * 2 * Math.PI;
	var reverse = (v < 0);
	ctx.arc(x,y,r-(w/2)  , 1.5 * Math.PI, 1.5 * Math.PI + rads, reverse);
	ctx.lineWidth = w;
	ctx.strokeStyle = c;
	ctx.stroke();
	ctx.closePath();
}

$(document).ready(function() {
	widgetEventHandler(updateSingleValue, 'debug_globalonoff', 'bdebug', 'enabled');
	widgetEventHandler(updateSingleValue, 'skeleton_debug_options', 'bdebug', 'skeleton_mode');
	widgetEventHandler(updateSingleValue, 'nodeinfo_debug_options', 'bdebug', 'node_info_mode');
	widgetEventHandler(updateSingleValue, 'debug_collision_tri', 'bdebug', 'coltrimode');
	widgetEventHandler(updateSingleValue, 'debug_mesh_visibility', 'bdebug', 'mesh_visibility');
	widgetEventHandler(updateSingleValue, 'option_simspeed', 'bullettime', 'wantedSimulationSpeed');

	widgetEventHandler(updateGameEngineValue, 'debug_render_bb', '$Scene::renderBoundingBoxes');
	widgetEventHandler(updateGameEngineValue, 'debug_render_shadows', '$Shadows::disable');
	widgetEventHandler(updateGameEngineValue, 'debug_render_wireframe', '$gfx::wireframe');
	
	widgetEventHandler(callGameEngineFunc, 'debug_render_depthviz', 'toggleDepthViz');
	widgetEventHandler(callGameEngineFunc, 'debug_render_normalviz', 'toggleNormalsViz');
	widgetEventHandler(callGameEngineFunc, 'debug_render_lightcolorviz', 'toggleLightColorViz');
	widgetEventHandler(callGameEngineFunc, 'debug_render_lightspecviz', 'toggleLightSpecularViz');


	// special
	$('#debug_object_data').change(function(e) {
		debugObjectData = $(this).is(':checked');
		//alert(debugObjectData)
		if(!debugObjectData) {
			$('#objdebug').html();
			$('#objdebug').css('visibility', 'hidden');
			streamRemove('electrics');
		} else {
			$('#objdebug').css('visibility', 'visible');
			streamAdd('electrics');
		}
		return true;
	});

	setTimeout(updateSparcLines, 10);
});

// this function registers the controls and forwards changes to lua
function widgetEventHandler()
{
	// default args normally: func, widgetName, varname, ...
	var func = arguments[0];
	var widgetName = arguments[1];
	var funcArgs = Array.prototype.slice.call(arguments, 2);
	var c = $('#'+widgetName);
	var tagName = c.prop("tagName");
	if(tagName == 'INPUT') {
		var ctrlType = c.attr('data-type') || c.attr('type');
		if(ctrlType == 'checkbox') {
			c.change(function(e) {
				var funcArgsNow = funcArgs.slice(0);
				funcArgsNow.push($(this).is(':checked'));
				return func.apply(this, funcArgsNow);
			});
			return true;
		} else if(ctrlType == 'range') {
			c.change(function(e) {
				var funcArgsNow = funcArgs.slice(0);
				funcArgsNow.push($(this).val());
				return func.apply(this, funcArgsNow);
			});
			return true;
		} else if(ctrlType == 'button') {
			c.click(function(e) {
				return func.apply(this, funcArgs);
			});
			return true;
		}
	} else if(tagName == 'SELECT') {
		c.change(function(e) {
			var funcArgsNow = funcArgs.slice(0);
			funcArgsNow.push($(this).val());
			return func.apply(this, funcArgsNow);
		});
		return true;
	} else if(tagName == 'FIELDSET') {
		c = $('input[name='+widgetName+']');
		var ctrlType = c.attr('data-type') || c.attr('type');
		if(ctrlType == 'radio') {
			c.change(function(e) {
				var ctrl = $( 'input[name='+widgetName+']:checked' );
				var v = ctrl.val();
				if(ctrl.attr('value-is-numeric') !== undefined);
					v = +v;
				var funcArgsNow = funcArgs.slice(0);
				funcArgsNow.push(v);
				return func.apply(this, funcArgsNow);
			});
			return true;
		}
	}
	alert("control not bound: " + widgetName);
}