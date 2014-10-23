var data = {};
var pgElement = null;
function initOptions(wrapper_div) {
    if(!pgElement) {
        pgElement = $('<div id="pg1" class="pg"></div>').appendTo($(wrapper_div));
    }
    $(wrapper_div).css('display', 'block');
    data.rootElement = pgElement;

    // this function updates TS values when they are changed, removing the need of the apply button
    function onTSChangeDirect(info) {
        beamng.sendGameEngine("setSettingsValue( \"" + info.id + "\",  \"" +  info.tsCb + "\", \"" + info.val + "\" ); ");
        return true;
    }

    data.childs = {
        options: {
            name: "Options",
            childs: {
                graphics:{
                    name:"Graphics",
                    top: {
                        enable:{name:'Enable', type:'enable',val:'enabled'},
                        disable:{name:'Enable', type:'enable',val:'enabled'}
                    },
                    childs:{
                        display_driver:{name:'Display Drivertype',type:'combo',tsCb:'Settings_Graphic_display_driver'},
                        resolutions:{name:'Resolution',type:'combo', tsCb:'Settings_Graphic_resolutions' },
                        fullscreen:{name:'Fullsreen',type:'bool', tsCb:'Settings_Graphic_fullscreen'},
                        //borderless:{name:'Borderless',type:'bool', tsCb:'Settings_Graphic_borderless'},
                        sync:{name:'Vertical Sync', type:'bool', tsCb:'Settings_Graphic_Sync'},
                        refresh_rate:{name:'Refresh Rate',type:'combo', tsCb:'Settings_refresh_rate'},
                        mesh_quality:{name:'Mesh Quality',type:'combo', tsCb:'Settings_Graphic_mesh_quality'},
                        texture_quality:{name:'Texture Quality',type:'combo',description:"This determines the sharpness of the textures.", tsCb:'Settings_Graphic_texture_quality'},
                        lighting_quality:{name:'Lighting Quality',type:'combo', tsCb:'Settings_Graphic_lighting_quality'},
                        antialias:{name:'Anisotropic Filtering',type:'combo', tsCb:'Settings_Graphic_antialias'},
                        shader_quality:{name:'Shader Quality',type:'combo', tsCb:'Settings_Graphic_shader_quality'},
                        gamma:{name:'Gamma',type:'slider',min:0,max:1,step:0.01,val:0.5, onChange:onTSChangeDirect, tsCb:'Settings_Graphic_gamma'},
                    }
                },
                audio:{
                    name:"Audio",
                    childs:{
                        audio_provider:{name:'Audio Provider',type:'combo',options:['Soundcard 1','Soundcard 2'],val:'1'},
                        audio_device:{type:'combo',options:['speakers','speakers'],val:'speakers'},
                        master_vol:{name:'Master Volume', type:'slider',min:0,max:1,step:0.1,val:0.5},
                        interface_vol:{name:'Interface Volume', type:'slider',min:0,max:1,step:0.1,val:0.5},
                        effects_vol:{name:'Effects Volume', type:'slider',min:0,max:1,step:0.1,val:0.5},
                        music_vol:{name:'Music Volume', type:'slider',min:0,max:1,step:0.1,val:0.5}
                    },
                }
            },
            bottom:{
                auto_detect_quality:{name:'Auto Detect Quality',type:'button',cmdJs:'',cmdTs:'',cmdLua:[], paramLua:[]},
                apply:{name:'Apply',type:'button', clearChanges: true, cmdJs:'setOptions()',cmdTs:'',cmdLua:[], paramLua:[]},
                done:{name:'Done',type:'button', clearChanges: true, cmdJs:'alert("test")', cmdTs:'setOptions();',cmdLua:['cmdLua'], paramLua:['param']}
            }
        },
        postFxManager: {
            name: "Post FX Manager",
            childs: {
                ssao : {
                    name: "SSAO",
                    childs: {
                        general: {
                            name: "General",
                            childs: {
                                quality:{name:'Quality',type:'combo',options:['Low'], val:'1'},
                                overall_strength:{name:'Overall Strength',type:'slider',min: 0, max: 1, step:0.1, val:0.5},
                                blur_softness:{name:'Blur (Softness)',type:'slider',min: 0, max: 1, step:0.1, val:1},
                                blur_normalMaps:{name:'Blur (Normal Maps)',type:'slider',min: 0, max: 1, step:0.1, val:0},
                            }
                        },
                        near: {
                            name: "Near",
                            childs: {
                                radius:{name:'Radius',type:'slider',min: 0, max: 1, step:0.1, val:0},
                                strength:{name:'Strength',type:'slider',min: 0, max: 1, step:0.1, val:0.1},
                                depth_min:{name:'Depth Min',type:'slider',min: 0, max: 1, step:0.1, val:0.2},
                                depth_max:{name:'Depth Max',type:'slider',min: 0, max: 1, step:0.1, val:0.8},
                                normal_Maps: {
                                    name: "Normal Maps",
                                    childs: {
                                        tolerance:{name:'Tolerance',type:'slider',min: 0, max: 1, step:0.1, val:1},
                                        power:{name:'Power',type:'slider',min: 0, max: 1, step:0.1, val:1}
                                    }
                                }
                            }
                        },
                        far: {
                            name: "far",
                            childs: {
                                radius:{name:'Radius',type:'slider',min: 0, max: 1, step:0.1, val:0},
                                strength:{name:'Strength',type:'slider',min: 0, max: 1, step:0.1, val:0.1},
                                depth_min:{name:'Depth Min',type:'slider',min: 0, max: 1, step:0.1, val:0.2},
                                depth_max:{name:'Depth Max',type:'slider',min: 0, max: 1, step:0.1, val:0.8},
                                normal_Maps: {
                                    name: "Normal Maps",
                                    childs: {
                                        tolerance:{name:'Tolerance',type:'slider',min: 0, max: 1, step:0.1, val:1},
                                        power:{name:'Power',type:'slider',min: 0, max: 1, step:0.1, val:1}
                                    }
                                }
                            }
                        }
                    }
                },
                hdr : {
                    name: "HDR",
                    childs: {
                        brightness: {
                            name: "Brightness",
                            childs: {
                                tone_mapping_contrast:{name:'Tone Mappping Contrast',type:'slider',min: 0, max: 1, step:0.1, val:0},
                                key_value:{name:'Key Value',type:'slider',min: 0, max: 1, step:0.1, val:0.1},
                                minimum_luminance:{name:'Minimum Luminance',type:'slider',min: 0, max: 1, step:0.1, val:0.2},
                                white_cutoff:{name:'White Cutoff',type:'slider',min: 0, max: 1, step:0.1, val:0.8},
                                brightness_adapt_rate:{name:'Brightness Adapt Rate',type:'slider',min: 0, max: 1, step:0.1, val:0.8}
                            }
                        },
                        bloom: {
                            name: "Bloom",
                            childs: {
                                enable_bloom:{name:'Enable Bloom',type:'bool',val:true},
                                bright_pass_treshold:{name:'Key Value',type:'slider',min: 0, max: 1, step:0.1, val:0.1},
                                blur_multiplier:{name:'Blur Multiplier',type:'slider',min: 0, max: 1, step:0.1, val:0.2},
                                blur_mean_value:{name:'Blur "Mean" Value',type:'slider',min: 0, max: 1, step:0.1, val:0.8},
                                blur_std_dev_value:{name:'Blur "Std Dev" Value',type:'slider',min: 0, max: 1, step:0.1, val:0.8}
                            }
                        },
                        effects: {
                            name: "Effects",
                            childs: {
                                enable_color_shift:{name:'Enable Color Shift',type:'bool',val:true},
                                //some color Picker Input
                            }
                        }
                    }
                },
                lightRays : {
                    name: "Light Rays",
                    childs: {
                        brightness:{name:'Brightness',type:'slider',min: 0, max: 1, step:0.1, val:1}
                    }
                },
                dof : {
                    name: "DOF",
                    childs: {
                        general: {
                            name: "General",
                            childs: {
                                enable_auto_focus:{name:'Enable Auto Focus',type:'bool',val:false},
                            }
                        },
                        autoFocus: {
                            name: "Auto Focus",
                            childs: {
                                near_blur_max:{name:'Near Blur Max',type:'slider',min: 0, max: 1, step:0.1, val:1},
                                far_blur_max:{name:'Far Blur Max',type:'slider',min: 0, max: 1, step:0.1, val:0.2},
                                focus_range_min:{name:'Focus Range (Min)',type:'slider',min: 0, max: 1, step:0.1, val:0.5},
                                focus_range_max:{name:'Focus Range (Max)',type:'slider',min: 0, max: 1, step:0.1, val:0},
                                blur_curve_near:{name:'Blur Curve (Near)',type:'slider',min: 0, max: 1, step:0.1, val:0.9},
                                blur_curve_far:{name:'Blur Curve (Far)',type:'slider',min: 0, max: 1, step:0.1, val:1}
                            }
                        }
                    }
                },
                colorCorrection : {
                    name: "Color Correction",
                    childs: {
                        //some file picker
                    }
                }
            },
            bottom: {
                load_preset:{name:'Load Preset...',type:'button',cmdJs:'',cmdTs:'',cmdLua:[], paramLua:[]},
                save_preset:{name:'Save Preset...',type:'button',cmdJs:'',cmdTs:'',cmdLua:[], paramLua:[]},
                revert:{name:'Revert',type:'button',cmdJs:'revertChanges()',cmdTs:'',cmdLua:[], paramLua:[]},
                save:{name:'Save',type:'button',cmdJs:'alert("test")',cmdTs:'cmdTs',cmdLua:['cmdLua'], paramLua:['param']}
            }
        }
    };
    
    updateOptionsData();
}

