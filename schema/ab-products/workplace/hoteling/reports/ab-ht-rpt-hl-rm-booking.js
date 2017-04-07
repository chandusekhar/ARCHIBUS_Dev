var abHotelController = View.createController('abHotelController', {
	
    startDateRes: '1900-12-15',
    endDateRes: '2200-12-1',
	rmpctDvIdRes:'',
	rmpctDpIdRes:'',
	rmDvIdRes:'',
	rmDpIdRes:'',
	
    afterViewLoad: function(){
	 	onBooked(true,false,true,false);
        this.abHotelDrawingPanel.appendInstruction("default", "", getMessage('drawTitle1'));
    
	},
	/*
	 * Mapping the search button action
	 */
    searchBookingConsole_onSearch: function(){
		//add to fix KB3028798
		resetDrawingPanel();
		var selectedEL = document.getElementById("booked");
		var booked = selectedEL.options[selectedEL.selectedIndex].value;
		setRestrictionParameter();
	
		if(booked=='yes'){
			this.abHotelBlTree.addParameter('startDateRes', this.startDateRes);
			this.abHotelBlTree.addParameter('endDateRes', this.endDateRes);
			this.abHotelBlTree.addParameter('dvIdRes', this.rmpctDvIdRes);
			this.abHotelBlTree.addParameter('dpIdRes', this.rmpctDpIdRes);
			this.setRegionSize('nested_west','north',1000);
			this.setRegionSize('nested_west','center',0);
			onBooked(true,false,false,false);
			this.abHotelBlTree.refresh();
		}
		if(booked=='no')
		{
			this.abHotelBlTree1.addParameter('startDateRes', this.startDateRes);
			this.abHotelBlTree1.addParameter('endDateRes', this.endDateRes);
			this.abHotelBlTree1.addParameter('dvIdRes', this.rmDvIdRes);
			this.abHotelBlTree1.addParameter('dpIdRes', this.rmDpIdRes);
			this.setRegionSize('nested_west','north',0);
			this.setRegionSize('nested_west','center',1000);
			this.abHotelBlTree1.refresh();
			onBooked(false,true,false,false);
		}
    },
    
    searchBookingConsole_onClear: function(){
        this.searchBookingConsole.clear();
        this.startDateRes = '1900-12-15';
        this.endDateRes = '2200-12-15';
		this.rmpctDvIdRes='1=1';
		this.rmpctDpIdRes='1=1';
		this.rmDvIdRes='1=1';
		this.rmDpIdRes='1=1';
    	onBooked(false,false,false,false);
		//add to fix KB3028798
		resetDrawingPanel();
    },
	/*
 * @param {Object} layOutId
 * @param {Object} region
 * @param {Object} size
 */
    setRegionSize:function(layOutId,region,size){
		var layoutManager = View.getLayoutManager(layOutId);
		 layoutManager.setRegionSize(region, size);
}
})


/*
 * Add console restriction to other panel 
 */
function setRestrictionParameter(){
    var searchBookingConsole = View.panels.get('searchBookingConsole')
	var dvId = searchBookingConsole.getFieldValue("rmpct.dv_id");
	var dpId = searchBookingConsole.getFieldValue("rmpct.dp_id");
	if (dvId) {
		View.controllers.get('abHotelController')['rmpctDvIdRes'] = 'rmpct.dv_id='+"'"+dvId+"'";
		View.controllers.get('abHotelController')['rmDvIdRes'] = 'rm.dv_id='+"'"+dvId+"'";
	}
	else{
		View.controllers.get('abHotelController')['rmpctDvIdRes'] ='1=1';
		View.controllers.get('abHotelController')['rmDvIdRes'] ='1=1';
	}
	
	if (dpId&&dvId) {
		View.controllers.get('abHotelController')['rmpctDpIdRes'] = 'rmpct.dp_id='+"'"+dpId+"'";
		View.controllers.get('abHotelController')['rmDpIdRes'] = 'rm.dp_id='+"'"+dpId+"'";
	}else if(!dvId&&dpId){
		alert(getMessage('dvdpAlert'));
	}
	else{
		View.controllers.get('abHotelController')['rmpctDpIdRes'] ='1=1';
		View.controllers.get('abHotelController')['rmDpIdRes'] ='1=1';
	}
	
    var dateStart = searchBookingConsole.getFieldValue("rmpct.date_start");
    var dateEnd = searchBookingConsole.getFieldValue("rmpct.date_end");
	
    if (dateStart && dateEnd && dateStart <= dateEnd) {
        View.controllers.get('abHotelController')['startDateRes'] = dateStart;
        View.controllers.get('abHotelController')['endDateRes'] = dateEnd;
    }
    else 
        if (!dateStart && !dateEnd) {
            View.controllers.get('abHotelController')['startDateRes'] = '1900-12-15';
            View.controllers.get('abHotelController')['endDateRes'] = '2200-12-15';
        }
        else 
            if (!dateStart && dateEnd) {
                View.controllers.get('abHotelController')['startDateRes'] = '1900-12-15';
                View.controllers.get('abHotelController')['endDateRes'] = dateEnd;
            }
            else 
                if (dateStart && !dateEnd) {
                    View.controllers.get('abHotelController')['startDateRes'] = dateStart;
                    View.controllers.get('abHotelController')['endDateRes'] = '2200-12-15';
                }
}

