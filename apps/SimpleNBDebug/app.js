function SimpleNBDebug(){}

SimpleNBDebug.prototype.initialize = function(){
    this.table = $('<table></table>').appendTo(this.rootElement).addClass('table');
    
    var self = this;
    this.table.click(function(){self.toggleUnits();});
    this.table.click(function(){self.toggleUnits();});
    
    //If no unit was previously selected, default to Metric
    if ((this.persistance["Unit"] != "Imperial") && (this.persistance["Unit"] != "Metric")) this.persistance["Unit"] = "Metric";
};

SimpleNBDebug.prototype.toggleUnits = function(){
    //Toggle between Imperial and Metric, save the option to persistance system
    this.persistance["Unit"] = this.persistance["Unit"] === 'Imperial' ? 'Metric' : 'Imperial';
    this.save();
};

SimpleNBDebug.prototype.update = function(streams){
    
    if (this.persistance["Unit"] == "Metric"){
        str = '<tr> <td style="text-align:center;"> <b>Beams</b> </td> <td style="text-align:center;"> <b>Nodes</b> </td> </tr>';
        str += '<tr> <td style="text-align:center;">' + streams["stats"].beam_count + '</td> <td style="text-align:center;">' + streams["stats"].node_count + '</td> </tr>';
        str += '<tr> <td style="text-align:center;"> Deformed:<br>' + streams["stats"].beams_deformed + "<br>("+((streams["stats"].beams_deformed/streams["stats"].beam_count)*100).toFixed(2) + '%) </td> <td style="text-align:center;"> Total Weight: ' + streams["stats"].total_weight.toFixed(2) + 'kg Chassis Weight: ' + (streams["stats"].total_weight - streams["stats"].wheel_weight).toFixed(2) + 'kg </td> </tr>';
        str += '<tr> <td style="text-align:center;"> Broken:<br>' + streams["stats"].beams_broken + "<br>("+((streams["stats"].beams_broken/streams["stats"].beam_count)*100).toFixed(2) + '%)</td> <td style="text-align:center;">' + (streams["stats"].wheel_weight/streams["stats"].wheel_count).toFixed(2) + 'kg per Wheel';
        str += " (" + streams["stats"].wheel_weight.toFixed(2)+ "kg for "+ streams["stats"].wheel_count +" Wheels) <br>";
        str += '</tr> </tr>';
    } else {
        str = '<tr> <td style="text-align:center;"> <b>Beams</b> </td> <td style="text-align:center;"> <b>Nodes</b> </td> </tr>';
        str += '<tr> <td style="text-align:center;">' + streams["stats"].beam_count + '</td> <td style="text-align:center;">' + streams["stats"].node_count + '</td> </tr>';
        str += '<tr> <td style="text-align:center;"> Deformed:<br>' + streams["stats"].beams_deformed + "<br>("+((streams["stats"].beams_deformed/streams["stats"].beam_count)*100).toFixed(2) + '%) </td> <td style="text-align:center;"> Total Weight: ' + (streams["stats"].total_weight*2.2).toFixed(2) + 'lb Chassis Weight: ' + ((streams["stats"].total_weight - streams["stats"].wheel_weight)*2.2).toFixed(2) + 'lb </td> </tr>';
        str += '<tr> <td style="text-align:center;"> Broken:<br>' + streams["stats"].beams_broken + "<br>("+((streams["stats"].beams_broken/streams["stats"].beam_count)*100).toFixed(2) + '%)</td> <td style="text-align:center;">' + (streams["stats"].wheel_weight/streams["stats"].wheel_count*2.2).toFixed(2) + 'kg per Wheel';
        str += " (" + (streams["stats"].wheel_weight*2.2).toFixed(2)+ "kg for "+ streams["stats"].wheel_count +" Wheels) <br>";
        str += '</tr> </tr>';
    }
    
    this.table.html(str);
};
