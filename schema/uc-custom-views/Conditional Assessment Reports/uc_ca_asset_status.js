var ucCaAssetStatusController = View.createController('ucCaAssetStatusCntr', {

	afterViewLoad: function() {
	/* 	var lov = document.getElementById("wpConsole.asset_age.from_selectValue");
		lov.style.display="none";
		
		var lov2 = document.getElementById("wpConsole.asset_age.to_selectValue");
		lov2.style.display="none"; */
		
		prevNextafterViewLoad(this.wpPanel,"25,50,100,200","50");
		
		
	},
	
	afterInitialDataFetch: function() {
		this.wpConsole.fields.get("asset_age.from").fieldDef.defaultValue=null
		this.wpConsole.fields.get("asset_age.to").fieldDef.defaultValue=null
/*  		var lastMonth = new Date();
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
		
		this.wpConsole.setFieldValue("date_assigned.from", lastMonth);
		this.wpConsole.setFieldValue("date_assigned.to", today); */
		
		/* this.wpConsole_onSearch();  */
		
		
		for (i = 0; i < $('eq.status').length; i++) {
			if(	$('eq.status')[i].value == 'in') {
				$('eq.status')[i].selected = true;
				break;
			}
		}
		
		
	}, 
	
	
    wpConsole_onSearch: function() {
		var wrId = '';
		var blId = '';
		var flId = '';
		var rmId = '';
		var dateInstall = '';
		var status = '';
		var eqId = '';
		var cond = '';
		var eqStd = '';

		var dateInstallFrom = '';
		var dateInstallTo= '';
		var assetAgeFrom = '';
		var assetAgeTo = '';
		var retiredFrom ='';
		var retiredTo= '';
		
		var row1param = '1=1';
/* 		
		if (this.wpConsole.getFieldValue('eq.eq_std') == '' 
				&& this.wpConsole.getFieldValue('wr.tr_id') === '' 
				&&  this.wpConsole.getFieldValue('eq.option2') == '' 
				&& this.wpConsole.getFieldValue('wr.prob_type') == '' 
				&& this.wpConsole.getFieldValue('wr.bl_id') == '' 
				&& this.wpConsole.getFieldValue('wr.fl_id') == '' 
				&& this.wpConsole.getFieldValue('wr.rm_id') == '' 
				&& this.wpConsole.getFieldValue('date_assigned.to') == '' 
				&& this.wpConsole.getFieldValue('date_assigned.from') == '' 
				&& this.wpConsole.getFieldValue('date_completed.from') == '' 
				&& this.wpConsole.getFieldValue('date_completed.to') == '') {
						View.showMessage("At least one field is required in the filter.");
						return false;
		} */
		
		if (this.wpConsole.getFieldValue('eq.bl_id') != '') {
			blId = this.wpConsole.getFieldValue('eq.bl_id');
			row1param = row1param+ " and eq.bl_id = '"+ blId +"'";
		}
		
		if (this.wpConsole.getFieldValue('eq.fl_id') != '') {
			flId = this.wpConsole.getFieldValue('eq.fl_id');
			row1param = row1param+ " and eq.fl_id = '"+ flId +"'";
		}
		
		if (this.wpConsole.getFieldValue('eq.rm_id') != '') {
			rmId = this.wpConsole.getFieldValue('eq.rm_id');
			row1param = row1param+ " and eq.rm_id = '"+ rmId +"'";
		}
		
		if (this.wpConsole.getFieldValue('date_installed.from') != '' && this.wpConsole.getFieldValue('date_installed.to') == '') {
			View.showMessage("Asset Retired from and to dates are required.");
			return false;
		}
		if (this.wpConsole.getFieldValue('date_installed.from') == '' && this.wpConsole.getFieldValue('date_installed.to') != '') {
			View.showMessage("Asset Retired from and to dates are required.");
			return false;
		} 
		
		if (this.wpConsole.getFieldValue('date_installed.from') != '' && this.wpConsole.getFieldValue('date_installed.to') != '') {
			dateInstallFrom = this.wpConsole.getFieldValue('date_installed.from');
			dateInstallTo = this.wpConsole.getFieldValue('date_installed.to');
			
			row1param = row1param+ " and eq.date_installed >= '"+dateInstallFrom
				+ "' and eq.date_installed <= '" +dateInstallTo+"'";
		} 
		
		if (this.wpConsole.getFieldValue('eq.status') != '') {
			status = this.wpConsole.getFieldValue('eq.status');
			row1param = row1param + " and eq.status = '"+ status +"'";
		}
		
		if (this.wpConsole.getFieldValue('eq.eq_id') != '') {
			eqId = this.wpConsole.getFieldValue('eq.eq_id');
			row1param = row1param + " and eq.eq_id = '"+ eqId +"'";
		}
		
		if (this.wpConsole.getFieldValue('eq.eq_std') != '') {
			eqStd = this.wpConsole.getFieldValue('eq.eq_std');
			row1param = row1param + " and eq.eq_std like '"+ eqStd +"%'";
		}
		
		if (this.wpConsole.getFieldValue('eq.condition') != '') {
			cond = this.wpConsole.getFieldValue('eq.condition');
			row1param = row1param + " and eq.condition = '"+ cond +"'";
		}
		
		if (this.wpConsole.getFieldValue('asset_age.from') != '' && this.wpConsole.getFieldValue('asset_age.to') == '') {
			View.showMessage("Asset Age from and to dates are both required.");
			return false;
		}
		if (this.wpConsole.getFieldValue('asset_age.from') == '' && this.wpConsole.getFieldValue('asset_age.to') != '') {
			View.showMessage("Asset Age from and to dates are both required.");
			return false;
		}
		
		if (this.wpConsole.getFieldValue('asset_retired.from') != '' && this.wpConsole.getFieldValue('asset_retired.to') == '') {
			View.showMessage("Asset Retired from and to dates are required.");
			return false;
		}
		if (this.wpConsole.getFieldValue('asset_retired.from') == '' && this.wpConsole.getFieldValue('asset_retired.to') != '') {
			View.showMessage("Asset Retired from and to dates are required.");
			return false;
		} 
		/* if (this.wpConsole.getFieldValue('date_assigned.to') == '' && this.wpConsole.getFieldValue('date_assigned.to') == '') {
			View.showMessage("Date Issued From and Date Issued To are required.");
			return false;
		} */
	
		if (this.wpConsole.getFieldValue('asset_age.from') != '' && this.wpConsole.getFieldValue('asset_age.to') != '') {
			if (isNaN(this.wpConsole.getFieldValue('asset_age.from')) || isNaN(this.wpConsole.getFieldValue('asset_age.to'))) {
				View.showMessage("The asset from and to fields need to be numeric.");
				return false;
			} else {
				assetAgeFrom = this.wpConsole.getFieldValue('asset_age.from');
				assetAgeTo = this.wpConsole.getFieldValue('asset_age.to');
				
				row1param = row1param+ " and DATEDIFF(mm,eq.date_installed,GETDATE()) >= "+assetAgeFrom
					+ " and DATEDIFF(mm,eq.date_installed,GETDATE()) <= " +assetAgeTo;
			}
		} 
		
		if (this.wpConsole.getFieldValue('asset_retired.from') != '' && this.wpConsole.getFieldValue('asset_retired.to') != '') {
			retiredFrom = this.wpConsole.getFieldValue('asset_retired.from');
			retiredTo = this.wpConsole.getFieldValue('asset_retired.to');
			
			row1param = row1param+ " and (eq.date_in_storage >= '"+retiredFrom+"' AND eq.date_in_storage <= '"+retiredTo+"')" +
									" OR (eq.date_salvaged >= '"+retiredFrom+"' AND eq.date_salvaged <= '"+retiredTo+"')" +
									" OR (eq.date_sold >= '"+retiredFrom+"' AND eq.date_sold <= '"+retiredTo+"')";
		} 

		this.wpPanel.addParameter("PageRest", row1param);
		this.wpPanelExport.addParameter("PageRest", row1param);

		this.wpPanel.refresh();
		
		//var panel = this.wpPanel,
		//btn = panel.actions.get("expandAll").button;
		//this.collapseAll(panel,"eq.state");	
		//btn.setText(EXPAND_ALL_TEXT);
	},
	
	exportgrid:function(expandedStream){
		var param = ""
		if (this.expandList != "") {
		
			param ="(s2=1 or s1 in (" + this.expandList + "''))";
			if (expandedStream) {
				param ="(s1 in (" + this.expandList + "''))";
			}
		}
		else if (expandedStream) {
			alert("No Expanded Streams to Export")
			return false;
		}
		
		//this.wpPanelexport.addParameter("expand_param", param);
		this.wpPanelexport.refresh(param);
		this.wpPanelexport.show(false,true)
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
		var mm = today.getMonth()-1;
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
		
		this.wpConsole.setFieldValue("date_issued.from", today);
		this.wpConsole.setFieldValue("date_issued.to", today1);
	},
	
	
	createWRCellContent : function(panel, stateField){
		var me = this;
		panel.afterCreateCellContent = function(row, col, cellElement) {
			var state = row[(stateField || "eq.wr_view")], link;
/* 			 if (col.id === "assign" && (state == "sub-title" || state === "") ) {
				cellElement.style.visibility = "hidden";
			 }
            if (col.id === "changeState") {
                if(state === ""  || state == "View" || state == "sub-title"){
					if (me.expandList == me.expandList.replace("'" + row["eq.s1"].replace(/'/g,"''") + "',","")){
						row.row.dom.style.display = "none";
					}
					if(state == "View"){
						row.row.dom.style.cssText += ";background:#E0E0E0;font-weight:bold;";
					}else{
						cellElement.style.visibility = "hidden";
					}
                }
                else{
					if (state == "+" && me.expandList != me.expandList.replace("'" + row["eq.s1"].replace(/'/g,"''") + "',","")){
						row[stateField] = "-";
						state = "-";
					} */
					
				    me.configureGridBtn(state, cellElement);
/* 				    row.row.dom.style.cssText += ";background:#CCCCCC;font-weight:bold;";
				    Ext.get(cellElement).dom.style.cssText += "text-align:center;";
                }
            }else if(state == "sub-title"){
				row.row.dom.style.cssText += ";background:#E0E0E0;color:black;font-weight:bold;text-align:center;";
				cellElement.style.textAlign = "left";
			}else if(state === "" || state == "sub-title"){
				row.row.dom.style.display = "none";
			} */
        };
	},
	
	wpPanel_afterRefresh:function(){
/* 		var panel = this.wpPanel;
		panel.removeSorting();
		if(this.allExpanded(panel,"bill_type.state")){
			panel.actions.get("expandAll").button.setText(COLLAPSE_ALL_TEXT);
		}else{
			panel.actions.get("expandAll").button.setText(EXPAND_ALL_TEXT);
		}
		this.showHideExpandBtn(panel); */
	 	var panel = this.wpPanel;
		panel.removeSorting();
		
		prevNext_afterRefresh(this.wpPanel);
	},
	
	wpPanel_onChangeState:function(row) {
		var panel =this.wpPanel;
		var state = row.record["eq.state"];
		var e = Ext.get(row.cells.items[0].dom);
		var record = panel.rows[panel.selectedRowIndex-1];
		if(state !== "View" && state != "sub-title" &&  state !=="" && state !=="Edit" && state !=="Nonedit"){
			this.expandCollapseGrid(this.wpPanel,row,"eq.state");
		} else if (state == "Edit") {
/* 			var rowIndex = this.wpPanel.selectedRowIndex;
			var billId = this.wpPanel.rows[rowIndex]["bill_type.bill_id"];
			var vnId = this.wpPanel.rows[rowIndex]["bill_type.vn_id"];
			var vw = 'uc-es-stream-upd.axvw'
			if (!this.wpConsole.getFieldElement('loc_id')) {vw = 'uc-es-ghg-upd.axvw';}
			View.openDialog(vw, {'bill.bill_id':billId,'bill.vn_id':vnId}, false, {
				width: 850,
				height: 750,
				closeButton: false,
				mode: 'editRecord'
			}); */
		}
			
		
	},
		
	expandCollapseGrid : function(grid, row, stateField){
		var recordIndex = row.record.index,gridRow,
			state = row.record[stateField], 
			btnCell = grid.multipleSelectionEnabled ? row.cells.items[1].dom : row.cells.items[0].dom;
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
				if (state == "+") {image = "/archibus/schema/uc-custom-views/ES/plus.gif"} else if (state == "-") {image = "/archibus/schema/uc-custom-views/ES/minus.gif"} else if (state =="hide") {image = "/archibus/schema/uc-custom-views/ES/blank.gif"} else if (state == "Edit") {image = "/archibus/schema/uc-custom-views/ES/edit.gif"} else if (state =="View") {image = "/archibus/schema/uc-custom-views/ES/blank.gif"}
				btn.setAttribute("data-state",state);
				btn.setAttribute("src",image);
				cellElement.setAttribute("data-state",state);
				cellElement.style.cssText+=";width:18px;";
			}
		return this;
	}
});

