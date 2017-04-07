
function user_form_onload() {
	onloadHelper();
}

function onloadHelper() {
    window.tabs = getFrameObject(parent, 'tabsFrame');
    if (window.tabs == null) {
        alert("This view can only be used as a part of the Abstract Builder wizard");
    }
    
    if ((window.tabs.ls_id != null) && (window.tabs.ls_id != ""))
    	setPanelTitle("DocumentsDistribution", "Lease Documents Distribution - " + window.tabs.ls_id);
}
