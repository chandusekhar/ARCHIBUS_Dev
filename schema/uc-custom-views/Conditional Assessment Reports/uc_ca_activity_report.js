EXPAND_ALL_TEXT  = "&#187; Expand All";
COLLAPSE_ALL_TEXT = "&#187; Collapse All";

var ucCaActivityReportController = View.createController('ucCaActivityReportCntr', {
	blId: null,
	vnId:"",
	vnComp:"",
	expandList:"",
	row1param:"",
	row2param:"",
	row3param:"",
	
	afterViewLoad: function() {
		this.wpPanelExport.show(false);
		this.inherit();
		this.createWRCellContent(this.wpPanel, "eq.state");
		
		//this.wpPanel.addParameter("row1_param", " WHERE 1=2 ");
		//this.wpPanel.addParameter("row2_param", " WHERE 1=2 ");
		//this.wpPanel.addParameter("row3_param", " WHERE 1=2 ");
		
		//this.wpPanel.refresh();
	},
	
	afterInitialDataFetch: function() {
 		var lastMonth = new Date();
		var today = new Date();
		var dd = today.getDate();
		var mm = today.getMonth() +1;
		var mm1 = today.getMonth();
		
		var yyyy = today.getFullYear();
		var yyyy1 = today.getFullYear();
		if(dd<10){dd='0'+dd} 
		if(mm<10){
			mm='0'+mm
		} 
		today = mm+'/'+dd+'/'+yyyy; 
		if (mm1==0) {
			mm1=12
			yyyy1--
		}
		else if(mm1<10){
			mm1='0'+mm1
		} 
		lastMonth = mm1+'/'+dd+'/'+yyyy1;

		
		//var row1param = " WHERE 1=2 ";
		//var row2param = " WHERE 1=2 "
		//var row3param = " WHERE 1=2 "
		//this.wpPanel.addParameter("row1_param", row1param);
		//this.wpPanel.addParameter("row2_param", row2param);
		//this.wpPanel.addParameter("row3_param", row3param);
		
		//this.wpPanelExport.addParameter("row1_param", row1param);
		//this.wpPanelExport.addParameter("row2_param", row2param);
		//this.wpPanelExport.addParameter("row3_param", row3param);
		
		//this.wpPanel.refresh();
		
		this.wpConsole.setFieldValue("date_requested.from", lastMonth);
		this.wpConsole.setFieldValue("date_requested.to", today);
		//this.wpConsole.setFieldValue("eq.eq_std", 'PVARX-XXXX-XXXXX');
		
		for (i = 0; i < $('eq.status').length; i++) {
			if(	$('eq.status')[i].value == 'in') {
				$('eq.status')[i].selected = true;
				break;
			}
		}
		//this.wpConsole_onSearch(); 
	}, 
	
	
    wpConsole_onSearch: function() {
		this.expandList="";
		var aiCode = '';
		var wrId = '';
		var blId = '';
		var flId = '';
		var rmId = '';
		var status = '';
		var trId = '';
		var eqId = '';
		var dateRequestedFrom = '';
		var dateRequestedTo = '';
		var probType = '';
		var eqStd = '';
		var dateCompletedFrom ='';
		var dateCompletedTo= '';
		
		row1param = '';
		row2param = '';
		row3param = '';
		
		/*
		if (this.wpConsole.getFieldValue('eq.eq_std') == '' 
				&& this.wpConsole.getFieldValue('wrhwr.tr_id') === '' 
				&&  this.wpConsole.getFieldValue('eq.option2') == '' 
				&& this.wpConsole.getFieldValue('wrhwr.prob_type') == '' 
				&& this.wpConsole.getFieldValue('wrhwr.bl_id') == '' 
				&& this.wpConsole.getFieldValue('wrhwr.fl_id') == '' 
				&& this.wpConsole.getFieldValue('wrhwr.rm_id') == '' 
				&& this.wpConsole.getFieldValue('date_assigned.to') == '' 
				&& this.wpConsole.getFieldValue('date_assigned.from') == '' 
				&& this.wpConsole.getFieldValue('date_completed.from') == '' 
				&& this.wpConsole.getFieldValue('date_completed.to') == '') {
						View.showMessage("At least one field is required in the filter.");
						return false;
		}
		*/
		
		if (this.wpConsole.getFieldValue('eqstd.ai_id') != '') {
			aiCode = this.wpConsole.getFieldValue('eqstd.ai_id');
			row1param = row1param+ " and eqstd.ai_id like '"+ aiCode +"%'";
			row2param = row2param+ " and eqstd.ai_id like '"+ aiCode +"%'";
			row3param = row3param+ " and eqstd.ai_id like '"+ aiCode +"%'";
		}
		
		if (this.wpConsole.getFieldValue('eq.status') != '') {
			status = this.wpConsole.getFieldValue('eq.status');
			row1param = row1param+ " and e.status = '"+ status +"'";
			row2param = row2param+ " and eq.status = '"+ status +"'";
			row3param = row3param+ " and eq.status = '"+ status +"'";
		}
		
		if (this.wpConsole.getFieldValue('wrhwr.bl_id') != '') {
			blId = this.wpConsole.getFieldValue('wrhwr.bl_id');
			row1param = row1param+ " and e.bl_id = '"+ blId +"'";
			row2param = row2param+ " and eq.bl_id = '"+ blId +"'";
			row3param = row3param+ " and eq.bl_id = '"+ blId +"'";
		}
		
		if (this.wpConsole.getFieldValue('wrhwr.fl_id') != '') {
			flId = this.wpConsole.getFieldValue('wrhwr.fl_id');
			row1param = row1param+ " and e.fl_id = '"+ flId +"'";
			row2param = row2param+ " and eq.fl_id = '"+ flId +"'";
			row3param = row3param+ " and eq.fl_id = '"+ flId +"'";
		}
		
		if (this.wpConsole.getFieldValue('wrhwr.rm_id') != '') {
			rmId = this.wpConsole.getFieldValue('wrhwr.rm_id');
			row1param = row1param+ " and e.rm_id = '"+ rmId +"'";
			row2param = row2param+ " and eq.rm_id = '"+ rmId +"'";
			row3param = row3param+ " and eq.rm_id = '"+ rmId +"'";
		}
		
		if (this.wpConsole.getFieldValue('wrhwr.tr_id') != '') {
			trId = this.wpConsole.getFieldValue('wrhwr.tr_id');
			row1param = row1param+ " and wrhwr.tr_id = '"+ trId +"'";
			row2param = row2param+ " and wrhwr.tr_id = '"+ trId +"'";
			row3param = row3param+ " and wrhwr.tr_id = '"+ trId +"'";
		}
		
		if (this.wpConsole.getFieldValue('wrhwr.prob_type') != '') {
			probType = this.wpConsole.getFieldValue('wrhwr.prob_type');
			row1param = row1param + " and wrhwr.prob_type = '"+ probType +"'";
			row2param = row2param + " and wrhwr.prob_type = '"+ probType +"'";
			row3param = row3param + " and wrhwr.prob_type = '"+ probType +"'";
		}
		
		if (this.wpConsole.getFieldValue('eq.eq_std') != '') {
			eqStd = this.wpConsole.getFieldValue('eq.eq_std');
			row1param = row1param + " and e.eq_std like '"+ eqStd +"%'";
			row2param = row2param + " and eq.eq_std like '"+ eqStd +"%'";
			row3param = row3param + " and eq.eq_std like '"+ eqStd +"%'";
		}
		
		if (this.wpConsole.getFieldValue('date_requested.from') != '' && this.wpConsole.getFieldValue('date_requested.to') == '') {
			View.showMessage("Date Issued From and Date Issued To are required.");
			return false;
		}
		if (this.wpConsole.getFieldValue('date_requested.from') == '' && this.wpConsole.getFieldValue('date_requested.to') != '') {
			View.showMessage("Date Issued From and Date Issued To are required.");
			return false;
		}
		
		if (this.wpConsole.getFieldValue('date_completed.from') != '' && this.wpConsole.getFieldValue('date_completed.to') == '') {
			View.showMessage("Date Assigned From and Date Assigned To are required.");
			return false;
		}
		if (this.wpConsole.getFieldValue('date_completed.from') == '' && this.wpConsole.getFieldValue('date_completed.to') != '') {
			View.showMessage("Date Assigned From and Date Assigned To are required.");
			return false;
		}
		
		if (this.wpConsole.getFieldValue('date_requested.from') == '' && this.wpConsole.getFieldValue('date_requested.to') == '' &&
			this.wpConsole.getFieldValue('date_completed.from') == '' && this.wpConsole.getFieldValue('date_completed.to') == '') {
			View.showMessage("At least WR date range or FWD date range is required for filtering.");
			return false;
		} 
	
		if (this.wpConsole.getFieldValue('date_requested.from') != '' && this.wpConsole.getFieldValue('date_requested.to') != '') {
			dateRequestedFrom = this.wpConsole.getFieldValue('date_requested.from');
			dateRequestedTo = this.wpConsole.getFieldValue('date_requested.to');
			row1param = row1param+ " and wrhwr.date_requested between '"+dateRequestedFrom
				+ "' and '" +dateRequestedTo+ "'";
			row2param = row2param+ " and wrhwr.date_requested between '"+dateRequestedFrom
				+ "' and '" +dateRequestedTo+ "'";
			row3param = row3param+ " and wrhwr.date_requested between '"+dateRequestedFrom
				+ "' and '" +dateRequestedTo+ "'";
		} 
		
		if (this.wpConsole.getFieldValue('date_completed.from') != '' && this.wpConsole.getFieldValue('date_completed.to') != '') {
			dateCompletedFrom = this.wpConsole.getFieldValue('date_completed.from');
			dateCompletedTo = this.wpConsole.getFieldValue('date_completed.to');
			row1param = row1param+ " and wrhwr.date_completed between '"+dateCompletedFrom
				+ "' and '" +dateCompletedTo+ "'";
			row2param = row2param+ " and wrhwr.date_completed between '"+dateCompletedFrom
				+ "' and '" +dateCompletedTo+ "'";
			row3param = row3param+ " and wrhwr.date_completed between '"+dateCompletedFrom
				+ "' and '" +dateCompletedTo+ "'";
		} 
		
		if (this.wpConsole.getFieldValue('eq.condition') != '') {
			cond = this.wpConsole.getFieldValue('eq.condition');
			row1param = row1param + " and e.condition = '"+ cond +"'";
			row2param = row2param + " and eq.condition = '"+ cond +"'";
			row3param = row3param + " and eq.condition = '"+ cond +"'";
		}

		var panel = this.wpPanel;
		btn = panel.actions.get("expandAll").button;
		btn.setText(EXPAND_ALL_TEXT);
		this.collapseAll(panel,"eq.state");	
		this.wpPanel.addParameter("row1_param", row1param);
		this.wpPanel.addParameter("row2_param", row2param);
		this.wpPanel.addParameter("row3_param", row3param);
		
	//	this.wpPanelExport.addParameter("row1_param", row1param);
	//	this.wpPanelExport.addParameter("row2_param", row2param);
	//	this.wpPanelExport.addParameter("row3_param", row3param);
		
		this.wpPanel.refresh();
	//	this.wpPanelExport.show(false);
		
		var panel = this.wpPanel,
		btn = panel.actions.get("expandAll").button;
		this.collapseAll(panel,"eq.state");	
		btn.setText(EXPAND_ALL_TEXT);
	},
	
	exportgrid:function(expandedStream){
		var param = "";
		//Condition#1 - List is expanded
		
		this.wpPanelExport.addParameter("row1_param", row1param);
		this.wpPanelExport.addParameter("row2_param", row2param);
		this.wpPanelExport.addParameter("row3_param", row3param);
		
		if (this.expandList != "") {
		
			param ="(s2=1 or s1 in (" + this.expandList + "''))";
			if (expandedStream) {
				param ="(s1 in (" + this.expandList + "''))";
			}
		}
		//Condition#2 - List is not expanded and XLS Expanded Streams is selected
		else if (expandedStream && this.expandList == "") {
			alert("No Expanded Streams to Export")
			return false;
		} 
		//Condition#3 - List is not expanded and XLS Expanded Stream is not selected
		else if (!expandedStream && this.expandList == "") {
			this.wpPanelExport.addParameter("row2_param", " AND 1=2 ");
			this.wpPanelExport.addParameter("row3_param", " AND 1=2 ");
		}
		
		
		
/* 		if (this.expandList == "") {
			this.wpPanelExport.addParameter("row2_param", " AND 1=2 ");
			this.wpPanelExport.addParameter("row3_param", " AND 1=2 ");
		} */
		
		this.wpPanelExport.refresh(param);
		this.wpPanelExport.show(false,true)
		
	},
	
	
	
	wpConsole_onClearSearch: function() {
		this.wpConsole.setFieldValue("bill.bill_type_id", "");
		//this.wpConsole.setFieldValue("date_issued.from", "");
		this.wpConsole.setFieldValue("date_issued.to", "");
		if (this.vnId == ""){this.wpConsole.setFieldValue("company", "");}
		this.wpConsole.setFieldValue("loc_id", "");
		
		var today = new Date();
		var today1 = new Date();
		var dd = today.getDate();
		var mm = today.getMonth();
		var mm1 = today.getMonth()+1;
		
		var yyyy = today.getFullYear();
		if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm} today = mm+'/'+dd+'/'+yyyy;
		if(dd<10){dd='0'+dd} if(mm1<10){mm1='0'+mm1} today1 = mm1+'/'+dd+'/'+yyyy;
		
		for (i = 0; i < $('eq.status').length; i++) {
			if(	$('eq.status')[i].value == 'in') {
				$('eq.status')[i].selected = true;
				break;
			}
		}
		
		this.wpConsole.setFieldValue("date_requested.from", today);
		this.wpConsole.setFieldValue("date_requested.to", today1);
	},
	
	
	createWRCellContent : function(panel, stateField){
		var me = this;
		panel.afterCreateCellContent = function(row, col, cellElement) {
			var state = row[(stateField || "activity_log.state")], link;
					
			if ((row["eq.s2"] == "2" || row["eq.s2"] == "3") && col.id == "eq.eq_id") {
				var rowVal = cellElement.innerHTML;
				rowVal = rowVal.replace(/<a\b[^>]*>/i,"");
				rowVal = rowVal.replace(/<\/a>/i, "");
				cellElement.innerHTML = rowVal;
			}
			
			 if (col.id === "assign" && (state == "sub-title" || state === "") ) {
				cellElement.style.visibility = "hidden";
			 }
            if (col.id === "changeState") {
                if(state === ""  || state == "View" || state == "sub-title"){
					if (me.expandList == me.expandList.replace("'" + row["eq.s1"].replace(/'/g,"''") + "',","")){
						row.row.dom.style.display = "none";
					}
					if(state == "View"){
						row.row.dom.style.cssText += ";background:#E0E0E0;font-weight:bold;";
						//row.row.dom.style.cssText += ";background:#E0E0E0;font-weight:bold;text-align:center;";
					}else{
						cellElement.style.visibility = "hidden";
					}
                }
                else{
					if (state == "+" && me.expandList != me.expandList.replace("'" + row["eq.s1"].replace(/'/g,"''") + "',","")){
						row[stateField] = "-";
						state = "-";
					}
					
				    me.configureGridBtn(state, cellElement);
				    row.row.dom.style.cssText += ";background:#CCCCCC;font-weight:bold;";
				    Ext.get(cellElement).dom.style.cssText += "text-align:center;";
                }
            }else if(state == "sub-title"){
				//link = Ext.get(cellElement).child("a");
				//if(link){
					//link.dom.style.cssText += ";text-decoration:none;color:black;cursor:text;";
					
				//}
				row.row.dom.style.cssText += ";background:#E0E0E0;color:blue;font-weight:bold;text-align:center;";
				//row.row.dom.style.cssText += ";background:lightblue;font-weight:bold;text-align:center;";
				cellElement.style.textAlign = "left";
			}else if(state === "" || state == "sub-title"){
				row.row.dom.style.display = "none";
			}
		/*//	 code to add + button on Bill row to then show Bill_Lines
			 if (col.id === "bill_type.bill_type_id" && state == "Edit") {
				cellElement.innerHTML = '<img hspace="1" border="0" src="/archibus/schema/uc-custom-views/ES/plus.gif" title="" alt="" id="wpPanel_row0_showLInes" data-state="+">' + cellElement.innerHTML
			}
		*/
        };
	},
	
 	wpPanel_afterRefresh:function(){
		var panel = this.wpPanel;
		panel.removeSorting();
/* 		if(this.allExpanded(panel,"bill_type.state")){
			panel.actions.get("expandAll").button.setText(COLLAPSE_ALL_TEXT);
		}else{
			panel.actions.get("expandAll").button.setText(EXPAND_ALL_TEXT);
		}
		this.showHideExpandBtn(panel); */
	}, 
	
	showHideExpandBtn:function(panel){
		if(!panel.rows.length){
			panel.actions.get("expandAll").button.hide();
		}else{
			panel.actions.get("expandAll").button.show();
		}
	},
	
	allExpanded:function(panel,stateField){
		var bool = true;
		for(var i = 0, j = panel.rows.length; i<j; i++){
				row = panel.rows[i];
				if(row[stateField] === "+"){
					bool = false;
				}
		}
		return bool;
	},
	
	wpPanel_onExpandAll:function(row){
		var panel = this.wpPanel,
			btn = panel.actions.get("expandAll").button;
		if(btn.text == EXPAND_ALL_TEXT){
			this.expandAll(panel,"eq.state");
			btn.setText(COLLAPSE_ALL_TEXT);
		}else if(btn.text == COLLAPSE_ALL_TEXT){
			this.collapseAll(panel,"eq.state");	
			btn.setText(EXPAND_ALL_TEXT);
		}	
	},
	
	expandAll:function(panel, stateField, exist){
		var i, j, row, row2, hasValue = true;
		for(i = 0, j = panel.rows.length; i<j; i++){
			row = panel.rows[i].row;
			if(exist){
				hasValue = (row.record[exist] != 0);
			}
			if(row.record[stateField] !== "" && row.record[stateField] !== "sub-title" && row.record[stateField] !== "View" && row.record[stateField] !== "Edit" && row.record[stateField] !== "Nonedit" && hasValue) { 
				row.record[stateField] = "hide";
				if (panel.rows.length -1 > i) {
					row2 = panel.rows[i+1].row;
					if(row.record["eq.s1"]==row2.record["eq.s1"]) {
						row.record[stateField] = "+";
					}
					
				}

				this.expandCollapseGrid(panel, row, stateField);
			}
		}
	},
	
	collapseAll:function(panel, stateField, exist){
		var i, j, row, row2, hasValue = true;
		this.expandList="";
		for(i = 0, j = panel.rows.length; i<j; i++){
			row = panel.rows[i].row;
			if(exist){
				hasValue = (row.record[exist] != 0);
			}			
			if(row.record[stateField] !== "" && row.record[stateField] !== "sub-title" && row.record[stateField] !== "View" && row.record[stateField] !== "Edit" && row.record[stateField] !== "Nonedit" && hasValue){
				row.record[stateField] = "hide";
				if (panel.rows.length -1 > i) {
					row2 = panel.rows[i+1].row;
					if(row.record["eq.s1"]==row2.record["eq.s1"]) {
						row.record[stateField] = "-";
					}
					
				}
				
				this.expandCollapseGrid(panel, row, stateField);
			}
		}
	},
	
	wpPanel_onChangeState:function(row) {
		var panel =this.wpPanel;
		var state = row.record["eq.state"];
		var e = Ext.get(row.cells.items[0].dom);
		var record = panel.rows[panel.selectedRowIndex-1];
		if(state !== "View" && state != "sub-title" &&  state !=="" && state !=="Edit" && state !=="Nonedit"){
			this.expandCollapseGrid(this.wpPanel,row,"eq.state");
		} else if (state == "View") {
 			var rowIndex = this.wpPanel.selectedRowIndex;
			var wrId = this.wpPanel.rows[rowIndex]["eq.eq_id"];
			var vw = 'wrdetails.axvw'
			View.openDialog(vw, {'wrhwr.wr_id':wrId}, false, {
				width: 850,
				height: 750,
				closeButton: true,
				mode: 'editRecord'
			}); 
		}
	},
		
	expandCollapseGrid : function(grid, row, stateField){
		var recordIndex = row.record.index,gridRow,
			state = row.record[stateField], 
			btnCell = grid.multipleSelectionEnabled ? row.cells.items[1].dom : row.cells.items[0].dom;
			//btnCell = grid.multipleSelectionEnabled ? row.cells.items[0].dom : row.cells.items[1].dom;
		for(var i = recordIndex + 1, j=grid.rows.length; i < j; i++){
			gridRow = grid.rows[i];
			if(gridRow[stateField] !== "" && gridRow[stateField] !== "View" && gridRow[stateField] !== "sub-title" && gridRow[stateField] !== "Edit" && gridRow[stateField] !== "Nonedit" ){
				break;
			}
			if(state === "-"){
				//Remove item from list
				this.expandList = this.expandList.replace("'" + row.record["eq.eq_id"].replace(/'/g,"''") + "',","")  
				gridRow.row.dom.style.display = "none";
			}else{
				//Add item to list
				this.expandList += "'" +row.record["eq.eq_id"].replace(/'/g,"''") + "',"
				gridRow.row.dom.style.display ="";
			}
		}
		if(state === "-"){
			grid.rows[recordIndex][stateField]  = "+";
			this.configureGridBtn("+",btnCell);
		}else if (state === "hide"){
			grid.rows[recordIndex][stateField]  = "hide";
			this.configureGridBtn("hide",btnCell);
		} else {
			grid.rows[recordIndex][stateField]  = "-";
			this.configureGridBtn("-",btnCell);
		}
	},
	
	configureGridBtn:function(state, cellElement){
		var btn = Ext.get(cellElement).child("img").dom;
		var isIE = /*@cc_on!@*/false;
			if(btn){
				//var image =((state === "+") ? "plus.gif" : "minus.gif");
				var image = '';
				if (state == "+") {image = "/archibus/schema/uc-custom-views/ES/plus.gif"} 
				else if (state == "-") {image = "/archibus/schema/uc-custom-views/ES/minus.gif"} 
				else if (state =="hide") {image = "/archibus/schema/uc-custom-views/ES/blank.gif"} 
				else if (state == "Edit") {image = "/archibus/schema/uc-custom-views/ES/edit.gif"} 
				else if (state =="View") {image = "/archibus/schema/uc-custom-views/ES/blank.gif"}
				btn.setAttribute("data-state",state);
				btn.setAttribute("src",image);
				cellElement.setAttribute("data-state",state);
				cellElement.style.cssText+=";width:18px;";
			}
		return this;
	},
	
   selectEqstd: function(commandObject){
		var filterVal = "";
		var form = commandObject.getParentPanel();
		
		if (form.getFieldValue("eq.eq_std") != '') {
			var filterVal = "eq.eq_std like '" + form.getFieldValue("eq.eq_std") + "%'";
		}
		
		View.selectValue(form.id, 'Select Equipment Standard',['eq.eq_std'], 
			  'eq', [ 'eq.eq_std'], 
			  ['eq.eq_std'],
			  filterVal, "", false);
   
   },
   
selectAiId: function(commandObject){
		var filterVal = "";
		var form = commandObject.getParentPanel();
		
		if (form.getFieldValue("eqstd.ai_id") != '') {
			var filterVal = "eqstd.ai_id like '" + form.getFieldValue("eqstd.ai_id") + "%'";
		}
		
		View.selectValue(form.id, 'Select AI Code',['eqstd.ai_id'], 
			  'eqstd', [ 'eqstd.ai_id'], 
			  ['eqstd.ai_id'],
			  filterVal, "", false);
   
   }
});

function openEquipmentDetails() {
	var wpPanel = View.panels.get("wpPanel");
	var rowIndex = wpPanel.selectedRowIndex;
	var eqId = wpPanel.rows[rowIndex]["eq.eq_id"];
	var vw = 'eqdetails.axvw'
	View.openDialog(vw, {'eq.eq_id':eqId}, false, {
		width: 850,
		height: 750,
		closeButton: true,
		mode: 'editRecord'
	}); 
}