function updateOptionsData()
{
    updateOptionNodeValue( "data", data );
    
    // delay this, why?
    //beamng.sendGameEngine( 'beamNGExecuteJS( "receiveOptions(data);" , 1);' );
    setTimeout("initPG()", 100);
    //initPG();
}

function updateOptionNodeValue( path, node )
{    
    if( typeof node.tsCb !== 'undefined' ) {        
         var cmd = "getSettingsValue( \"" + path + "\",  \"" +  node.tsCb + "\" ); ";
         //console.log( cmd );
         beamng.sendGameEngine( cmd );
    }
    
    for( childKey in node.childs ) {
        updateOptionNodeValue( path + "." + childKey, node.childs[childKey] );
    }
}

function setOptions() {
    var changedArray = pg.getChangedValues();
    $.each(changedArray, function (key, value) {
        if(typeof value.tsCb !== 'undefined') {
            var cmd = "setSettingsValue( \"" + value.id + "\",  \"" +  value.tsCb + "\", \"" + value.val + "\" ); ";
            //console.log( cmd );
            beamng.sendGameEngine( cmd );
        }
    });
    
    beamng.sendGameEngine( "applyOptions();" );
}

function onUpdateOptionValue( path, value, options ) {
    //console.log( " onUpdateOptionValue " + value + " - " + options );

    var node = eval( path.split(".").join(".childs.") );
    
    
    if( typeof node.val == typeof 1 )
        node.val = Number(value);
    else if( typeof node.val == typeof true )
        node.val = Boolean(value);
    else
        node.val = value;
        
    if( options !== "" )
        eval( "node.options =" + options );
}

function initPG() {
    //console.log(data);
    //For debugging normaly with var
    pg = new BeamNGPropertyGrid(data);
    pg.init();
}