/*
 * Called from view when we click the tree code of floor level
 */
function onFlNodeClick(){
	    var selectedEL = document.getElementById("booked");
		var booked = selectedEL.options[selectedEL.selectedIndex].value;
        View.panels.get('abHotelDrawingPanel').show(true);
	    View.panels.get('abHotelRmGrid').show(true);
  	    setRestrictionParameter();
		//search booked room
		if (booked == 'yes') {
			
			onBooked(true,false,true,true);
			View.controllers.get('abHotelController').setRegionSize('nested_center','center', 30);
			View.controllers.get('abHotelController').setRegionSize('nested_center','south',100);
		    var currentNode = View.panels.get('abHotelBlTree').lastNodeClicked;
		    var blId = currentNode.parent.data['bl.bl_id'];
		    var flId = currentNode.data['fl.fl_id'];
		    var dwgname = currentNode.data['fl.dwgname'];
    
		    var abHotelDrawingPanel = View.panels.get('abHotelDrawingPanel');
			var abHotelRmHighlightDS = View.dataSources.get('abHotelRmHighlightDS');
   		    abHotelRmHighlightDS.addParameter('startDateRes', View.controllers.get('abHotelController')['startDateRes']);
        	abHotelRmHighlightDS.addParameter('endDateRes', View.controllers.get('abHotelController')['endDateRes']);
			abHotelRmHighlightDS.addParameter('dvIdRes', View.controllers.get('abHotelController')['rmpctDvIdRes']);
        	abHotelRmHighlightDS.addParameter('dpIdRes', View.controllers.get('abHotelController')['rmpctDpIdRes']);

			var abHotelRmHighlightLabelDS = View.dataSources.get('abHotelRmHighlightLabelDS');
		    var title = String.format(getMessage('drawTitle') + ' ' + blId + '-' + flId);
			
			addDrawingDynamic('rm',blId,flId,'abHotelRmHighlightDS','abHotelRmHighlightLabelDS',title, dwgname);
			
			//Refresh the detail panel below code
    		var restriction = new Ab.view.Restriction();
    		restriction.addClause("rmpct.bl_id", blId, "=");
    		restriction.addClause("rmpct.fl_id", flId, "=");
    		var abHotelRmGrid = View.panels.get('abHotelRmGrid');
    		abHotelRmGrid.addParameter('startDateRes', View.controllers.get('abHotelController')['startDateRes']);
    		abHotelRmGrid.addParameter('endDateRes', View.controllers.get('abHotelController')['endDateRes']);
			abHotelRmGrid.addParameter('dvIdRes', View.controllers.get('abHotelController')['rmpctDvIdRes']);
    		abHotelRmGrid.addParameter('dpIdRes', View.controllers.get('abHotelController')['rmpctDpIdRes']);
			
    		abHotelRmGrid.clear();
    		abHotelRmGrid.refresh(restriction);
			}
			
			//search no booked room
		if (booked == 'no') {
			onBooked(false,true,true,false);
			View.controllers.get('abHotelController').setRegionSize('nested_center','center', 3000);
			View.controllers.get('abHotelController').setRegionSize('nested_center','south',0);
			var currentNode = View.panels.get('abHotelBlTree1').lastNodeClicked;
            var blId = currentNode.parent.data['bl.bl_id'];
            var flId = currentNode.data['fl.fl_id'];
            var dwgname = currentNode.data['fl.dwgname'];
	        var abHotelDrawingPanel = View.panels.get('abHotelDrawingPanel');
			var abHotelRmHighlightDS1 = View.dataSources.get('abHotelRmHighlightDS1');
   		    abHotelRmHighlightDS1.addParameter('startDateRes', View.controllers.get('abHotelController')['startDateRes']);
        	abHotelRmHighlightDS1.addParameter('endDateRes', View.controllers.get('abHotelController')['endDateRes']);
			abHotelRmHighlightDS1.addParameter('dvIdRes', View.controllers.get('abHotelController')['rmDvIdRes']);
        	abHotelRmHighlightDS1.addParameter('dpIdRes', View.controllers.get('abHotelController')['rmDpIdRes']);

			var abHotelRmHighlightLabelDS = View.dataSources.get('abHotelRmHighlightLabelDS');
		    var title = String.format(getMessage('drawTitle') + ' ' + blId + '-' + flId);
			
			addDrawingDynamic('rm',blId,flId,'abHotelRmHighlightDS1','abHotelRmHighlightLabelDS',title, dwgname);
			
	 	}
	
	
}

