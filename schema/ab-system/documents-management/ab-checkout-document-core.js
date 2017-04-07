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
 
/**
 * KB 3029786: do not use user_form_onload() - wait until the form panel fetches the data.
 * IE does not like multiple WFRs executing at the same time.
 */
View.createController('lockDocument', {
	afterInitialDataFetch: function() {
		init();
    }
});


function init() {
	// loop until version grid is loaded
//	if (valueExists(this.AFM) && !this.Ab.view.View.isReady()) {
//		this.user_form_onload.defer(100, this);
//        return;
//	}

	setManagerVarsFromOpener();
	// now load docs_grid with restriction
    var restriction = "afm_docs.table_name = '" + docmanager_tableName + "' and afm_docs.field_name = '" + docmanager_fieldName + "' and afm_docs.pkey_value = '" + docmanager_pkey_value + "'";
    var versionGrid = Ab.view.View.getControl('', 'docs_grid');   
    // apply the restriction and refresh the grid
    versionGrid.refresh(restriction);

	// include a report grid that gets collapsed/expanded for use by select value button
	var vGrid = Ab.view.View.getControl(window, 'docs_grid');
	// set the form from the max version record
	initializeForm(versionGrid);

	// set radio button labels' translated value
	var labelElem = $("lockedLabel");
	var translatedLabel = getMessage("message_locked_label");
	labelElem.innerHTML = translatedLabel;
	labelElem = $("unlockedLabel");
	translatedLabel = getMessage("message_unlocked_label");
	labelElem.innerHTML = translatedLabel;
}


/**
 * initialize form by fetching record with max version from the report grid
 * use record to set form fields
 */
function initializeForm(grid) {
	// get the max version record as an object
	var maxVersionRecord = getMaxDocumentVersion(grid);

	//var form = document.getElementById('afmDocManagerInputsForm');

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
	}
	else {
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
  	//var objForm = document.forms["afmDocManagerInputsForm"];
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
	onSelectV();
}


/**
 * Modify the table by removing all those rows whose primary key 
 * doesn't match the key in the restriction
 *
function inspectAndRemoveRows(grid, parentElement) {
	var dataRows = YAHOO.util.Dom.getElementsByClassName('dataRow', "tr", parentElement);
	for (var i=0, row; row = dataRows[i]; i++) {
		// row children are <td /> elements
		var children = row.childNodes;
		// test column name & value to see if row should be highlighted (here if the floor == '17')
		for (var j = 0; j < grid.columns.length ; j++) {
			if (grid.columns[j].id == 'afm_docs.pkey_value' && children[j].innerHTML != docmanager_pkey_value) {
				parentElement.removeChild( row );
			}
		}
	}
}
*/

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
