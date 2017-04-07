/********************************************
show-check-out.js
Yong Shao
2005-02-7

Steven Meyer
2007-01-19
*********************************************/
 

function user_form_onload() {
	setManagerVarsFromOpener();

	// include a report grid that gets collapsed/expanded for use by select value button
	var vGrid = AFM.view.View.getControl(window, 'docs_grid');
	// set the form from the max version record
	initializeForm(vGrid);
	// hide the select value grid
	onSelectV();
}


/**
 * initialize form by fetching record with max version from the report grid
 * use record to set form fields
 */
function initializeForm(grid) {
	//XXX: restricted to current records
	var restriction = new AFM.view.Restriction();
	restriction.addClause("afm_docs.pkey_value",docmanager_pkey_value,'=');
	grid.refresh(restriction);
	
	// get the max version record as an object
	var maxVersionRecord = getMaxDocumentVersion(grid);

	// set display fields with max version document info
	docmanager_autoNamedFile = maxVersionRecord['afm_docvers.doc_file'];
	$("doc_file").value = docmanager_autoNamedFile;
	$("version").value = maxVersionRecord['afm_docvers.version'];
	$("doc_size").value = maxVersionRecord['afm_docvers.doc_size'];

	//XXX: ste up locked buttons
	var lockedObj = $("locked");
	var unlockedObj = $("unlocked");
	if (String(maxVersionRecord['afm_docs.locked.raw']) == "1") {
		lockedObj.checked = 1;
		unlockedObj.checked = 0;
	}else{
		lockedObj.checked = 0;
		unlockedObj.checked = 1;
	}
}



/**
 * get record-specific data to be inserted into the action sent to server
 *
 */
function gettingRecordsData() {
	return gettingRecordsDataForCheckin();
}

/**
 * display select value dialog for changing the doc version
 *
 */
function onSelectV() {
	var gridShown = window.top.doc_grid_shown;
	if (gridShown == undefined || gridShown == null || gridShown == true) {
		//Hide the panel of type grid
		$('docs_grid').style.display = 'none';
		window.top.doc_grid_shown = false;
	} else {
		//Show the panel of type grid
		$('docs_grid').style.display = 'block';
		window.top.doc_grid_shown = true;
	}
}

/**
 * Handle row selection to update the form
 * 'this' is the row data object
 */
function selectDocument() {
	// set text field values
	$("doc_file").value = this['afm_docvers.doc_file'] ;
	$("version").value = this['afm_docvers.version'] ;
	$("doc_size").value = this['afm_docvers.doc_size'];

	docmanager_autoNamedFile = this['afm_docvers.doc_file'] ;
	
	//XXX: set locked radio buttons
	var lockedObj = $("locked");
	var unlockedObj = $("unlocked");
	if (String(this['afm_docs.locked.raw'])  == '1') {
		lockedObj.checked = 1;
		unlockedObj.checked = 0;
	
	}else{
		lockedObj.checked = 0;
		unlockedObj.checked = 1;
	}
	
	//XXX: enable or disable locked buttons
	var vGrid = AFM.view.View.getControl(window, 'docs_grid');
	var maxVersionRecord = getMaxDocumentVersion(vGrid);
	if(String(maxVersionRecord['afm_docvers.version.raw']) != String(this['afm_docvers.version.raw'] )){
		//disable lock or unlock since they cannot be changed
		lockedObj.disabled = 1;
		unlockedObj.disabled = 1;
	}else{
		lockedObj.disabled = 0;
		unlockedObj.disabled = 0;
	}	
	
	// hide the grid
	onSelectV();
}


/**
 * return the document version record with the max version number ('afm_docvers.version')
 * iterate through rows and when 
 *
 */
function getMaxDocumentVersion(grid) {
	var maxVersion = -1;
	var record = new Object();
	//XXX: navigating grid.data.records to find the record with max version
	for (var j = 0; j < grid.data.records.length ; j++) {
		var version = grid.data.records[j]['afm_docvers.version.raw'];
		version = parseInt(String(version));
		if (version > maxVersion) {
			maxVersion = version;			
			record = grid.data.records[j];			
		}
	}
	
	return record;
}
function onOK(strSerialized) {
	var objHiddenForm = document.forms["afmHiddenForm"];
	/*
	if (typeof(strSerialized) == 'undefined' || strSerialized == '') {
		alert('Serialized action is null');
	}
	*/	
	setSerializedInsertingDataVariables(strSerialized);
	//get record-specific data, gettingRecordsData() is defined in corresponding JS file
	var strData = gettingRecordsData();
	//which XSL is calling sendingDataFromHiddenForm
	var strXMLValue = "";
	if (strData != "") {
		strXMLValue = strSerializedInsertingDataFirstPart + strData +  strSerializedInsertingDataRestPart;
	}else {
		strXMLValue = strSerialized;
	}
	//alert(strXMLValue);
	
	objHiddenForm.elements["xml"].value = strXMLValue;
	objHiddenForm.target = "";
	objHiddenForm.action = "login.axvw";
	
	//sending the hidden form to server
	objHiddenForm.submit();			
}
