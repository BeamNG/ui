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
            collapsed: true,
            childs: {
                graphics:{
                    name:"Graphics",
                    childs:{
                        display_driver:{name:'Display Drivertype',type:'combo',tsCb:'Settings_Graphic_display_driver'},
                        resolutions:{name:'Resolution',type:'combo', onChange:onTSChangeDirect, tsCb:'Settings_Graphic_resolutions' },
                        fullscreen:{name:'Fullsreen',type:'bool', val:true, onChange:onTSChangeDirect, tsCb:'Settings_Graphic_fullscreen'},
                        //borderless:{name:'Borderless',type:'bool', onChange:onTSChangeDirect, tsCb:'Settings_Graphic_borderless'},
                        sync:{name:'Vertical Sync', type:'bool', val:false, onChange:onTSChangeDirect, tsCb:'Settings_Graphic_Sync'},
                        refresh_rate:{name:'Refresh Rate',type:'combo', onChange:onTSChangeDirect, tsCb:'Settings_refresh_rate'},
                        mesh_quality:{name:'Mesh Quality',type:'combo', onChange:onTSChangeDirect, tsCb:'Settings_Graphic_mesh_quality'},
                        texture_quality:{name:'Texture Quality',type:'combo',description:"This determines the sharpness of the textures.", onChange:onTSChangeDirect, tsCb:'Settings_Graphic_texture_quality'},
                        lighting_quality:{name:'Lighting Quality',type:'combo', onChange:onTSChangeDirect, tsCb:'Settings_Graphic_lighting_quality'},
                        antialias:{name:'Anisotropic Filtering',type:'combo', onChange:onTSChangeDirect, tsCb:'Settings_Graphic_antialias'},
                        shader_quality:{name:'Shader Quality',type:'combo', onChange:onTSChangeDirect, tsCb:'Settings_Graphic_shader_quality'},
                        gamma:{name:'Gamma',type:'slider',min:0,max:1,step:0.01,val:0.5, onChange:onTSChangeDirect, tsCb:'Settings_Graphic_gamma'},
                    }
                },
                audio:{
                    name:"Audio",
                    childs:{
                        audio_provider:{name:'Audio Provider',type:'combo', onChange:onTSChangeDirect, tsCb:'Settings_Audio_provider'},
                        audio_device:{type:'combo', onChange:onTSChangeDirect, tsCb:'Settings_Audio_device'},
                        master_vol:{name:'Master Volume', type:'slider',min:0,max:1,step:0.1,val:0.5, onChange:onTSChangeDirect, tsCb:'Settings_Audio_master_vol'},
                        interface_vol:{name:'Interface Volume', type:'slider',min:0,max:1,step:0.1,val:0.5, onChange:onTSChangeDirect, tsCb:'Settings_Audio_interface_vol'},
                        effects_vol:{name:'Effects Volume', type:'slider',min:0,max:1,step:0.1,val:0.5, onChange:onTSChangeDirect, tsCb:'Settings_Audio_effects_vol'},
                        music_vol:{name:'Music Volume', type:'slider',min:0,max:1,step:0.1,val:0.5, onChange:onTSChangeDirect, tsCb:'Settings_Audio_music_vol'}
                    },
                }
            },
            bottom:{
                auto_detect_quality:{name:'Auto Detect Quality',type:'button',cmdJs:'',cmdTs:'',cmdLua:[], paramLua:[]}
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
                                enabled:{name:'Enabled',type:'bool', val:true, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_SSAO_General_enabled' },
                                quality:{name:'Quality',type:'slider',min: 0, max: 2, step:1, val:1, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_SSAO_General_quality' },
                                overall_strength:{name:'Overall Strength',type:'slider',min: 0, max: 50, step:1, val:20, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_SSAO_General_overall_strength'},
                                blur_softness:{name:'Blur (Softness)',type:'slider',min: 0.001, max: 0.3, step:0.001, val:0.001, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_SSAO_General_blur_softness'},
                                blur_normalMaps:{name:'Blur (Normal Maps)',type:'slider',min: 0, max: 1, step:0.01, val:0, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_SSAO_General_blur_normalMaps'},
                            }
                        },
                        near: {
                            name: "Near",
                            childs: {
                                radius:{name:'Radius',type:'slider',min: 0.001, max: 5, step:0.01, val:0.1, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_SSAO_near_radius' },
                                strength:{name:'Strength',type:'slider',min: 0.001, max: 5, step:0.01, val:0.1, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_SSAO_near_strength' },
                                depth_min:{name:'Depth Min',type:'slider',min: 0, max: 5, step:0.01, val:0.1, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_SSAO_near_depth_min' },
                                depth_max:{name:'Depth Max',type:'slider',min: 0, max: 50, step:0.1, val:1, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_SSAO_near_depth_max' },
                                normal_Maps: {
                                    name: "Normal Maps",
                                    childs: {
                                        tolerance:{name:'Tolerance',type:'slider',min: 0, max: 2, step:0.1, val:0, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_SSAO_near_NM_tolerance' },
                                        power:{name:'Power',type:'slider',min: 0, max: 2, step:0.1, val:1, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_SSAO_near_NM_power' }
                                    }
                                }
                            }
                        },
                        far: {
                            name: "far",
                            childs: {
                                radius:{name:'Radius',type:'slider',min: 0.001, max: 5, step:0.01, val:1, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_SSAO_far_radius' },
                                strength:{name:'Strength',type:'slider',min: 0, max: 20, step:0.01, val:10, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_SSAO_far_strength' },
                                depth_min:{name:'Depth Min',type:'slider',min: 0, max: 5, step:0.01, val:0.2, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_SSAO_far_depth_min' },
                                depth_max:{name:'Depth Max',type:'slider',min: 0, max: 5, step:0.1, val:2, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_SSAO_far_depth_max' },
                                normal_Maps: {
                                    name: "Normal Maps",
                                    childs: {
                                        tolerance:{name:'Tolerance',type:'slider',min: 0, max: 2, step:0.01, val:0, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_SSAO_far_NM_tolerance' },
                                        power:{name:'Power',type:'slider',min: 0, max: 2, step:0.01, val:2, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_SSAO_far_NM_power' }
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
                                enabled:{name:'Enabled',type:'bool', val:true, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_HDR_General_enabled' },
                                tone_mapping_contrast:{name:'Tone Mappping Contrast',type:'slider',min: 0, max: 1, step:0.1, val:0, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_HDR_Brightness_tone_mapping_contrast' },
                                key_value:{name:'Key Value',type:'slider',min: 0, max: 1, step:0.1, val:0.1, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_HDR_Brightness_key_value' },
                                minimum_luminance:{name:'Minimum Luminance',type:'slider',min: 0, max: 1, step:0.01, val:0.001, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_HDR_Brightness_minimum_luminance' },
                                white_cutoff:{name:'White Cutoff',type:'slider',min: 0, max: 1, step:0.1, val:1, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_HDR_Brightness_white_cutoff' },
                                brightness_adapt_rate:{name:'Brightness Adapt Rate',type:'slider',min: 0.1, max: 10, step:0.1, val:2, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_HDR_Brightness_adapt_rate' }
                            }
                        },
                        bloom: {
                            name: "Bloom",
                            childs: {
                                enable_bloom:{name:'Enable Bloom',type:'bool',val:true, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_HDR_Bloom_enable' },
                                bright_pass_treshold:{name:'Key Value',type:'slider',min: 0, max: 5, step:0.01, val:1, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_HDR_Bloom_bright_pass_treshold' },
                                blur_multiplier:{name:'Blur Multiplier',type:'slider',min: 0, max: 5, step:0.01, val:0.5, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_HDR_Bloom_blur_multiplier' },
                                blur_mean_value:{name:'Blur "Mean" Value',type:'slider',min: 0, max: 1, step:0.1, val:0, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_HDR_Bloom_blur_mean_value' },
                                blur_std_dev_value:{name:'Blur "Std Dev" Value',type:'slider',min: 0, max: 3, step:0.01, val:0.8, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_HDR_Bloom_blur_std_dev_value' }
                            }
                        },
                        effects: {
                            name: "Effects",
                            childs: {
                                enable_color_shift:{name:'Enable Color Shift',type:'bool',val:false, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_HDR_Effects_enable_color_shift' },
                                color:{name:'Color',type:'color',val:'#ff3333'},
                                // @TODO some color Picker Input
                            }
                        }
                    }
                },
                lightRays : {
                    name: "Light Rays",
                    childs: {
                        enabled:{name:'Enabled',type:'bool', val:true, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_LightRays_General_enabled' },
                        brightness:{name:'Brightness',type:'slider',min: 0, max: 1, step:0.1, val:1, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_LightRays_brightness' }
                    }
                },
                dof : {
                    name: "DOF",
                    childs: {
                        general: {
                            name: "General",
                            childs: {
                                enabled:{name:'Enabled',type:'bool', val:true, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_DOF_General_enabled' },
                                enable_auto_focus:{name:'Enable Auto Focus',type:'bool',val:false, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_DOF_general_enable_auto_focus' },
                            }
                        },
                        autoFocus: {
                            name: "Auto Focus",
                            childs: {
                                near_blur_max:{name:'Near Blur Max',type:'slider',min: 0, max: 1, step:0.1, val:1, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_DOF_autoFocus_near_blur_max' },
                                far_blur_max:{name:'Far Blur Max',type:'slider',min: 0, max: 1, step:0.1, val:0.2, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_DOF_autoFocus_far_blur_max' },
                                focus_range_min:{name:'Focus Range (Min)',type:'slider',min: 0.01, max: 1000, step:0.1, val:0.5, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_DOF_autoFocus_focus_range_min' },
                                focus_range_max:{name:'Focus Range (Max)',type:'slider',min: 0.01, max: 1000, step:0.1, val:0, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_DOF_autoFocus_focus_range_max' },
                                blur_curve_near:{name:'Blur Curve (Near)',type:'slider',min: 0, max: 50, step:0.1, val:0.9, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_DOF_autoFocus_blur_curve_near' },
                                blur_curve_far:{name:'Blur Curve (Far)',type:'slider',min: 0, max: 50, step:0.1, val:1, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_DOF_autoFocus_blur_curve_far' }
                            }
                        }
                    }
                },
                colorCorrection : {
                    name: "Color Correction",
                    childs: {
                        // @TODO some file picker
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
    {
        if( value == "0" || value == "false")
            node.val = false;
        else
            node.val = true;
    }
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
