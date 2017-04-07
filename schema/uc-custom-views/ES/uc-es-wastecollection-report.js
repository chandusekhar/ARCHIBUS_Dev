EXPAND_ALL_TEXT  = "&#187; Expand All";
COLLAPSE_ALL_TEXT = "&#187; Collapse All";

var ucEsWasteCollReportController = View.createController('cbsEsWasteCollReportCntrl', {
	blId: null,
	vnId:"",
	vnComp:"",
	expandList:"",
	afterViewLoad: function() {
		this.inherit();
		this.createWRCellContent(this.wpPanel, "bill_type.state");
		
		var parameters = {
			tableName: 'afm_users',
			fieldNames: toJSON(['afm_users.vn_id']),
			restriction: "afm_users.user_name = '" + View.user.name  + "' AND afm_users.email = '" + View.user.email + "'"
		};
		
		var vnResult = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
		
		var rVnId = '';
		if (vnResult.code == 'executed' && vnResult.data != "undefined" && vnResult.data.records[0]){
			rVnId = vnResult.data.records[0]['afm_users.vn_id'];
		}
		
		var parameters = {
			tableName: 'vn',
			fieldNames: toJSON(['vn.vn_id', 'vn.company']),
			restriction: "vn.vn_id = '" + rVnId  + "'"
		};

	
		var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
		
		if (result.code == 'executed' && result.data != "undefined" && result.data.records[0]){
			this.vnId = result.data.records[0]['vn.vn_id'];
			this.vnComp = result.data.records[0]['vn.company'];
			
		}
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
		
		this.wpConsole.setFieldValue("date_issued.from", lastMonth);
		this.wpConsole.setFieldValue("date_issued.to", today);
		this.wpConsole.setFieldValue("company", this.vnComp);
   
		
		var selectBox = $("wpConsole_bill.status");
		selectBox.removeChild(selectBox[3]);
		
		
		
		this.wpConsole_onSearch();
	},
	
    wpConsole_onSearch: function() {
		this.expandList="";
		var billTypeId = '';
		var dateIssueFrom = '';
		var dateIssueTo = '';
		var locId = '';
		var company = '';
		var sparam = '';
		var bparam = '';
		var lparam = '';
		
		
		
		if (this.wpConsole.getFieldValue('bill_type.bill_type_id') != '') {
			billTypeId = this.wpConsole.getFieldValue('bill_type.bill_type_id');
			sparam = sparam+ " and t.bill_type_id = '"+ billTypeId +"'";
		}
		
		if (this.wpConsole.getFieldValue('date_issued.to') != '' && this.wpConsole.getFieldValue('date_issued.to') == '') {
			View.showMessage("Date Issued From and Date Issued To are required.");
			return false;
		}
		if (this.wpConsole.getFieldValue('date_issued.to') == '' && this.wpConsole.getFieldValue('date_issued.to') != '') {
			View.showMessage("Date Issued From and Date Issued To are required.");
			return false;
		}
		if (this.wpConsole.getFieldValue('date_issued.to') == '' && this.wpConsole.getFieldValue('date_issued.to') == '') {
			View.showMessage("Date Issued From and Date Issued To are required.");
			return false;
		}
	
		if (this.wpConsole.getFieldValue('date_issued.from') != '' && this.wpConsole.getFieldValue('date_issued.to') != '') {
			dateIssueFrom = this.wpConsole.getFieldValue('date_issued.from');
			dateIssueTo = this.wpConsole.getFieldValue('date_issued.to');
			bparam = bparam+ " and b.date_issued between '"+dateIssueFrom
				+ "' and '" +dateIssueTo+ "'";
		} 
		if (this.wpConsole.getFieldValue('bill.status') != '') {
			bparam = bparam+ " and b.status = '"+ this.wpConsole.getFieldValue('bill.status') + "'"
		}
		
		if (this.vnId){
			bparam = bparam+ " and vn.vn_id = '"+this.vnId.replace(/'/g,"''")+"'";
		}
		else if (this.wpConsole.getFieldValue('company') != '') {
			company = this.wpConsole.getFieldValue('company');
			bparam = bparam+ " and vn.company = '"+company+"'";
		}
		
		if (this.wpConsole.getFieldElement('loc_id')) {
			if (this.wpConsole.getFieldValue('loc_id') != '') {
				locId = this.wpConsole.getFieldValue('loc_id');
				lparam = lparam+ " and l.loc_id = '"+locId+"'";
				bparam += " and exists (select 1 from bill_line l where l.bill_id=b.bill_id " + lparam + ")"
			}
		}
	/*	if (bparam != "") {
			var sparam2 = sparam
			sparam += " and exists (select 1 from bill b inner join vn on b.vn_id=vn.vn_id inner join bill_type bt on bt.bill_type_id=b.bill_type_id where bt.parent in (t.parent,t.bill_type_id)" + bparam + ")";
			bparam +=sparam2
		}
	*/	
		this.wpPanel.addParameter("stream_param", sparam);
		this.wpPanel.addParameter("bill_param", bparam  );
		this.wpPanel.addParameter("rpt_param", bparam );
		this.wpPanel.addParameter("line_param", lparam);

		this.wpPanel.refresh();
		
		this.wpPanelexport.addParameter("stream_param", sparam);
		this.wpPanelexport.addParameter("bill_param", bparam  );
		this.wpPanelexport.addParameter("rpt_param", bparam );
		this.wpPanelexport.addParameter("line_param", lparam);
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
	
	
	
	resetFilter: function() {
		this.wpConsole.setFieldValue("bill.bill_type_id", "");
		//this.wpConsole.setFieldValue("date_issued.from", "");
		this.wpConsole.setFieldValue("date_issued.to", "");
		if (this.vnId == ""){
			this.wpConsole.setFieldValue("company", "");
		} else {
			this.wpConsole.setFieldValue("company", this.vnComp)
		}
		this.wpConsole.setFieldValue("loc_id", "");
		
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
			
		this.wpConsole.setFieldValue("date_issued.from", lastMonth);
		this.wpConsole.setFieldValue("date_issued.to", today);
	},
	
	
	createWRCellContent : function(panel, stateField){
		var me = this;
		panel.afterCreateCellContent = function(row, col, cellElement) {
			var state = row[(stateField || "activity_log.state")], link;
			 if (col.id === "assign" && (state == "sub-title" || state === "") ) {
				cellElement.style.visibility = "hidden";
			 }
            if (col.id === "changeState") {
                if(state === ""  || state == "sub-title" || state=="Edit" || state=="Nonedit"){
					if (me.expandList == me.expandList.replace("'" + row["bill_type.s1"].replace(/'/g,"''") + "',","")){
						row.row.dom.style.display = "none";
					}
					if(state == "Edit"){
						row.row.dom.style.cssText += ";background:#E0E0E0;font-weight:bold;";
						//row.row.dom.style.cssText += ";background:#E0E0E0;font-weight:bold;text-align:center;";
					}else{
						cellElement.style.visibility = "hidden";
					}
					
					
                }
                else{
					if (state == "+" && me.expandList != me.expandList.replace("'" + row["bill_type.s1"].replace(/'/g,"''") + "',","")){
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
		if(this.allExpanded(panel,"bill_type.state")){
			panel.actions.get("expandAll").button.setText(COLLAPSE_ALL_TEXT);
		}else{
			panel.actions.get("expandAll").button.setText(EXPAND_ALL_TEXT);
		}
		this.showHideExpandBtn(panel);
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
			this.expandAll(panel,"bill_type.state");
			btn.setText(COLLAPSE_ALL_TEXT);
		}else if(btn.text == COLLAPSE_ALL_TEXT){
			this.collapseAll(panel,"bill_type.state");	
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
			if(row.record[stateField] !== "" && row.record[stateField] !== "sub-title" && row.record[stateField] !== "Edit" && row.record[stateField] !== "Nonedit" && hasValue) { 
				row.record[stateField] = "hide";
				if (panel.rows.length -1 > i) {
					row2 = panel.rows[i+1].row;
					if(row.record["bill_type.s1"]==row2.record["bill_type.s1"]) {
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
			if(row.record[stateField] !== "" && row.record[stateField] !== "sub-title" && row.record[stateField] !== "Edit" && row.record[stateField] !== "Nonedit" && hasValue){
				row.record[stateField] = "hide";
				if (panel.rows.length -1 > i) {
					row2 = panel.rows[i+1].row;
					if(row.record["bill_type.s1"]==row2.record["bill_type.s1"]) {
						row.record[stateField] = "-";
					}
					
				}
				
				this.expandCollapseGrid(panel, row, stateField);
			}
		}
	},
	
	wpPanel_onChangeState:function(row) {
		var panel =this.wpPanel;
		var state = row.record["bill_type.state"];
		var e = Ext.get(row.cells.items[0].dom);
		var record = panel.rows[panel.selectedRowIndex-1];
		if(state !== "sub-title" &&  state !=="" && state !=="Edit" && state !=="Nonedit"){
			this.expandCollapseGrid(this.wpPanel,row,"bill_type.state");
		} else if (state == "Edit") {
			var rowIndex = this.wpPanel.selectedRowIndex;
			var billId = this.wpPanel.rows[rowIndex]["bill_type.bill_id"];
			var vnId = this.wpPanel.rows[rowIndex]["bill_type.vn_id"];
			//var restriction = new Ab.view.Restriction();
			//restriction.addClause("vn_ac.vn_ac_id",rec["vn_ac.vn_ac_id"],'=');
			var vw = 'uc-es-stream-upd.axvw'
			if (!this.wpConsole.getFieldElement('loc_id')) {vw = 'uc-es-ghg-upd.axvw';}
			View.openDialog(vw, {'bill.bill_id':billId,'bill.vn_id':vnId}, false, {
				width: 850,
				height: 750,
				closeButton: false,
				mode: 'editRecord'
			});
		}
			
		
	},
		
	expandCollapseGrid : function(grid, row, stateField){
		var recordIndex = row.record.index,gridRow,
			state = row.record[stateField], 
			btnCell = grid.multipleSelectionEnabled ? row.cells.items[1].dom : row.cells.items[0].dom;
		for(var i = recordIndex + 1, j=grid.rows.length; i < j; i++){
			gridRow = grid.rows[i];
			if(gridRow[stateField] !== "" && gridRow[stateField] !== "sub-title" && gridRow[stateField] !== "Edit" && gridRow[stateField] !== "Nonedit" ){
				break;
			}
			if(state === "-"){
				//Remove item from list
				this.expandList = this.expandList.replace("'" + row.record["bill_type.bill_type_id"].replace(/'/g,"''") + "',","")  
				gridRow.row.dom.style.display = "none";
			}else{
				//Add item to list
				this.expandList += "'" +row.record["bill_type.bill_type_id"].replace(/'/g,"''") + "',"
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
		
		if(this.allExpanded(grid,stateField)){
			grid.actions.get("expandAll").button.setText(COLLAPSE_ALL_TEXT);
		}else{
			grid.actions.get("expandAll").button.setText(EXPAND_ALL_TEXT);
		}
	},
	
	configureGridBtn:function(state, cellElement){
	    var btnImg = Ext.get(cellElement).child("img");
		var btn = null;
		if (btnImg) {
		    btn = btnImg.dom;
		}
		var isIE = /*@cc_on!@*/false;
		
		/*
			if (btn) {
				var image = '';
				
				
				document.getElementById("myimage").setAttribute("src","another.gif")
			
			}
		*/
		
			if(btn){
				//var image =((state === "+") ? "plus.gif" : "minus.gif");
				var image = '';
				if (state == "+") {image = "/archibus/schema/uc-custom-views/ES/plus.gif"} else if (state == "-") {image = "/archibus/schema/uc-custom-views/ES/minus.gif"} else if (state =="hide") {image = "/archibus/schema/uc-custom-views/ES/blank.gif"} else if (state == "Edit") {image = "/archibus/schema/uc-custom-views/ES/edit.gif"} else if (state =="Nonedit") {image = "/archibus/schema/uc-custom-views/ES/blank.gif"}
				btn.setAttribute("data-state",state);
				btn.setAttribute("src",image);
				cellElement.setAttribute("data-state",state);
				cellElement.style.cssText+=";width:18px;";
			}
		return this;
	},
	
	openStreamAddUpdate: function()
	{
		var rowIndex = this.wpPanel.selectedRowIndex;
		var billId = this.wpPanel.rows[rowIndex]["bill_type.bill_id"];
		var vnId = this.pnlApproval.rows[rowIndex]["bill.vn_id"];
		var vw = 'uc-es-stream-upd.axvw'
		if (!this.wpConsole.getFieldElement('loc_id')) {vw = 'uc-es-ghg-upd.axvw';}
		View.openDialog(vw, {'bill.bill_id':billId,'bill.vn_id':vnId}, false, {
			width: 850,
			height: 750,
			closeButton: false,
			mode: 'editRecord'
		});
	},
	
	openStreamAdd: function() {
		var vw = 'uc-es-stream-upd.axvw'
		if (!this.wpConsole.getFieldElement('loc_id')) {vw = 'uc-es-ghg-upd.axvw';}
		View.openDialog(vw, null, true, {
		width: 850,
		height: 750,
		closeButton: false,
		mode: 'newRecord'
		/*
		afterViewLoad: function(dialogView) { 
			var addStreamContrl = dialogView.controllers.get('scenarioCtrl');
			var billTypeId = addStreamContrl.bill_form.fields.get("bill.bill_type_id");
			//billTypeId.config.readOnly = false; 
			//billTypeId.dom.disabled= false;
			//addStreamContrl.bill_form.enableField('bill.bill_type_id', true);
			//addStreamContrl.bill_form.enableField('bill.site_id', true);
			//addStreamContrl.bill_form.enableField('bill.bl_id', true);
		}
		*/
		});
	},
	selectStream: function(act,parent){
		var fld = 'bill_type.bill_type_id';
		var fldDisplay = [];
		var rest = "bill_type.activity_id = '" + act + "'"	
		if (parent == 'p'){
			fld = 'bill_type.parent';
			fldDisplay=['bill_type.bill_type_id',  'bill_type.description']
			rest+= " and bill_type.parent is null"
			if (this.vnId != "") {
				rest+= " and exists (Select 1 from vn_ac v where v.vn_id = '" + this.vnId.replace(/,/g,"''") + "' and v.vn_ac_id = isnull(bill_type.parent,bill_type.bill_type_id))"
			}
		}
		else {
			fldDisplay=['bill_type.bill_type_id','bill_type.parent',  'bill_type.description']
			rest+= " and bill_type.parent is not null"
			if (this.vnId != "") {
				rest+= " and exists (Select 1 from vn_ac v where v.vn_id = '" + this.vnId.replace(/,/g,"''") + "' and v.vn_ac_id =bill_type.bill_type_id)"
			}
		}
	 
	 View.selectValue(
		'wpConsole',
		'Stream',
		[fld],
		'bill_type',
		['bill_type.bill_type_id'],
		fldDisplay,
		rest,
		null,
		true,
		true, 
		null, 
		null,
		null,'grid'); //tree does not restrict
	
	}
	
});