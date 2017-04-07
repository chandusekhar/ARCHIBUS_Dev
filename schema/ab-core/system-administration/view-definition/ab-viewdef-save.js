var tabsFrame = View.getView('parent').panels.get('tabsFrame');

/**
 * Called when page is loaded/refreshed.  Set up the "Save" form by.
 *
 * @param	None
 * @return	None
 *
 */
function loadSave(){
	// disable "Publish" tab
    tabsFrame.setTabEnabled("page7", false);
    
	// get grid and activity and process buttons
    var form = Ab.view.View.getControl('', 'afm_processes_form');
    var activityObj = $('afm_processes_form_afm_processes.activity_id');
    var processObj = $('afm_processes_form_afm_processes.process_id');
    
	// set the activity and process buttons to readOnly and disabled
    activityObj.readOnly = true;
    processObj.readOnly = true;
    activityObj.disabled = false;
    processObj.disabled = false;
	
	// if no activity selected, clear the default
    if (tabsFrame.activity_id == undefined) {
        form.setInputValue('afm_processes.activity_id', '');
        form.setInputValue('afm_processes.process_id', '');
    }
    else {
		// otherwise, fill in with previously selected activity and process
        form.setInputValue('afm_processes.activity_id', tabsFrame.activity_id);
        form.setInputValue('afm_processes.process_id', tabsFrame.process_id);
    }
    
	// show "Publish", "Save View", and "Start Over" buttons
    $('publishToPNav').style.display = "";
    $('saveView').style.display = "";
    $('startOver').style.display = "";
    
	// enable activity select value button and hide create, convert, publish buttons
    $('selectActivity').readOnly = false;
    $('createNewView').style.display = "none";
    $('convertNewView').style.display = "none";
    $('publishToPNav').style.display = "none";
    
	    
	// enable file name input box
    $('textFileName').readOnly = false;
	
	// disable save button
    $('saveView').disabled = true;
    
	// get file name
    var uniqueFileName = tabsFrame.uniqueFileName;
    if (uniqueFileName == undefined) {
        uniqueFileName = "";
    }
	
    // Manually create label for file name
    $('textFileName').parentNode.previousSibling.innerHTML = getMessage("saveName");
    
    // append username
    //if(isMiniWizard()){
    //	uniqueFileName += View.user.name;
    //}

		// 3024706
    $('textFileName').value = "a" + uniqueFileName + ".axvw";
    $('textFileName').disabled = false;
    $('fileSavedConfirmation').innerHTML = "";
}

/**
 * Save primary file and handle save of secondary file (if it exists).  Enable/disable and
 * hide/show relevant action and select value buttons.
 * button.  Hide 
 *
 * @param	None
 * @return	None
 *
 */
