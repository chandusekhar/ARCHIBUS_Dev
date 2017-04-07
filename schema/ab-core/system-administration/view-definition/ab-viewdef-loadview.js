tabsFrame = View.getView('parent').panels.get('tabsFrame');

/**
 * Called when "Load (Optional)" tab is first loaded.  Treat this as a refresh.
 *
 * @param	None
 * @return 	None
 *
 */
 /*
function user_form_onload(){
    user_form_afterSelect();
}
*/

/**
 * Called when view is refreshed
 *
 * @param	None
 * @return 	None
 *
 */
 function user_form_afterSelect(){
    // enable relevant tabs and disabled all other tabs
    enableLoadTabs();
    
    // get the select box that holds the name of the file to convert
    var fileToConvert = $('fileToConvert');
    
    // disable the "Load View and Continue to Select Type" button   
    $('loadView').disabled = true;
    
    // use wf rule to return a string where file names are delimited by a comma
    var result = Ab.workflow.Workflow.runRuleAndReturnResult('AbSystemAdministration-getListOfFilesToConvert', {});
    var filesInDir = result.message;
    
    // convert the string of filenames into an array
    var files = new Array();
    files = filesInDir.split(",");
    
    // boolean used to keep track of whether a filename in the select box should be highlighted
    var bHighlight = false;
    
    // disable or enable the select box and continue button based on the status
    if ((tabsFrame.disableFileSelect == true)) {
        fileToConvert.disabled = true;
        $('loadView').disabled = true;
    }
    else {
        fileToConvert.disabled = false;
        $('loadView').disabled = false;
    }
    
    // if a file has been selected, highlight the filename in the select box
    // otherwise, disabled the "Display View" button
    if ((tabsFrame.fileToConvert != "") && (tabsFrame.fileToConvert != undefined)) {
        bHighlight = true;
    }
    else {
        $('displayView').disabled = true;
    }
    
    // check if there are any files under the per-site/files-to-convert folder. if not, display message 
    // and disable the load and display buttons
    if (String(files[0]) == "") {
        files[0] = getMessage("noFilesFound");
        files[1] = "";
        //  $('displayView').disabled = true;
    }
    
    // reset all options first	 
    fileToConvert.options.length = 0;
    
    // build the select box, filling the contents with either the names of files or the warning message
    for (i = 0; i < (files.length - 1); i++) {
        var oOption = document.createElement("OPTION");
        oOption.appendChild(document.createTextNode(files[i]));
        oOption.value = files[i];
        if ((bHighlight == true) && (oOption.value == tabsFrame.fileToConvert)) {
            fileToConvert.selectedIndex = oOption.index;
            oOption.selected = true;
        }
        fileToConvert.appendChild(oOption);
    }
    
}

/**
 * Disable all tabs relevant to "Load (Optional)" tab.  Disable all others.
 * Called when "Load (Optional)" tab is first loaded and when view is refreshed.
 *
 * @param	None
 * @return 	None
 *
 */
function enableLoadTabs(){
    tabsFrame.setTabEnabled("page0", true);
    tabsFrame.setTabEnabled("page1", true);
    tabsFrame.setTabEnabled("page2", false);
    tabsFrame.setTabEnabled("page3", false);
    tabsFrame.setTabEnabled("page4", false);
    tabsFrame.setTabEnabled("page5", false);
    tabsFrame.setTabEnabled("page6", false);
    tabsFrame.setTabEnabled("page7", false);
}

/**
 * Gets the selected filename from the select dialog box and display the selected view.
 *
 * @param	None
 * @return 	None
 *
 */
function displaySelectedView(){
    var fileToConvert = $('fileToConvert');
    
    if (fileToConvert.selectedIndex == -1) {
        alert(getMessage("noFile"));
    }
    else {
        var fileName = fileToConvert.options[fileToConvert.selectedIndex].value;
        displayView(fileName);
    }
}

/**
 * Reload and refresh the "Load (Optional)" tab
 *
 * @param	None
 * @return 	None
 *
 */
function refresh(){
    tabsFrame.selectTab('page0');
    user_form_afterSelect();
}

/**
 * Retrieve the selected filename option.  If it was the "no files" message, alert user.
 * Otherwise, store this selected file name as property in the tabs frame object and enable
 * the "Display View" and "Continue" buttons.
 *
 * @param	None
 * @return 	None
 *
 */
function storeSelectedViewName(){
    var fileToConvert = $('fileToConvert');
    if (fileToConvert.selectedIndex == -1) {
        alert(getMessage("noFile"));
    }
    else {
        var fileName = fileToConvert.options[fileToConvert.selectedIndex].value;
        tabsFrame.fileToConvert = fileName;
        $('displayView').disabled = false;
        $('loadView').disabled = false;
    }
}

/**
 * When the "Continue" button is pressed, if valid, store the filename and navigate to
 * the next tab
 *
 * @param	None
 * @return 	None
 *
 */
function storeAndContinue(){
    storeSelectedViewName();
    var fileToConvert = $('fileToConvert');
    if (fileToConvert.selectedIndex != -1) {
        tabsFrame.selectTab('page1');
    }
}

