
var mainController = View.createController('mainController', {
	//for open pop-up
	isReport: true,
	// console restriction.
	consoleRestriction:'',
	
	nullValueCode: 'NULLVALUE',
	/**
	 * set controller property values after view initialized.
	 */
	afterViewLoad : function() {
		controllerConsole.controllers.push(mainController);
		this.abCompRptHlBlRm_drawingPanel.appendInstruction("default", "", getMessage('drawingPanelTitle2'));
	},
	
	
	/**
	 * Refresh tree by console causes.
	 */
	refreshFromConsole:function(){
		this.generateConsoleRestriction();
		//1 refresh tree when we click console show button.
		this.refreshTree();
		
	},
	
	/**
	 * View details of row record.
	 */
	abCompRptHlBlRmGrid_onView: function(row){
		
		var grid = this.abCompRptHlBlRmGrid;
    	var row = grid.rows[grid.selectedRowIndex];
    	var regulation =row['regloc.regulation'];
    	var reg_program = row['regloc.reg_program'];
    	var reg_requirement = row['regloc.reg_requirement'];
    	
        var restriction = new Ab.view.Restriction();
        if(reg_requirement){
        		restriction = {
        			'regrequirement.regulation': regulation,
        			'regrequirement.reg_program': reg_program,
        			'regrequirement.reg_requirement': reg_requirement
        		};
        		Ab.view.View.openDialog('ab-comp-rpt-requirement-form.axvw', restriction, false, 0, 0, 1100, 500);  
        }else if(reg_program&&reg_requirement==''){
        	restriction = {
        			'regprogram.regulation': regulation,
        			'regprogram.reg_program': reg_program
        		};
        	Ab.view.View.openDialog('ab-comp-rpt-program-form.axvw', restriction, false, 0, 0, 800, 400);  
        }
		
	},
	
	
	/**
	 * EventHandler load drawing when we click tree floor.
	 */
	onTreeflClick : function(){
		
		  var drawingPanel = View.panels.get('abCompRptHlBlRm_drawingPanel');
		    var currentNode = View.panels.get('abCompRptHlBlRm_blTree').lastNodeClicked;
		    var blId = currentNode.parent.data['bl.bl_id'];
		    var flId = currentNode.data['fl.fl_id'];
		    var title = String.format(getMessage('drawingPanelTitle2')+" "+ blId + "-" + flId);
		    
		    this.abCompRptHlBlRm_dsDrawingRmHighlight.addParameter('rmRes',  mainController.consoleRestriction);
		    displayFloor(drawingPanel, currentNode, title);
		    this.abCompRptHlBlRmGrid.addParameter('rpcRes',mainController.consoleRestriction);
		    
		    var restriction = new Ab.view.Restriction();
				restriction.addClause('compliance_locations.bl_id', blId, '=');
				restriction.addClause('compliance_locations.fl_id', flId, '=');
				
		    this.abCompRptHlBlRmGrid.refresh(restriction);
	},
	
	/** 
	 * Step1 1 Refresh tree  level when we click console show button.
	 */
	refreshTree:function(){
		var tree=this.abCompRptHlBlRm_blTree;
		
		var connectClause="";
		
		connectClause=" ctry on ctry.ctry_id=compliance_locations.ctry_id  ";
		tree.addParameter('ctryCustomSql', this.getLocationTreeSql(mainController.consoleRestriction,connectClause));
		
		connectClause=" regn on regn.regn_id=compliance_locations.regn_id AND regn.ctry_id=compliance_locations.ctry_id    ";
		tree.addParameter('regnCustomSql',this.getLocationTreeSql(mainController.consoleRestriction,connectClause));
		
		connectClause=" state on state.state_id=compliance_locations.state_id AND   state.regn_id=compliance_locations.regn_id  ";
		tree.addParameter('stateCustomSql',this.getLocationTreeSql(mainController.consoleRestriction,connectClause));
		
		connectClause=" city on city.city_id=compliance_locations.city_id AND city.state_id=compliance_locations.state_id ";
		tree.addParameter('cityCustomRes',this.getLocationTreeSql(mainController.consoleRestriction,connectClause));
		
		connectClause="  site on site.site_id=compliance_locations.site_id  ";
		tree.addParameter('siteCustomRes',this.getLocationTreeSql(mainController.consoleRestriction,connectClause));
		
		connectClause=" property on property.pr_id=compliance_locations.pr_id  ";
		tree.addParameter('propertyCustomRes',this.getLocationTreeSql(mainController.consoleRestriction,connectClause));
		
		connectClause=" bl on bl.bl_id=compliance_locations.bl_id  ";
		tree.addParameter('blCustomRes',this.getLocationTreeSql(mainController.consoleRestriction,connectClause));
		
		//Because the datasource is self define ,we use rm replace fl for getting dwgname .
		connectClause="  fl on fl.bl_id=compliance_locations.bl_id AND fl.fl_id=compliance_locations.fl_id  ";
		tree.addParameter('flCustomRes',this.getLocationTreeSql(mainController.consoleRestriction,connectClause));
		tree.refresh();
	},
	
	
	getLocationTreeSql:function(restriction,joinClause){
		var sql=" from regloc left outer 	" +
				" join regulation on regloc.regulation= regulation.regulation " +
				" left join regprogram on  regloc.regulation= regprogram.regulation AND  regloc.reg_program= regprogram.reg_program" +
				" left join regrequirement on regloc.regulation= regrequirement.regulation AND regloc.reg_program= regrequirement.reg_program AND   regloc.reg_requirement= regrequirement.reg_requirement  " +
				" join compliance_locations on regloc.location_id = compliance_locations.location_id " +
				" left join rm on rm.rm_id=compliance_locations.rm_id AND  rm.fl_id=compliance_locations.fl_id  AND rm.bl_id=compliance_locations.bl_id  "+
				" left join JOIN-CLAUSE "+
				" where CONSOLE-RESTRICTION " +
				" AND rm.dwgname IS NOT NULL AND regloc.reg_program IS NOT NULL AND regloc.regulation IS NOT NULL AND " +
				" compliance_locations.bl_id IS NOT NULL AND compliance_locations.fl_id IS NOT NULL AND compliance_locations.rm_id IS NOT NULL " ;
			

		sql = sql.replace(/JOIN-CLAUSE/g,joinClause);
		sql = sql.replace(/CONSOLE-RESTRICTION/g,restriction);
		
		return sql;
	
	},
	
	
	/**
	 * Generate restriction from console for tree and center tabs except
	 */
	generateConsoleRestriction:function(){
		var param=controllerConsole.parameters;

		//regloc.comp_level if not null; else if regloc.reg_requirement is not null then regrequirement.comp_level
		//if not null; else if regloc.regprogram is not null then regprogram.comp_level if not null; else no match.
		//Restriction for tree and center tabs except two tab ,regulation ,program tabs.
		var compLevelForRes=" (( "+param.programLevelNotNull+ " ) or ( "+param.requireLevelNotNull+ " ) or ( "+param.locLevelNotNull+" ))";
		
		//response person
		var respPersonRes=" (( "+param.respPersonForProgram+ " ) or ( "+param.respPersonForRequire+ " ) or ( "+param.respPersonForRegLoc+" ))";
		
		//for vn
		var vnRes="( ( "+param.vnForProgram+ " ) or ( " + param.vnForRequire + " ) or ( " + param.vnForRegLoc + " ) )";
		var orRes=" 1=1 ";
			
		if(compLevelForRes.indexOf('AND')!=-1){
			orRes=" 1=1 AND "+compLevelForRes ;
			
		}
		if(respPersonRes.indexOf('AND')!=-1){
			orRes=orRes+ " AND "+respPersonRes;
		}
		
		if(vnRes.indexOf('AND')!=-1){
			orRes=orRes+ " AND "+vnRes;
		}
		
		//from console restriction 
		var res=compLevelForRes+" AND "+param.regulationRes+" AND " +param.regprogramRes +" AND "+param.regRequirementResOnlyForComplianceByLocRes+" AND  ( "+orRes+")";
		
		//from visual field location restriction
		if(View.locationRestriction!=''&&View.locationRestriction!=undefined){
			res=" 1=1 "+View.locationRestriction+" AND "+res;
    	}

		
		mainController.consoleRestriction=res;
	}
});
/**
 * get value from tree node
 * @param {Object} treeNode
 * @param {String} fieldName
 */