function saveView(){

    // get activity and process id
    var activityObj = $('afm_processes_form_afm_processes.activity_id');
    var processObj = $('afm_processes_form_afm_processes.process_id');
    var activity_id = activityObj.value;
    var process_id = processObj.value;
    
    // if process or activity id was not selected, alert
    if ((activity_id == "") || (process_id == "")) {
        alert(getMessage("noData"));
    }
    else {
        // otherwise
        var pattern = String(tabsFrame.patternRestriction);
        var viewType = String(tabsFrame.typeRestriction);
                
        var newFileName = $('textFileName').value;
        var textFileName = $('textFileName').value;
        var ext = textFileName.substring(textFileName.length - 5, textFileName.length);

        var regExObj = /[^\w|\.|\-]+/gi;
        
        // if a filename was not provided, alert
        if (textFileName == "") {
            alert(getMessage("noFileName"));
        } else if ( (/[A-Z]/.test(textFileName)) || 'ab-' !== textFileName.substring(0, 3)) {
        	 alert(getMessage("invalidFileName"));
        } else 
            if (ext.toLowerCase() != ".axvw") {
                // otherwise, if provided name is not *.axvw extension, alert
                alert(getMessage("wrongExt"));
            }
            else 
                if (textFileName.match(regExObj)) {
                    // if provided filename is invalid, alert
                    alert(getMessage("invalidFileName"));
                    $('textFileName').focus();
                }
                else {
                
                    // handle views that have secondary/accomopanying views
					/*
                    switch (pattern) {
                        case "ab-viewdef-editform-drilldown-popup":
                            saveAccompanyingView(textFileName, activity_id, process_id);
                            break;
                        default:
                            break;
                    }
                    */
					
                    // save primary view
                    var uniqueFileName = tabsFrame.uniqueFileName;
                    var patternCamelCase = convertToCamelCase(pattern);
                    var newFileNameCamelCase = convertToCamelCase(newFileName);
                    var parameters = {
                        'oldfileName': uniqueFileName + ".axvw",
                        'newfileName': newFileName,
                        'activity': activity_id,
                        'process': process_id,
                        'viewType': viewType,
                        'patternCamelCase': patternCamelCase,
                        'newFileNameCamelCase': newFileNameCamelCase
                    };
                    var result = Ab.workflow.Workflow.runRuleAndReturnResult('AbSystemAdministration-moveAndRenameFile', parameters);
                    var message = getMessage('newFileSaved') + result.message;
                    var newViewPath = message;
                    
                    // display save confirmation text
                    $('saveFilePrompt').style.display = "none";
                    $('fileSavedConfirmation').style.display = "";
                    $('fileSavedConfirmation').innerHTML = '<font color="red">' + newViewPath + "</font> \n";
                    
					/*
                    // show save confirmation for secondary file, if it exists
                    if (pattern == "ab-viewdef-editform-drilldown-popup") {
                        var accompanyfilepath = newViewPath.replace(".axvw", "-details.axvw");
                        $('fileSavedConfirmation').innerHTML += '<br/><font color="red">' + accompanyfilepath + "</font>";
                    }
                    */
					
                    // disable activity and process select value buttons
                    activityObj.readOnly = true;
                    activityObj.disabled = true;
                    processObj.readOnly = true;
                    processObj.disabled = true;
                    
                    // hide the select value buttons			
                    $('selectActivity').style.display = "none";
                    $('selectProcess').style.display = "none";
                    
                    // disable the file name input box
                    $('textFileName').readOnly = true;
                    $('textFileName').disabled = true;
                    
                    // show the create new view, convert new view, and publish buttons
                    $('createNewView').style.display = "";
                    //$('convertNewView').style.display = "";
                    $('convertNewView').style.display = (!isMiniWizard()) ? 'none' : '';
                    $('publishToPNav').style.display = "";
                    
                    // hide the save and start over buttons
                    $('saveView').style.display = "none";
                    $('startOver').style.display = "none";
                    
                    // store the file name, activity, and process in the tabs frame
                    tabsFrame.textFileName = $("textFileName").value;
                    tabsFrame.activity_id = activity_id;
                    tabsFrame.process_id = process_id;
                    
                    /*                   
             // create a restriction for the next tab
             var restriction = {
             'afm_processes.activity_id': activity_id,
             'afm_processes.process_id': process_id
             };
             tabsFrame.publishRestriction = restriction;
             */
                    // enable "Publish" tab
                    tabsFrame.setTabEnabled("page7", true);
                }
    }
}

/**
 * Some views consist of more than one file.  Move and rename secondary file with a permanent name.
 * Read in the primary file, updating any references of this secondary view. Delete the old, temporary
 * primary file.  Write the new contents to a new java temp view file.  Store the new name.
 *
 * @param	newFileName		new, temporary name for the accompanying file
 * @param 	activity 		activity id
 * @param	process			process id
 * @return	None
 *
 */
function saveAccompanyingView(newFileName, activity, process){
    var secondaryViewPath = tabsFrame.secondaryFilePath;
    var secondaryFileName = getFileNameWithoutExt(secondaryViewPath);
    var uniqueFileName = tabsFrame.uniqueFileName;
    var pattern = String(tabsFrame.patternRestriction);
    var viewType = String(tabsFrame.typeRestriction);
    var patternCamelCase = convertToCamelCase(pattern);
    var newFileNameCamelCase = convertToCamelCase(newFileName);

    // move and rename the details file according the primary file
    var parameters = {
        'oldfileName': secondaryFileName + ".axvw",
        'newfileName': getFileNameWithoutExt(newFileName) + "-details.axvw",
        'activity': activity,
        'process': process,
        'viewType': viewType,       
        'patternCamelCase': patternCamelCase,
        'newFileNameCamelCase': newFileNameCamelCase
    };
    var result = Ab.workflow.Workflow.runRuleAndReturnResult('AbSystemAdministration-moveAndRenameFile', parameters);
    var message = getMessage('newFileSaved') + result.message;
    
    // get the view contents of the primary file
    var parameters = {
        'fileName': uniqueFileName + ".axvw",
        'fileType': 'ConvertedView'
    };
    var result = Ab.workflow.Workflow.runRuleAndReturnResult('AbSystemAdministration-getViewContents', parameters);
    var fileContents = result.message;
    
    // in the primary view file, replace any references to the temporary secondary view file with the permanent name
    var uniqueFilenameRegExp = new RegExp(getFileNameWithoutExt(secondaryViewPath) + ".axvw", "g");
    var newfileContents = String(fileContents.replace(uniqueFilenameRegExp, getFileNameWithoutExt(newFileName) + "-details.axvw"));
    
    // delete old temp primary view
    var parameters = {
        'fileName': uniqueFileName + ".axvw"
    };
    var result = Ab.workflow.Workflow.runRuleAndReturnResult('AbSystemAdministration-deleteFile', parameters);
    
    // write the new contents to a new java temp view file
    var parameters = {
		'viewType': viewType,
        'fileExt': ".axvw",
        'fileContents': newfileContents
    };
    var result = Ab.workflow.Workflow.runRuleAndReturnResult('AbSystemAdministration-writeViewContents', parameters);
    
    // store the new file name   
    tabsFrame.uniqueFileName = getFileNameWithoutExt(result.message);
    uniqueFileName = getFileNameWithoutExt(result.message);
}

