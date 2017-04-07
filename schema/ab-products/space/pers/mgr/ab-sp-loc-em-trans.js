/**
 * @author Guo Jiangtao
 */
var controller = View.createController('abSpLocEmTrans_controller', {

	//used for parameter of the datasource
	date : '',
	
	//all drawing names
	dwgNames : [],
	
	//current drawing name when loading more that one drawing 
	currentDrawing : '',
	
	dateToAddField:'rmpct.date_start',
	dateToUpdateField:'rmpct.date_start',
	
	//filter console
	console:null,
	//timteLine panel.
	timeLine:null,
	
	afterViewLoad : function() {
		//register event handler of the drawing panel
		this.abSpLocEmTrans_floorPlan.addEventListener('ondwgload', onDwgLoaded);
		this.abSpLocEmTrans_floorPlan.appendInstruction("default", "", getMessage('drawingPanelTitle1'));
	},

	afterInitialDataFetch : function() {

		//set current date to the console
		this.date = getCurrentDate();
		this.abSpLocEmTrans_console.setFieldValue('rmpct.date_start', this.date);
		
		//set datasource parameter
		this.setParameters();
		
		//set timeline button
		this.console=this.abSpLocEmTrans_console;
		this.timeLine=this.timeLineButton;
		this.dateAction = this.timeLine.actions.get('currentDate');
		this.dateAction.setTitle(this.console.getFieldElement(this.dateToAddField).value);
		this.date=this.abSpLocEmTrans_console.getFieldValue('rmpct.date_start');
		setTimeTitle(this.timeLine);
	
		//show legend panel
		$('abSpLocEmTrans_highlightLegend_legendDiv').style.display = '';
	},

	abSpLocEmTrans_console_onShow : function() {
		
		//check the required date field
		if(!this.abSpLocEmTrans_console.canSave()){
			return;
		}
		
		//reset the timeline date from console
		this.dateAction.setTitle(this.console.getFieldElement(this.dateToAddField).value);
		
		//create restriction from console
		var restriction = new Ab.view.Restriction();
		restriction.addClause("rmpct.primary_em", 1, "=");
		var empId = this.abSpLocEmTrans_console.getFieldValue("rmpct.em_id");
		if (empId) {
			restriction.addClause("rmpct.em_id", empId + '%', "LIKE");
		}
		
		//set datasource parameter
		this.setParameters();
		
		//refresh the employee list
		this.abSpLocEmTrans_em_grid.refresh(restriction);

		// clear the drawing in the drawing panel and rows in the employee
		// details panel
		this.abSpLocEmTrans_floorPlan.clear();
		this.abSpLocEmTrans_emDetails.clear();
		
		this.abSpLocEmTrans_floorPlan.isLoadDrawing = false;
		
        var records = this.abSpLocEmTrans_em_grid.rows.length;
        if(records==1){
        	var drawingPanel = controller.abSpLocEmTrans_floorPlan;
        	drawingPanel.clear();
        	var grid = controller.abSpLocEmTrans_em_grid;
    		var emId = grid.rows[0]['rmpct.em_id'];
    		var restriction = new Ab.view.Restriction();
    		restriction.addClause("rmpct.em_id", emId, "=");
    		drawingPanel.isLoadDrawing = true;
    		controller.abSpLocEmTrans_emDetails.refresh(restriction);
    		controller.abSpLocEmTrans_floorPlan.appendInstruction("default", "", getMessage('drawingPanelTitle1') + " : " + emId);
        }

	},

	abSpLocEmTrans_emDetails_afterRefresh : function() {
		this.dwgNames = [];
		this.bl_ids = [];
		this.fl_ids = [];
		var tempNames = '';
		//get the drawing names and related building and floor
		var rows = this.abSpLocEmTrans_emDetails.rows;
		for ( var i = 0; i < rows.length; i++) {
			var dwgName = rows[i]['rm.dwgname'];
			var bl_id = rows[i]['rm.bl_id'];
			var fl_id = rows[i]['rm.fl_id'];
			if (dwgName && tempNames.indexOf(dwgName) < 0) {
				tempNames += ',' + tempNames;
				this.dwgNames.push(dwgName);
				this.bl_ids.push(bl_id);
				this.fl_ids.push(fl_id);
			}
		}

		//load first drawing
		this.addFirstDrawing();
	},


	/**
	 * add first drawing to the drawing panel
	 */
	addFirstDrawing : function() {
		if (this.dwgNames.length>0) {
			//load the first drawing, the other drawings in the list will be loaded in listener onDwgLoaded 
			//which can avoid bug when loading multiple drawing at the same time
			this.currentDrawing = this.dwgNames[0];
			var dcl = new Ab.drawing.DwgCtrlLoc(this.bl_ids[0], this.fl_ids[0], '', this.currentDrawing);
			this.abSpLocEmTrans_floorPlan.addDrawing(dcl, null);
			
			//remove the first drawing name and related building and floor in the array, 
			//so the next one became the first one in the array 
			this.dwgNames.shift();
			this.bl_ids.shift();
			this.fl_ids.shift();

			//highlight employee rooms in current drawings
			controller.highlightCurrentDrawing();
		}
	},

	/**
	 * highlight employee rooms in current drawing
	 */
	highlightCurrentDrawing : function() {
		var highlightOpts = new DwgOpts();
		highlightOpts.rawDwgName = this.currentDrawing;
		highlightOpts.mode = 'none';

		//get all rooms that contain the selecte employee and add them to highlight options
		var rows = this.abSpLocEmTrans_emDetails.rows;
		for ( var i = 0; i < rows.length; i++) {
			var df = new DwgFill();
			var assetId = rows[i]['rm.bl_id'] + ';' + rows[i]['rm.fl_id'] + ';' + rows[i]['rm.rm_id'];
			var dwgName = rows[i]['rm.dwgname']
			if (dwgName && dwgName == this.currentDrawing) {
				//primary room will show yellow, satellite room will show blue
				if (rows[i]['rmpct.primary_em.raw'] == '1') {
					df.fc = 0xFFFF00;// yellow
				} else {
					df.fc = 0x0000FF;// blue
				}
				highlightOpts.appendRec(assetId, df);
			}
		}

		//higlight the rooms in the options
		if (highlightOpts.recs) {
			this.abSpLocEmTrans_floorPlan.highlightAssets(highlightOpts);
		}

	},

	/**
	 * set the datasource patameters
	 */
	setParameters : function() {
		this.date=this.abSpLocEmTrans_console.getFieldValue('rmpct.date_start');
		var list = ['abSpLocEmTrans_em_grid', 'abSpLocEmTrans_emDetails', 'abSpLocEmTrans_rmLabel'];
		for ( var i = 0; i < list.length; i++) {
			var control = View.dataSources.get(list[i]);
			if (!control) {
				control = View.panels.get(list[i]);
			}
			control.addParameter('date', this.date);
		}
	},
	
	/**
	 * call in file : ab-sp-timeline-common.js
	 */
	afterTimeButtonClick : function(){
		
		this.setParameters();
		showEmLocations();
	}
	
});

