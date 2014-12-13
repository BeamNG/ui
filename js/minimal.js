// this value is set by the game upon engine startup, only read it, never change it
cefcontext = -1; // -1 = invalid, >=0 : valid

function cefdev(v)
{
    if(v)
        $('.cefdev').css('visibility', 'visible');
    else
        $('.cefdev').css('visibility', 'hidden');
}

function gotCefContextNumber(v) {
    cefcontext = v;
}

// immediatelly update variable cefcontext
// beware, it takes one frame to update
if(typeof beamng !== 'undefined') {
    beamng.getCEFContextNo();
}