function openEquipmentDetails() {
	var wpPanel = View.panels.get("wpPanel");
	var rowIndex = wpPanel.selectedRowIndex;
	var eqId = wpPanel.rows[rowIndex]["eq.eq_id"];
	var vw = 'eqdetails.axvw'
	View.openDialog(vw, {'eq.eq_id':eqId}, false, {
		width: 850,
		height: 400,
		closeButton: false,
		mode: 'editRecord'
	}); 
}

function selectEqId(){
	var rest = ''
	
	var eqStd = View.panels.get("wpConsole").getFieldValue("eq.eq_std");
	if (eqStd != '') { rest = "eq.eq_std like '" + eqStd + "%'"}

	View.selectValue('wpConsole', '',
						['eq.eq_id'],
						'eq',
						['eq.eq_id'],
						['eq.eq_id','eq.eq_std'],
						rest, '', true, true);
}

function selectEqStd(){
	var rest = ''
	
	var eqId = View.panels.get("wpConsole").getFieldValue("eq.eq_id");
	//if (eqId != '') { rest = "eq.eq_id = '" + eqId + "'"} else { rest = "eq.eq_std LIKE 'PVARX%'" }

	View.selectValue('wpConsole', '',
						['eq.eq_std'],
						'eq',
						['eq.eq_std'],
						['eq.eq_std'],
						rest, '', true, true);
}