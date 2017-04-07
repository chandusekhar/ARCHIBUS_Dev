/**
 * @author keven.xi
 */
var systemYear = 2025;

var viewProjItemsController = View.createController('viewProjItems', {

    blString: "EXISTS (SELECT 1 FROM bl WHERE bl.bl_id = project.bl_id AND ",
    
    siteString: "EXISTS (SELECT 1 FROM site WHERE site.site_id = project.site_id AND ",
    
    programString: "EXISTS (SELECT 1 FROM program WHERE project.program_id = program.program_id AND ",
    
    consoleRestrictions: "",
    
    afterViewLoad: function(){
        this.locateBuilding_cadPanel.appendInstruction("default", "", getMessage("falsh_headerMessage"));
        setConsoleTimeframe();
        clearConsoleTimeframe();
        this.resetProjectStatus();
    },
    
    /**
     * Fetch data for the report grid restricted by values from the console
     */
    consolePanel_onShow: function(){
        var restriction = this.getConsoleRestriction();
        this.sitesGrid.refresh(restriction);
        if (valueExists(this.locateBuilding_cadPanel.currentRecSet)) {
            this.locateBuilding_cadPanel.clear();
            this.locateBuilding_cadPanel.lastLoadedDwgname = "";
            this.locateBuilding_cadPanel.setTitle(getMessage("falsh_headerMessage"));
        }
    },
    
    /**
     * Clear the console & refresh report, plus reset the Project Status select box
     */
    consolePanel_onClear: function(){
        this.consolePanel.clear();
        clearConsoleTimeframe();
        this.resetProjectStatus();
        this.sitesGrid.refresh('');
        this.consoleRestrictions = "";
    },
    
    /**
     * Bring up a select value dialog for project.project_id using many current values from the console
     */
    consolePanel_onSelectProjectId: function(){
        var record = this.consolePanel.getRecord();
        var restriction = 'project.is_template = 0';
        
        restriction = this.addFieldValToRestriction('project.project_type', restriction, record);
        restriction = this.addFieldValToRestriction('project.program_id', restriction, record);
        restriction = this.addFieldValToRestriction('project.proj_mgr', restriction, record);
        restriction = this.addFieldValToRestriction('project.bl_id', restriction, record);
        restriction = this.addFieldValToRestriction('project.site_id', restriction, record);
        restriction = this.addFieldValToRestriction('project.dp_id', restriction, record);
        restriction = this.addFieldValToRestriction('project.dv_id', restriction, record);
        restriction = this.addFieldValToRestriction('project.apprv_mgr1', restriction, record);// in Project Calendar console
        var state_id = record.getValue('bl.state_id');
        if (state_id && state_id != "") {
            restriction = this.addRelopIfNeeded(restriction);
            restriction += " (" + this.blString + "bl.state_id LIKE \'%" + state_id + "%\') OR ";
            restriction += " " + this.siteString + "site.state_id LIKE \'%" + state_id + "%\'))";
        }
        var city_id = record.getValue('bl.city_id');
        if (city_id && fieldValue != "") {
            restriction = this.addRelopIfNeeded(restriction);
            restriction += " (" + this.blString + "bl.city_id LIKE \'%" + city_id + "%\') OR ";
            restriction += " " + this.siteString + "site.city_id LIKE \'%" + city_id + "%\'))";
        }
        var title = '';
        if (getMessage('projSelvalTitle') != "") {
            title = getMessage('projSelvalTitle');
        }
        View.selectValue('consolePanel', title, ['project.project_id'], 'project', ['project.project_id'], ['project.project_id', 'project.status', 'project.summary'], restriction);
    },
    
    
    /**
     * Bring up a select value dialog for program.program_id using the current value of program_type
     */
    consolePanel_onSelectProgramId: function(){
        var record = this.consolePanel.getRecord();
        var restriction = '';
        restriction = this.addFieldValToRestriction('program.program_type', restriction, record);
        View.selectValue('consolePanel', getMessage('programName'), ['project.program_id'], 'program', ['program.program_id'], ['program.program_id', 'program.program_type'], restriction);
    },
    
    
    sitesGrid_afterRefresh: function(){
        var restriction = new Ab.view.Restriction();
        restriction.addClause("activity_log.activity_log_id", -1, "=");
        this.itemsDetails.refresh(restriction);
    },
    
    /**
     * Read values out of the console record and form the restriction
     */
    getConsoleRestriction: function(){
        var restriction = "";
        var record = this.consolePanel.getRecord();
        
        var state_id = record.getValue('bl.state_id');
        if (state_id && trim(state_id) != "") {
            restriction += "(" + this.blString + "bl.state_id LIKE \'%" + state_id + "%\') OR ";
            restriction += this.siteString + "site.state_id LIKE \'%" + state_id + "%\')) ";
        }
        var city_id = record.getValue('bl.city_id');
        if (city_id && trim(city_id) != "") {
            restriction = this.addRelopIfNeeded(restriction);
            restriction += "(" + this.blString + "bl.city_id LIKE \'%" + city_id + "%\') OR ";
            restriction += this.siteString + "site.city_id LIKE \'%" + city_id + "%\')) ";
        }
        var program_type = record.getValue('program.program_type');
        if (program_type && trim(program_type) != "") {
            restriction = this.addRelopIfNeeded(restriction);
            restriction += this.programString + "program.program_type LIKE \'%" + program_type + "%\') ";
        }
        
        restriction = this.addFieldValToRestriction('project.dv_id', restriction, record);
        restriction = this.addFieldValToRestriction('project.project_type', restriction, record);
        restriction = this.addFieldValToRestriction('project.dp_id', restriction, record);
        restriction = this.addFieldValToRestriction('project.project_id', restriction, record);
        restriction = this.addFieldValToRestriction('project.site_id', restriction, record);
        restriction = this.addFieldValToRestriction('project.proj_mgr', restriction, record);
        restriction = this.addFieldValToRestriction('bl.bl_id', restriction, record);
        restriction = this.addFieldValToRestriction('project.program_id', restriction, record);
        
        var status = $('status').value;
        if (status) {
            restriction = this.addRelopIfNeeded(restriction);
            if (status == 'In Planning') {
                restriction += "project.status IN (\'Approved\',\'Approved-In Design\')";
            }
            else 
                if (status == 'In Execution') {
                    restriction += "project.status IN (\'Issued-In Process\',\'Issued-On Hold\',\'Completed-Pending\',\'Completed-Not Ver\')";
                }
                else 
                    restriction += "project.status LIKE \'%\'";
        }
        else {
            restriction = this.addRelopIfNeeded(restriction);
            restriction += "project.project_id IS NOT NULL";
        }
        
        
        restriction += this.getTimeFrameRestriction();
        
        this.consoleRestrictions = restriction;
        return restriction;
    },
    
    
    /**
     * Augment the default clearForm functionality with resetting the status select box to "All"
     */
    resetProjectStatus: function(){
        var statusElem = document.getElementById('status');
        statusElem.options[0].selected = true;
    },
    
    /**
     * If the field has a non-empty value, add it to the restriction
     *
     */
    addFieldValToRestriction: function(fieldName, restriction, record){
        var fieldValue = record.getValue(fieldName);
        if (valueExistsNotEmpty(fieldValue)) {
            restriction = this.addRelopIfNeeded(restriction);
            restriction += fieldName + " LIKE \'%" + fieldValue + "%\'";
        }
        return restriction;
    },
    
    /**
     * Append the rel op ' AND ' to the restriction if it is not empty
     */
    addRelopIfNeeded: function(restriction){
        if (restriction) {
            restriction += " AND ";
        }
        return restriction;
    },
    
    
    refreshActionItems: function(dwgname, blId){
        var myDwgname = dwgname.toUpperCase();
        var strRestriction = 'activity_log.dwgname =\'' + myDwgname + '\' AND bl.bl_id LIKE \'' + blId + '\'';
        
        if (this.consoleRestrictions) {
            strRestriction += " AND "
        }
        strRestriction += this.consoleRestrictions;
        this.itemsDetails.refresh(strRestriction);
    },
    
    getTimeFrameRestriction: function(){
        var timeframeRestriction = "";
        var date_start, date_end;
        if ($('timeframe_type_years').checked) {
            var from_year = $('from_year').value;
            var to_year = $('to_year').value;
            date_start = from_year + "-" + "01-01";
            date_end = to_year + "-12-31";
            timeframeRestriction = getDateSchedRestriction(date_start, date_end);
        }
        else 
            if ($('timeframe_type_days').checked) {
                var num_days = $('num_days').value;
                var curdate = new Date();
                date_start = dateAddDays(curdate, 0);
                date_end = dateAddDays(curdate, num_days);
                timeframeRestriction = getDateSchedRestriction(date_start, date_end);
            }
        return timeframeRestriction;
    }
    
    
    
})

