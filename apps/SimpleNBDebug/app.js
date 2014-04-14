function SimpleNBDebug(){}

SimpleNBDebug.prototype.initialize = function(){
    
    this.text = $('<div style="padding:5px;"></div>').appendTo(this.rootElement);
};

SimpleNBDebug.prototype.update = function(streams){
    
    str = '<table width=100%> <tr> <td style="text-align:center;"> <b>Beams</b> </td> <td style="text-align:center;"> <b>Nodes</b> </td> </tr>';
    
    str += '<tr> <td style="text-align:center;">' + streams["stats"].beam_count + '</td> <td style="text-align:center;">' + streams["stats"].node_count + '</td> </tr>';
    
    str += '<tr> <td style="text-align:center;"> Deformed:<br>' + streams["stats"].beams_deformed + "<br>("+((streams["stats"].beams_deformed/streams["stats"].beam_count)*100).toFixed(2) + '%) </td> <td style="text-align:center;"> Total Weight: ' + streams["stats"].total_weight.toFixed(2) + 'kg Chassis Weight: ' + (streams["stats"].total_weight - streams["stats"].wheel_weight).toFixed(2) + 'kg </td> </tr>';
    
    str += '<tr> <td style="text-align:center;"> Broken:<br>' + streams["stats"].beams_broken + "<br>("+((streams["stats"].beams_broken/streams["stats"].beam_count)*100).toFixed(2) + '%)</td> <td style="text-align:center;">' + (streams["stats"].wheel_weight/streams["stats"].wheel_count).toFixed(2) + 'kg per Wheel';
    
    str += " (" + streams["stats"].wheel_weight.toFixed(2)+ "kg for "+ streams["stats"].wheel_count +" Wheels) <br>";
	str += '</tr> </tr>';
    
    
    str += '</table>';
        
    
    /*
	str +=  streams["stats"].beam_count + " beams <br>";
	str	+= " - " + streams["stats"].beams_deformed + " ("+((streams["stats"].beams_deformed/streams["stats"].beam_count)*100).toFixed(2)+"%) deformed <br>";
	str	+= " - " + streams["stats"].beams_broken + " ("+((streams["stats"].beams_broken/streams["stats"].beam_count)*100).toFixed(2)+"%) broken <br>";
	
	str += streams["stats"].node_count + " nodes <br>";
	str += " - " + streams["stats"].total_weight.toFixed(2)+ " kg total weight <br>";
	str += " - " + (streams["stats"].wheel_weight/streams["stats"].wheel_count).toFixed(2) + " kg per wheel";
	str += " (" + streams["stats"].wheel_weight.toFixed(2)+ " kg all "+ streams["stats"].wheel_count +" wheels) <br>";
	str += " - " + (streams["stats"].total_weight - streams["stats"].wheel_weight).toFixed(2) + " kg chassis weight";
    */
	
    this.text.html(str);
};