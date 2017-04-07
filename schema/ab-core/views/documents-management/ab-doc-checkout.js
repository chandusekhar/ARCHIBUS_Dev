/********************************************
 * show-check-out.js
 * Yong Shao
 * 2005-02-7
 *
 * updated for Yalta 5
 * S. Meyer
 * 15-10-2007
 *
 ********************************************/

 var controller = View.createController('checkoutDocController', {

	afterInitialDataFetch: function() {
		setManagerVarsFromOpener();
		this.docs_grid.refresh(View.restriction);
		
		this.checkoutPanel.restriction = View.restriction;

		// set the form from the max version record
		initializeForm(this.docs_grid);

		// set radio button labels' translated value
		var labelElem = $("lockedLabel");
		var translatedLabel = getMessage("message_locked_label");
		labelElem.innerHTML = translatedLabel;
		labelElem = $("unlockedLabel");
		translatedLabel = getMessage("message_unlocked_label");
		labelElem.innerHTML = translatedLabel;
	}

});



/**
 * initialize form by fetching record with max version from the report grid
 * use record to set form fields
 */
function initializeForm(grid) {
	// get the max version record as an object
	var maxVersionRecord = getMaxDocumentVersion(grid);

	// set display fields with max version document info
	docmanager_autoNamedFile = maxVersionRecord['afm_docvers.doc_file'];
	if (docmanager_autoNamedFile) {
		document.getElementById('docFileName').value = docmanager_autoNamedFile;
		document.getElementById('version').value = maxVersionRecord['afm_docvers.version'];
		document.getElementById('doc_size').value = maxVersionRecord['afm_docvers.doc_size'];

		docmanager_lock_status = maxVersionRecord['afm_docs.locked'];
		// HOW TO DO THIS TRANSLATABLE?
		if (docmanager_lock_status != "No")	{
			docmanager_lock_status = '1';
		}
		else {
			docmanager_lock_status = '0';
		}
	}

	if (docmanager_lock_status == "1") {
		document.getElementById('locked').checked = 1;
		document.getElementById('unlocked').checked = 0;
	}
	else {
		document.getElementById('locked').checked = 0;
		document.getElementById('unlocked').checked = 1;
	}
	window.top.doc_grid_shown = true;
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
 *
function onSelectV() {
	var gridShown = window.top.doc_grid_shown;
	if (gridShown == undefined || gridShown == null || gridShown == true) {
		//Hide the panel of type grid
		$('docs_grid').style.display = 'none';
		var selectValButn = $('selectVersionButton');
		selectValButn.disabled = false;
		selectValButn.style.zIndex = 2;
		window.top.doc_grid_shown = false;
	}
	else {
		//Show the panel of type grid
		$('docs_grid').style.display = 'block';
		var selectValButn = $('selectVersionButton');
		selectValButn.disabled = true;
		selectValButn.style.zIndex = -1;
		window.top.doc_grid_shown = true;
	}
}
*/

/**
 * Handle row selection to update the form
 * 'this' is the row data object
 */
function selectDocument() {
	// set text field values
	document.getElementById("docFileName").value = this['afm_docvers.doc_file'] ;
	document.getElementById("version").value = this['afm_docvers.version'] ;
	document.getElementById("doc_size").value = this['afm_docvers.doc_size'];

	docmanager_autoNamedFile = this['afm_docvers.doc_file'] ;

	// set locked radio buttons
	if (this['afm_docs.locked']  == 'Yes') {
		document.getElementById("locked").checked = 1;
		document.getElementById("unlocked").checked = 0;
		docmanager_lock_status = '1';
	}
	else {
		document.getElementById("locked").checked = 0;
		document.getElementById("unlocked").checked = 1;
		docmanager_lock_status = '0';
	}
	// hide the grid
	//onSelectV();
	var checkoutDocController = View.controllers.get('checkoutDocController');
	checkoutDocController.checkoutPanel.actions.get('okButton').enable(true);
	checkoutDocController.checkoutPanel.actions.get('cancelButton').enable(true);
}



/**
 * return the document version record with the max version number ('afm_docvers.version')
 * iterate through rows and when 
 *
 */
function getMaxDocumentVersion(grid) {
	var maxVersion = '-1';
	var record = new Object();
//	var dataRows = YAHOO.util.Dom.getElementsByClassName('dataRow', "tr", grid.tableBodyElement);
	var dataRows = Ext.query('.dataRow',  grid.tableBodyElement);

	for (var i=(dataRows.length - 1), row; row = dataRows[i]; i--) {
		// row children are <td /> elements
		var children = row.childNodes;
		// test column name & value to see if row should be highlighted (here if the floor == '17')
		for (var j = 0; j < grid.columns.length ; j++) {
			var s = children[j].innerHTML;
			if (grid.columns[j].id == 'afm_docvers.version' && parseInt(String(s)) > maxVersion) {
				maxVersion = parseInt(String(s));
				for (var jj = 1; jj < grid.columns.length ; jj++) {
					record[grid.columns[jj].id] = children[jj].innerHTML
				}
			}
		}
	}
	return record;
}