function setConsoleTimeframe(){
    var systemDate = new Date();
    var x = systemDate.getYear();
    systemYear = x % 100;
    systemYear += (systemYear < 38) ? 2000 : 1900;
    var optionData;
    
    var consolePanel = View.panels.get('consolePanel');
    if (consolePanel) {
        if ($('from_year')) {
            for (var i = 0; i < 21; i++) {
                optionData = new Option(systemYear - 10 + i, systemYear - 10 + i);
                $('from_year').options[i] = optionData;
            }
            $('from_year').value = systemYear;
        }
        if ($('to_year')) {
            for (var i = 0; i < 21; i++) {
                optionData = new Option(systemYear - 10 + i, systemYear - 10 + i);
                $('to_year').options[i] = optionData;
            }
            $('to_year').value = systemYear;
        }
    }
}

function clearConsoleTimeframe(){
    if ($('from_year')) 
        $('from_year').value = systemYear;
    if ($('to_year')) 
        $('to_year').value = systemYear;
    if ($('num_days')) 
        $('num_days').value = '0';
    if ($('timeframe_type_all')) 
        $('timeframe_type_all').checked = true;
}

// Build and return restriction for activity_log or project start and end dates
// start and end must be in ISO format (yyyy-mm-dd)
function getDateSchedRestriction(start, end, ctype){
    var strDateRangeStatement = " AND (";
    var sTable = "activity_log";
    var sDateField1 = "date_scheduled";
    var sDateField2 = "date_scheduled_end";
    
    if (ctype == "timeframe2") {
        sTable = "project";
    }
    
    var dstr1 = "${sql.date(\'" + start + "\')}";
    var dstr2 = "${sql.date(\'" + end + "\')}";
    var conj = " AND ";
    var endp = "";
    if (start == "") 
        conj = "("; // if no start, just place parens for end
    if (end == "") 
        endp = ")"; // if no end, place paren at start
    if (start != "") 
        strDateRangeStatement += '(' + sTable + '.' + sDateField1 + '&gt;=' + dstr1 + endp;
    if (end != "") 
        strDateRangeStatement += conj + sTable + '.' + sDateField1 + '&lt;=' + dstr2 + ')';
    
    if (sDateField2 != "") {
    
        if (start != "") 
            strDateRangeStatement += ' OR (' + sTable + '.' + sDateField2 + '&gt;=' + dstr1 + endp;
        if (end != "") 
            strDateRangeStatement += conj + sTable + '.' + sDateField2 + '&lt;=' + dstr2 + ')';
        
        if (start != "" && end != "") {
            strDateRangeStatement += ' OR (' + sTable + '.' + sDateField1 + '&lt;=' + dstr1 + endp;
            strDateRangeStatement += conj + sTable + '.' + sDateField2 + '&gt;=' + dstr2 + ')';
        }
    }
    strDateRangeStatement += ')';
    return strDateRangeStatement;
}