/**
 * Open em photo by selected record row.
 */
function openDialogForEm(){
    var grid = View.panels.get('abSpLocEmTrans_emDetails');
    var em_id = grid.rows[grid.selectedRowIndex]["em.em_id"];
    var em_photo = grid.rows[grid.selectedRowIndex]["em.em_photo"];
    
    var restriction = new Ab.view.Restriction();
    restriction.addClause("em.em_id", em_id, "=");
    var distinctPanel = View.panels.get('emPhotoForm');
    distinctPanel.refresh(restriction);
    
    if (valueExistsNotEmpty(em_photo)) {
		distinctPanel.showImageDoc('image_field', 'em.em_id', 'em.em_photo');
	}
	else {
		distinctPanel.fields.get('image_field').dom.src = null;
		distinctPanel.fields.get('image_field').dom.alt = getMessage('noImage');
	}
    
    distinctPanel.showInWindow({
        width: 800,
        height: 600
    });
}
/**
 * show all employeee locations in the grid abSpLocEmTrans_emDetails
 */
function showEmLocations() {
	var drawingPanel = controller.abSpLocEmTrans_floorPlan;
	drawingPanel.clear();
	var grid = controller.abSpLocEmTrans_em_grid;
	if(grid.selectedRowIndex!=-1){
		var emId = grid.rows[grid.selectedRowIndex]['rmpct.em_id'];
		var restriction = new Ab.view.Restriction();
		restriction.addClause("rmpct.em_id", emId, "=");
		drawingPanel.isLoadDrawing = true;
		controller.abSpLocEmTrans_emDetails.refresh(restriction);
		controller.abSpLocEmTrans_floorPlan.appendInstruction("default", "", getMessage('drawingPanelTitle1') + " : " + emId);
	}
}

/**
 * listener of the drawing onload event
 */
function onDwgLoaded() {
	
	//add next drawing in the drawing name array until all drawings are loaded
	controller.addFirstDrawing();
}

function generateReport(){
	var grid = View.panels.get("abSpLocEmTrans_emDetails");
	var result = "";
    var records = grid.rows;
    for (var j = 0; j < records.length; j++) {
        var row = records[j];
        result+="'"+row["rmpct.em_id"]+"',"
    }    
    var restriction = " 1=1 ";
    if(result!=""){
    	result = result.substring(0,result.length-1);
        restriction += " and rmpct.em_id in (" + result + ")";
    }
    
    //kb:3037291,1. When generate paginate report, it should show employee's location based on the date selected.
	var parameters = {
	    	'existsBlflrm':' and '+restriction,
	    	'dateParameter':getDateWithISOFormat(controller.console.getFieldElement(controller.dateToAddField).value)
    	}; 
	
    View.openPaginatedReportDialog("ab-sp-loc-em-trans-print.axvw", null , parameters);
}




