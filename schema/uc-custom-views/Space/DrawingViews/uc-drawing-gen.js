// CHANGE LOG
// 2010/12/15 - Removed the initial addDrawing if there's no restriction.
var bldg = null;
var floor = null;
var drawingController = View.createController('drawingController', {
	afterInitialDataFetch: function() {
		// load the drawing based on the queryString
		var bl_id = window.location.parameters['bl_id'];
		var fl_id = window.location.parameters['fl_id'];

		// add drawing takes a restriction object
		var rest = new Ab.view.Restriction();
		rest.addClause("fl.bl_id", bl_id, "=");
		rest.addClause("fl.fl_id", fl_id, "=");

		if (bl_id != null && bl_id != "") {
            this.cadPanel.addDrawing(rest, null);
        }

		var ruleset = new DwgHighlightRuleSet();

		ruleset.appendRule("fhbm.material_type", "NSM", "ff0000", "=", "NSM");
		this.cadPanel.appendRuleSet("highlightFHBMDs", ruleset);

		// specify a handler for when an onclick event occurs in the Drawing component
    	this.cadPanel.addEventListener('onclick', onClickHandler);
		
	},
	
	onSelectStatus: function(row){
	    bldg = row['bl.bl_id'];
	    floor = row['fl.fl_id'];
	    
	    // add drawing takes a restriction object
	    var rest = new Ab.view.Restriction();
	    rest.addClause("rm.bl_id", bldg, "=");
	    rest.addClause("rm.fl_id", floor, "=");

	    View.getControl('', 'cadPanel').addDrawing(rest);
	},
});


function onClickHandler(pk, selected)
{
	if (selected) {
		var dlgConfig = new Object();
		dlgConfig.closeButton = false;

		var rest = new Ab.view.Restriction();
		rest.addClause("rm.bl_id", pk[0], "=", true);
		rest.addClause("rm.fl_id", pk[1], "=", true);
		rest.addClause("rm.rm_id", pk[2], "=", true);

		View.openDialog('uc-rm-detail-separate-window-drawing-popup.axvw', rest, false, dlgConfig);
	}
}

//pass just restrictions without parameters
function generateDrawing() {
    //alert("test1");
    var ddlHighlights = document.getElementById("selector_hilite");
    var selHighlight = ddlHighlights.options[ddlHighlights.selectedIndex].text;

    var reportViewName = null;
    var restrictionhighlightData = new Ab.view.Restriction();
    var restrictionlabelName = new Ab.view.Restriction();
    var restrictionLegend = new Ab.view.Restriction();

    //a paginated view name
    restrictionhighlightData.addClause('rm.bl_id', bldg, '=');
    restrictionhighlightData.addClause('rm.fl_id', floor, '=');

    restrictionlabelName.addClause('rm.bl_id', bldg, '=');
    restrictionlabelName.addClause('rm.fl_id', floor, '=');

    restrictionLegend.addClause('rm.bl_id', bldg, '=');
    restrictionLegend.addClause('rm.fl_id', floor, '=');
	    
    var dsHighlights = null;
    var dsLabels = null;
    var dsLegends = null;

    var hiRoomClass = 'highlightRoomClass5';
    var hiCategory = 'highlightCategoriesDs3';
    var hiRoomType = 'highlightRoomTypesDs8';
    var hiDeptCode = 'highlightDepartmentsDs5';
    var hiDivCode = 'highlightDivisionDs29';
    var hiNone = 'highlightNoneDS9';

    var laRoomClassRoomNumbers = 'dslaRoomClassRoomNumbers5';
    var laRoomCatRoomNumbers = 'dslaRoomCatRoomNumbers1';
    var laRoomTypeRoomNumbers = 'dslaRoomTypeRoomNumbers';
    var laDivRoomNumbers = 'dslaDivRoomNumbers1';
    var laDepRoomNumbers = 'dslaDepRoomNumbers1';
    var laNoneRoomNumbers = 'dslaNoneRoomNumbers2';
    

    var leDivCode = 'dsDivisionLeg110';
    var leRmClass = 'dsRoomClassLeg111';
    var leRmCat = 'dsRoomCatLeg101';
    var leRmType = 'dsRoomTypeLeg111';
    var leDepCode = 'dsDepartmentLeg101';
    var leNone = 'dsNoneLeg';

    if(bldg == null || floor == null)
    {
        View.showMessage("Please select a Building / Floor.");
        return;
    }
	    
    if (selHighlight == 'Room Categories') {
        dsHighlights = hiCategory;
        dsLabels = laRoomCatRoomNumbers;
        dsLegends = leRmCat;
        reportViewName = "uc-drg-gen-rpt-rcat.axvw";
    }
    else if (selHighlight == 'Room Type') {
        dsHighlights = hiRoomType;
        dsLabels = laRoomCatRoomNumbers;
        dsLegends = leRmType;
        reportViewName = "uc-drg-gen-rpt-rt.axvw";
    }
    else if (selHighlight == 'Departments') {
        dsHighlights = hiDeptCode;
        dsLabels = laDepRoomNumbers;
        dsLegends = leDepCode;
        reportViewName = "uc-drg-gen-rpt-dep.axvw";
    }
    else if (selHighlight == 'Division') {
        dsHighlights = hiDivCode;
        dsLabels = laDivRoomNumbers;
        dsLegends = leDivCode;
        reportViewName = "uc-drg-gen-rpt-div.axvw";
    }
    else
    {
        View.showMessage("Please select a Highlight Type.");
        return;
        //dsHighlights = hiNone;
        //dsLabels = laNoneRoomNumbers;
        //dsLegends = leNone;
        //reportViewName = "uc-drg-gen-rpt.axvw";
    }
    
    //parameters
    var parameters = null;
    var parameters = {'printRestriction': true};
    var parameters = {'bl_id': bldg, 'fl_id': floor};
    var passedRestrictions = { dsHighlights: restrictionhighlightData };

    //passing restrictions
    View.openPaginatedReportDialog(reportViewName, passedRestrictions, parameters);
}