/*
 * Load the drawing of different datasource 
 */
function addDrawingDynamic(tableName,buildingId,floorId,currentHighlightDS,currentLabelsDS,title, dwgname) {
	var drawingPanel = View.panels.get('abHotelDrawingPanel');
    drawingPanel.clear();
    
    var dcl = new Ab.drawing.DwgCtrlLoc(buildingId, floorId, null, dwgname);
    
    var opts = new DwgOpts();
    if(dwgname) {
    	opts.rawDwgName = dwgname;
    }
    opts.assetSuffix = ''

    drawingPanel.assetTypes = tableName; //tablename;
    drawingPanel.currentHighlightDS = currentHighlightDS;
    drawingPanel.currentLabelsDS = currentLabelsDS;
	drawingPanel.addDrawing(dcl, opts);
	drawingPanel.appendInstruction("default", "", title);
    drawingPanel.processInstruction("default", "");
}
/*
 * Called from view when we click tree node of room level
 */
function onRmNodeClick(){
	onBooked(true,false,true,true);
	View.controllers.get('abHotelController').setRegionSize('nested_center','center', 30);
	View.controllers.get('abHotelController').setRegionSize('nested_center','south',100);
	View.panels.get('abHotelDrawingPanel').show(true);
	View.panels.get('abHotelRmGrid').show(true);
    var currentNode = View.panels.get('abHotelBlTree').lastNodeClicked;
    var blId = currentNode.parent.parent.data['bl.bl_id'];
    var flId = currentNode.parent.data['fl.fl_id'];
    var rmId = currentNode.data['rm.rm_id'];
    
    setRestrictionParameter();
    var abHotelDrawingPanel = View.panels.get('abHotelDrawingPanel');
	
    View.dataSources.get('abHotelRmHighlightDS').addParameter('startDateRes', View.controllers.get('abHotelController')['startDateRes']);
	View.dataSources.get('abHotelRmHighlightDS').addParameter('endDateRes', View.controllers.get('abHotelController')['endDateRes']);
	View.dataSources.get('abHotelRmHighlightDS1').addParameter('dvIdRes', View.controllers.get('abHotelController')['rmpctDvIdRes']);
	View.dataSources.get('abHotelRmHighlightDS1').addParameter('dpIdRes', View.controllers.get('abHotelController')['rmpctDpIdRes']);
	
    var currentNode = View.panels.get('abHotelBlTree').lastNodeClicked;
    var blId = currentNode.parent.parent.data['bl.bl_id'];
    var flId = currentNode.parent.data['fl.fl_id'];
    var rmId = currentNode.data['rm.rm_id'];
    var title = String.format(getMessage('drawTitle') + ' ' + blId + '-' + flId + '-' + rmId);
    displayFloor(abHotelDrawingPanel, currentNode, title, false);
	
	//refresh the details panel below code
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rmpct.bl_id", blId, "=");
    restriction.addClause("rmpct.fl_id", flId, "=");
    restriction.addClause("rmpct.rm_id", rmId, "=");
    var abHotelRmGrid = View.panels.get('abHotelRmGrid');
    abHotelRmGrid.addParameter('startDateRes', View.controllers.get('abHotelController')['startDateRes']);
    abHotelRmGrid.addParameter('endDateRes', View.controllers.get('abHotelController')['endDateRes']);
	abHotelRmGrid.addParameter('dvIdRes', View.controllers.get('abHotelController')['rmpctDvIdRes']);
    abHotelRmGrid.addParameter('dpIdRes', View.controllers.get('abHotelController')['rmpctDpIdRes']);
    abHotelRmGrid.clear();
    abHotelRmGrid.refresh(restriction);
}

