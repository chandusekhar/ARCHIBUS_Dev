
function user_form_onload() {
	onloadHelper();
	hideEllipsis();
}

function onloadHelper() {
    window.tabs = getFrameObject(parent, 'tabsFrame');
    if (window.tabs == null) {
        alert("This view can only be used as a part of the Abstract Builder wizard");
    }
    
    if ((window.tabs.ls_id != null) && (window.tabs.ls_id != ""))
    	setPanelTitle("LeaseCodeAndCritDates", "Assign Lease Code, Descriptions, and Critical Dates - " + "window.tabs.ls_id");
}

function hideEllipsis() {
	var ls_floors = $("ls.floors");
	ls_floors.nextSibling.className = "hideElement";
	
	var ls_id = $("ls.ls_id");
	ls_id.disabled = true;
	
	var ls_parent_id = $("ls.ls_parent_id");
	ls_parent_id.disabled = true;
	ls_parent_id.nextSibling.className = "hideElement";
}

