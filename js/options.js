var data = {};
var pgElement = null;
function initOptions(wrapper_div) {
    if(!pgElement) {
        pgElement = $('<div id="pg1" class="pg"></div>').appendTo($(wrapper_div));
    }
    $(wrapper_div).css('display', 'block');

    // this function updates TS values when they are changed, removing the need of the apply button
    function onTSChangeDirect(info) {
        beamng.sendGameEngine("setSettingsValue( \"" + info.id + "\",  \"" +  info.tsCb + "\", \"" + info.val + "\" );");
        return true;
    }

    function to(key) {
        return i18n.t('options.' + key, {defaultValue: key});
    }

    data = {
        rootElement: pgElement,
        childs: {
            options: {
                name: to("Options"),
                    //close:{name:"close"),type:'button', cmdJs:'$(usageElements[this.id].ctrl.selector).closest(".pg_wrapper_play").css("display"), "none")'}
                // type:'enable',
                // val:true,
                collapsed: false,
                childs: {
                    graphics:{
                        name: to("Graphics"),
                        collapsed: false,
                        // type:'combo', 
                        // options:["test"), "test2"],
                        childs:{
                            display_driver:{name: to("Display Drivertype"),type:'combo',tsCb:'Settings_Graphic_display_driver'},
                            resolutions:{name: to("Resolution"),type:'combo', onChange:onTSChangeDirect, tsCb:'Settings_Graphic_resolutions' },
                            fullscreen:{name: to("Fullsreen"),type:'bool', val:true, onChange:onTSChangeDirect, tsCb:'Settings_Graphic_fullscreen'},
                            //borderless:{name: to("Borderless"),type:'bool', onChange:onTSChangeDirect, tsCb:'Settings_Graphic_borderless'},
                            sync:{name: to("Vertical Sync"),type:'bool', val:false, onChange:onTSChangeDirect, tsCb:'Settings_Graphic_Sync'},
                            refresh_rate:{name: to("Refresh Rate"),type:'combo', onChange:onTSChangeDirect, tsCb:'Settings_refresh_rate'},
                            mesh_quality:{name: to("Mesh Quality"),type:'combo', onChange:onTSChangeDirect, tsCb:'Settings_Graphic_mesh_quality'},
                            texture_quality:{name: to("Texture Quality"),type:'combo',description:'This determines the sharpness of the textures.', onChange:onTSChangeDirect, tsCb:'Settings_Graphic_texture_quality'},
                            lighting_quality:{name: to("Lighting Quality"),type:'combo', onChange:onTSChangeDirect, tsCb:'Settings_Graphic_lighting_quality'},
                            antialias:{name: to("Anisotropic Filtering"),type:'combo', onChange:onTSChangeDirect, tsCb:'Settings_Graphic_antialias'},
                            shader_quality:{name: to("Shader Quality"),type:'combo', onChange:onTSChangeDirect, tsCb:'Settings_Graphic_shader_quality'},
                            gamma:{name: to("Gamma"),type:'slider',min:0,max:1,step:0.01,val:0.5, onChange:onTSChangeDirect, tsCb:'Settings_Graphic_gamma'},
                        },
                        // bottom:{
                        //     test:{name:"test"),type:"combo"),options:["test"), "test2"]}
                        // }
                    },
                    audio:{
                        name: to("Audio"),
                        childs:{
                            audio_provider:{name: to("Audio Provider"),type:'combo', onChange:onTSChangeDirect, tsCb:'Settings_Audio_provider'},
                            audio_device:{name: to("Audio Device"),type:'combo', onChange:onTSChangeDirect, tsCb:'Settings_Audio_device'},
                            master_vol:{name: to("Master Volume"),type:'slider',min:0,max:1,step:0.1,val:0.5, onChange:onTSChangeDirect, tsCb:'Settings_Audio_master_vol'},
                            interface_vol:{name: to("Interface Volume"),type:'slider',min:0,max:1,step:0.1,val:0.5, onChange:onTSChangeDirect, tsCb:'Settings_Audio_interface_vol'},
                            effects_vol:{name: to("Effects Volume"),type:'slider',min:0,max:1,step:0.1,val:0.5, onChange:onTSChangeDirect, tsCb:'Settings_Audio_effects_vol'},
                            music_vol:{name: to("Music Volume"),type:'slider',min:0,max:1,step:0.1,val:0.5, onChange:onTSChangeDirect, tsCb:'Settings_Audio_music_vol'}
                        },
                    }
                },
                // bottom:{
                //     auto_detect_quality:{name: to("Auto Detect Quality"),type:'button',cmdJs:'',cmdTs:'',cmdLua:[], paramLua:[]}
                // }
            },
            postFxManager: {
                name: to("Post FX Manager"),
                // type:'combo',
                // options:["test"), "test2"],
                // val: "test"),
                collapsed: false,
                childs: {
                    ssao : {
                        name: to("SSAO"),
                        collapsed: false,
                        childs: {
                            general: {
                                name: to("General"),
                                collapsed: false,
                                childs: {
                                    enabled:{name: to("Enabled"),type:'bool', val:true, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_SSAO_General_enabled' },
                                    quality:{name: to("Quality"),type:'slider',min: 0, max: 2, step:1, val:1, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_SSAO_General_quality' },
                                    overall_strength:{name: to("Overall Strength"),type:'slider',min: 0, max: 50, step:1, val:20, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_SSAO_General_overall_strength'},
                                    blur_softness:{name: to("Blur (Softness)"),type:'slider',min: 0.001, max: 0.3, step:0.001, val:0.001, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_SSAO_General_blur_softness'},
                                    blur_normalMaps:{name: to("Blur (Normal Maps)"),type:'slider',min: 0, max: 1, step:0.01, val:0, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_SSAO_General_blur_normalMaps'},
                                }
                            },
                            near: {
                                name: to("Near"),
                                childs: {
                                    radius:{name: to("Radius"),type:'slider',min: 0.001, max: 5, step:0.01, val:0.1, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_SSAO_near_radius' },
                                    strength:{name: to("Strength"),type:'slider',min: 0.001, max: 5, step:0.01, val:0.1, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_SSAO_near_strength' },
                                    depth_min:{name: to("Depth Min"),type:'slider',min: 0, max: 5, step:0.01, val:0.1, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_SSAO_near_depth_min' },
                                    depth_max:{name: to("Depth Max"),type:'slider',min: 0, max: 50, step:0.1, val:1, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_SSAO_near_depth_max' },
                                    normal_Maps: {
                                        name: to("Normal Maps"),
                                        childs: {
                                            tolerance:{name: to("Tolerance"),type:'slider',min: 0, max: 2, step:0.1, val:0, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_SSAO_near_NM_tolerance' },
                                            power:{name: to("Power"),type:'slider',min: 0, max: 2, step:0.1, val:1, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_SSAO_near_NM_power' }
                                        }
                                    }
                                }
                            },
                            far: {
                                name: to("Far"),
                                childs: {
                                    radius:{name: to("Radius"),type:'slider',min: 0.001, max: 5, step:0.01, val:1, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_SSAO_far_radius' },
                                    strength:{name: to("Strength"),type:'slider',min: 0, max: 20, step:0.01, val:10, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_SSAO_far_strength' },
                                    depth_min:{name: to("Depth Min"),type:'slider',min: 0, max: 5, step:0.01, val:0.2, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_SSAO_far_depth_min' },
                                    depth_max:{name: to("Depth Max"),type:'slider',min: 0, max: 5, step:0.1, val:2, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_SSAO_far_depth_max' },
                                    normal_Maps: {
                                        name: to("Normal Maps"),
                                        childs: {
                                            tolerance:{name: to("Tolerance"),type:'slider',min: 0, max: 2, step:0.01, val:0, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_SSAO_far_NM_tolerance' },
                                            power:{name: to("Power"),type:'slider',min: 0, max: 2, step:0.01, val:2, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_SSAO_far_NM_power' }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    hdr : {
                        name: to("HDR"),
                        // collapsed: false,
                        childs: {
                            brightness: {
                                name: to("Brightness"),
                                childs: {
                                    enabled:{name: to("Enabled"),type:'bool', val:true, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_HDR_General_enabled' },
                                    tone_mapping_contrast:{name: to("Tone Mappping Contrast"),type:'slider',min: 0, max: 1, step:0.1, val:0, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_HDR_Brightness_tone_mapping_contrast' },
                                    key_value:{name: to("Key Value"),type:'slider',min: 0, max: 1, step:0.1, val:0.1, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_HDR_Brightness_key_value' },
                                    minimum_luminance:{name: to("Minimum Luminance"),type:'slider',min: 0, max: 1, step:0.01, val:0.001, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_HDR_Brightness_minimum_luminance' },
                                    white_cutoff:{name: to("White Cutoff"),type:'slider',min: 0, max: 1, step:0.1, val:1, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_HDR_Brightness_white_cutoff' },
                                    brightness_adapt_rate:{name: to("Brightness Adapt Rate"),type:'slider',min: 0.1, max: 10, step:0.1, val:2, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_HDR_Brightness_adapt_rate' }
                                }
                            },
                            bloom: {
                                name: to("Bloom"),
                                childs: {
                                    enable_bloom:{name: to("Enable Bloom"),type:'bool',val:true, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_HDR_Bloom_enable' },
                                    bright_pass_treshold:{name: to("Key Value"),type:'slider',min: 0, max: 5, step:0.01, val:1, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_HDR_Bloom_bright_pass_treshold' },
                                    blur_multiplier:{name: to("Blur Multiplier"),type:'slider',min: 0, max: 5, step:0.01, val:0.5, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_HDR_Bloom_blur_multiplier' },
                                    blur_mean_value:{name: to("Blur \"Mean\" Value"),type:'slider',min: 0, max: 1, step:0.1, val:0, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_HDR_Bloom_blur_mean_value' },
                                    blur_std_dev_value:{name: to("Blur \"Std Dev\" Value"),type:'slider',min: 0, max: 3, step:0.01, val:0.8, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_HDR_Bloom_blur_std_dev_value' }
                                }
                            },
                            effects: {
                                name: to("Effects"),
                                // collapsed: false,
                                childs: {
                                    enable_color_shift:{name: to("Enable Color Shift"),type:'bool',val:false, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_HDR_Effects_enable_color_shift' },
                                    color:{name: to("Color"),type:'color',val:'255 0 0', onChange:onTSChangeDirect, tsCb:"Settings_PostFX_HDR_Effects_color_shift"},
                                    //file:{name: to("File"),type:'file'}
                                    // @TODO some color Picker Input
                                }
                            }
                        }
                    },
                    lightRays : {
                        name: to("Light Rays"),
                        childs: {
                            enabled:{name: to("Enabled"),type:'bool', val:true, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_LightRays_General_enabled' },
                            brightness:{name: to("Brightness"),type:'slider',min: 0, max: 1, step:0.1, val:1, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_LightRays_brightness' }
                        }
                    },
                    dof : {
                        name: to("DOF"),
                        childs: {
                            general: {
                                name: to("General"),
                                childs: {
                                    enabled:{name: to("Enabled"),type:'bool', val:true, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_DOF_General_enabled' },
                                    enable_auto_focus:{name: to("Enable Auto Focus"),type:'bool',val:false, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_DOF_general_enable_auto_focus' },
                                }
                            },
                            autoFocus: {
                                name: to("Auto Focus"),
                                childs: {
                                    near_blur_max:{name: to("Near Blur Max"),type:'slider',min: 0, max: 1, step:0.1, val:1, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_DOF_autoFocus_near_blur_max' },
                                    far_blur_max:{name: to("Far Blur Max"),type:'slider',min: 0, max: 1, step:0.1, val:0.2, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_DOF_autoFocus_far_blur_max' },
                                    focus_range_min:{name: to("Focus Range (Min)"),type:'slider',min: 0.01, max: 1000, step:0.1, val:0.5, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_DOF_autoFocus_focus_range_min' },
                                    focus_range_max:{name: to("Focus Range (Max)"),type:'slider',min: 0.01, max: 1000, step:0.1, val:0, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_DOF_autoFocus_focus_range_max' },
                                    blur_curve_near:{name: to("Blur Curve (Near)"),type:'slider',min: 0, max: 50, step:0.1, val:0.9, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_DOF_autoFocus_blur_curve_near' },
                                    blur_curve_far:{name: to("Blur Curve (Far)"),type:'slider',min: 0, max: 50, step:0.1, val:1, onChange:onTSChangeDirect, tsCb:'Settings_PostFX_DOF_autoFocus_blur_curve_far' }
                                }
                            }
                        }
                    },
                    colorCorrection : {
                        name: to("Color Correction"),
                        childs: {
                            // @TODO some file picker
                        }
                    }
                },
                // bottom: {
                //     load_preset:{name: to("Load Preset..."),type:'button',cmdJs:'',cmdTs:'',cmdLua:[], paramLua:[]},
                //     save_preset:{name: to("Save Preset..."),type:'button',cmdJs:'',cmdTs:'',cmdLua:[], paramLua:[]},
                //     revert:{name: to("Revert"),type:'button',clearChanges: true,cmdJs:'',cmdTs:'',cmdLua:[], paramLua:[]},
                //     save:{name: to("Save"),type:'button',cmdJs:'alert("test")',cmdTs:'cmdTs',cmdLua:['cmdLua'], paramLua:['param']}
                // }
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