// Adds nxtdays to date_start and returns as a SQL formatted string
function dateAddDays(date_start, nxtdays){
    date_new = new Date(date_start.getTime() + nxtdays * (24 * 60 * 60 * 1000));
    var month = date_new.getMonth() + 1;
    if (month < 10) 
        month = "0" + month;
    var day = date_new.getDate();
    if (day < 10) 
        day = "0" + day;
    return date_new.getFullYear() + '-' + month + '-' + day;
}

function highlightSelectedBuilding(){
    // Call the drawing control to highlight the selected building
    var blGrid = View.panels.get("sitesGrid");
    var selectedRow = blGrid.rows[blGrid.selectedRowIndex];
    var tempDwgname = selectedRow['activity_log.dwgname'];
    
    
    var highDs = View.dataSources.get("ds_ab-proj-projects-map_drawing_blHighlight");
    highDs.addParameter('blId', selectedRow['bl.bl_id']);
    var drawingPanel = View.getControl('', 'locateBuilding_cadPanel');
    
    if (drawingPanel.lastLoadedDwgname == tempDwgname) {
        drawingPanel.clearHighlights();
        drawingPanel.applyDS('highlight');
    }
    else {
        var dcl = new Ab.drawing.DwgCtrlLoc('', '', '', tempDwgname);
        drawingPanel.addDrawing(dcl, null);
        drawingPanel.lastLoadedDwgname = tempDwgname;
    }
    
    //change the title of drawing panel
    var drawingPanelTitle = getMessage("falsh_headerMessage") + " " + selectedRow['bl.bl_id'];
    drawingPanel.appendInstruction("default", "", drawingPanelTitle);
    drawingPanel.processInstruction("default", "");
    
    viewProjItemsController.refreshActionItems(tempDwgname, selectedRow['bl.bl_id']);
}