function getValueFromTreeNode(treeNode, fieldName){
    var value = null;
    if (treeNode.data[fieldName]) {
        value = treeNode.data[fieldName];
        return value;
    }
    if (treeNode.parent.data[fieldName]) {
        value = treeNode.parent.data[fieldName];
        return value;
    }
    if (treeNode.parent.parent.data[fieldName]) {
        value = treeNode.parent.parent.data[fieldName];
        return value;
    }
    if (treeNode.parent.parent.parent.data[fieldName]) {
        value = treeNode.parent.parent.parent.data[fieldName];
        return value;
    }
    return value;
}

/**
 * display floor drawing for highlight report
 * @param {Object} drawingPanel
 * @param {Object} res
 * @param {String} title
 */
function displayFloor(drawingPanel, currentNode, title){
    var blId = getValueFromTreeNode(currentNode, 'bl.bl_id');
    var flId = getValueFromTreeNode(currentNode, 'fl.fl_id');
    var dwgName = getValueFromTreeNode(currentNode, 'fl.dwgname');
    //if the seleted floor is same as the current drawing panel, just reset the highlight
    if (drawingPanel.lastLoadedBldgFloor == dwgName) {
        drawingPanel.clearHighlights();
        drawingPanel.applyDS('highlight');
    }
    else {
        var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, dwgName);
        drawingPanel.addDrawing(dcl);
        drawingPanel.lastLoadedBldgFloor = dwgName;
    }
    
    drawingPanel.appendInstruction("default", "", title);
    drawingPanel.processInstruction("default", "");
}


function afterGeneratingTreeNode(node){
	var label = node.label;
	var controller = View.controllers.get('mainController');
	var levelIndex = node.level.levelIndex;
	var msg_id = '';
	if(levelIndex == 0){
		msg_id = 'msg_no_ctry_id';
	}else if(levelIndex == 1){
		msg_id = 'msg_no_regn_id';
	}else if(levelIndex == 2){
		msg_id = 'msg_no_state_id';
	}else if(levelIndex == 3){
		msg_id = 'msg_no_city_id';
	}else if(levelIndex == 4){
		msg_id = 'msg_no_site_id';
	}else if(levelIndex == 5){
		msg_id = 'msg_no_property_id';
	}
	
	if(label.indexOf(controller.nullValueCode)!= -1){
		var labelText = label.replace(controller.nullValueCode, getMessage(msg_id));
		node.setUpLabel(labelText);
	}
}