/*
 * show or hidden the panel
 * 
 * @param {Object} param1
 * @param {Object} param2
 * @param {Object} param3
 * @param {Object} param4
 */
function onBooked(param1,param2,param3,param4){
	
    View.panels.get('abHotelBlTree').show(param1);
	View.panels.get('abHotelBlTree1').show(param2);
	//change to fix KB3028798
	View.panels.get('abHotelDrawingPanel').show(true);
	View.panels.get('abHotelRmGrid').show(param4);
}

/*
 * Load drawing when we click tree code in the level room
 */
function displayFloor(drawingPanel, currentNode, title, isFlTag){
    var blId = '';
    var flId = '';
    var rmId = '';
    var dwgName = '';
    if (isFlTag) {
        blId = currentNode.parent.data['bl.bl_id'];
        flId = currentNode.data['fl.fl_id'];
        dwgName = currentNode.data['fl.dwgname'];
    }
    else {
        blId = currentNode.parent.parent.data['bl.bl_id'];
        flId = currentNode.parent.data['fl.fl_id'];
        rmId = currentNode.data['rm.rm_id'];
        dwgName = currentNode.data['rm.dwgname'];
    }
	
    drawingPanel.clear();
	
    var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, rmId, dwgName);
    drawingPanel.addDrawing(dcl);
    // add the title of panel
    drawingPanel.appendInstruction("default", "", title);
    drawingPanel.processInstruction("default", "");
}

//update the tree label after getnerating the tree node
function afterGeneratingTreeNode(treeNode){
    
    if (treeNode.level.levelIndex == 1) {
        var flId = treeNode.data['fl.fl_id'];
        var name = treeNode.data['fl.name'];
        var dwgname = treeNode.data['fl.dwgname'];
			var labelText1 = "";
            labelText1 = "<span class='" + treeNode.level.cssPkClassName + "'>" +flId + "</span> ";
			labelText1=labelText1+"<span class='" + treeNode.level.cssPkClassName + "'>" +name + "</span>";
			labelText1=labelText1+"<span class='" + treeNode.level.cssPkClassName + "'>" +dwgname + "</span>";
			treeNode.label
            treeNode.setUpLabel(labelText1);
    }
    
    if (treeNode.level.levelIndex == 2) {
        var rmId = treeNode.data['rm.rm_id'];
        var dwgname = treeNode.data['rm.dwgname'];
	    var labelText = "";       
         labelText = "<span class='" + treeNode.level.cssPkClassName + "'>" +rmId + "</span> ";
		 labelText=labelText+"<span class='" + treeNode.level.cssPkClassName + "'>" +dwgname + "</span>";
       	 treeNode.setUpLabel(labelText);
    }
}

function resetDrawingPanel(){
    var drawingPanel = View.panels.get('abHotelDrawingPanel');
    drawingPanel.clear();
    drawingPanel.appendInstruction("default", "", getMessage('drawTitle1'));
    drawingPanel.processInstruction("default", "");
}

function afterChangeBookedFlag(){
    onBooked(false,false,false,false);
	resetDrawingPanel();
}
