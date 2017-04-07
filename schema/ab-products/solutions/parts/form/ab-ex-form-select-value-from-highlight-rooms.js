/**********************************************************
  ab-ex-form-select-value-from-highlight-rooms.js
  Event handler functions for the Autodesk Express Viewer
  plugin.
**********************************************************/
DWF_showCloseButton=false;
function OnSelectObject(objNode, objHandled){
	if(objNode && objNode.Name != ''){
	    var objectName = objNode.Name; 
	    // extract the restriction from the object name
	    var restriction = {};
		var pkeys = objectName.split(";");
		for (var i=0; i< pkeys.length; ++i){
			var pkey = pkeys[i].split("=");
			if (pkey.length == 2) {
			    restriction["rm."+pkey[0]] = pkey[1];			    
			}
		}	   
	    // show panel that displays the selected object
	    var roomDetailsForm = parent.Ab.view.View.getControl('', 'formDrawingSelectObjHandler_form');
	    roomDetailsForm.refresh(restriction);
	    roomDetailsForm.show();
	}
}