/**
 * Display select value dialog box for activity id
 *
 * @param	None
 * @return	None
 *
 */
function selectActivity(){
		var restriction = "(EXISTS(SELECT * FROM afm_activities WHERE afm_activities.activity_id = afm_processes.activity_id AND afm_activities.is_active=1 AND afm_processes.process_type IN ('WEB', 'WEB-DASH'))";

  	AdminService.getProgramLicense({
			callback: function(license) {
				var licenseIds = [];
				var licenses = license.licenses;
				var licenseRestriction = (licenses.length == 0) ? '' : ' AND afm_activities.activity_id IN ( ';
				for(i in licenses){
					licenseIds.push(licenses[i].id);
					licenseRestriction += "'" + licenses[i].id + "', ";
				}
				if(licenseRestriction.length > 0){
					licenseRestriction  = licenseRestriction.slice(0, licenseRestriction.length-2) + ')';
				}
				restriction += licenseRestriction + ')';
				Ab.view.View.selectValue('afm_processes_form', getMessage('activities'), ['afm_processes.activity_id'], 'afm_processes', ['afm_processes.activity_id'], ['afm_processes.activity_id', 'afm_activities.title'], restriction, 'afterSelectActivity', true, false, '', 1000, 500);
			},				
			errorHandler: function(m, e) {
				View.showException(e);
			}
		});
   
}

/**
 * Callback function for "Select Activity" select value.  After an activity id has been selected,
 * if it is different from the previously selected value, clear the process id.
 *
 * @param	targetFieldName		String of the field name
 * @param	selectedValue 		String of the selected value
 * @param	previousValue		String of the previously selected value
 * @return	None
 *
 */
function afterSelectActivity(targetFieldName, selectedValue, previousValue){
    if (selectedValue != previousValue) {
        $('afm_processes_form_afm_processes.process_id').value = '';
    }
}

/**
 * Display select value dialog for process id, restricting records to previously selected activity id
 *
 * @param	None
 * @return	None
 *
 */
function selectProcess(){
    Ab.view.View.selectValue('afm_processes_form', getMessage('processes'), ['afm_processes.process_id'], 'afm_processes', ['afm_processes.process_id'], ['afm_processes.process_id', 'afm_processes.title', 'afm_processes.process_type'], "afm_processes.activity_id LIKE '" + $('afm_processes_form_afm_processes.activity_id').value + "' AND process_type='WEB' AND is_active=1", 'afterSelectProcess', true, false, '', 1000, 500);
}

/**
 * Callback function for "Select Process" select value.  After a process id has been selected,
 * create a restriction for the "Publish" tab and enable the "Continue to Save" button.
 *
 * @param	targetFieldName		String of the field name
 * @param	selectedValue 		String of the selected value
 * @param	previousValue		String of the previously selected value
 *
 */
function afterSelectProcess(targetFieldName, selectedValue, previousValue){
    var activity_id = $('afm_processes_form_afm_processes.activity_id').value;
    // var restriction = "activity_id ='" + activity_id + "' AND process_id ='" + selectedValue + "'";
    var restriction = new Ab.view.Restriction();
    restriction.addClause('afm_processes.activity_id', activity_id, '=');
    restriction.addClause('afm_processes.process_id', selectedValue, '=');
    tabsFrame.publishRestriction = restriction;
    
    $('saveView').disabled = false;
}

/**
 * Takes entire file path as arguement and returns file name without file extension
 *
 * @param	filePath			String containing full file path
 * @return	fileNameWithoutExt	String containing file name without file extension
 *
 */
function getFileNameWithoutExt(filePath){
    var temp = filePath.split(".");
    var pathWithoutExt = temp[temp.length - 2].split("\\");
    var fileNameWithoutExt = pathWithoutExt[(pathWithoutExt.length - 1)];
    
    return fileNameWithoutExt;
}

/**
 * Takes entire file path as arguement and returns file name without file extension
 *
 * @param	filePath			String containing full file path
 * @return	fileNameWithoutExt	String containing file name without file extension
 *
 */
function publishToPNav(){
	var restriction = tabsFrame.publishRestriction;
	tabsFrame.selectTab('page7', restriction);
}




