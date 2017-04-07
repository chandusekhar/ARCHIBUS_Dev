EXPAND_ALL_TEXT  = "&#187; Expand All";
COLLAPSE_ALL_TEXT = "&#187; Collapse All";

var ucCaRecurringDemandController = View.createController('ucCaRecurringDemandCntr', {
	blId: null,
	vnId:"",
	vnComp:"",
	expandList:"",
	row1param:"",
	row2param:"",
	
	afterViewLoad: function() {
		this.wpPanelExport.show(false);
		this.inherit();
		this.createWRCellContent(this.wpPanel, "eq.state");
		
		this.wpPanel.addParameter("row1_param", " WHERE 1=2 ");
		this.wpPanel.addParameter("row2_param", " WHERE 1=2 ");
		this.wpPanel.refresh();
		
		/*
		var parameters = {
			tableName: 'vn',
			fieldNames: toJSON(['vn.vn_id', 'vn.company']),
			restriction: "vn.email = '" + View.user.email  + "'"
		};

	
		var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
		
		if (result.code == 'executed' && result.data != "undefined" && result.data.records[0]){
			this.vnId = result.data.records[0]['vn.vn_id'];
			this.vnComp = result.data.records[0]['vn.company'];
			
		}
		*/
	},
	
	afterInitialDataFetch: function() {
		this.wpConsole.fields.get("cost_total.from").fieldDef.defaultValue=null
		this.wpConsole.fields.get("cost_total.to").fieldDef.defaultValue=null
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
		
		this.wpConsole.setFieldValue("date_requested.from", lastMonth);
		this.wpConsole.setFieldValue("date_requested.to", today);
		this.wpConsole.setFieldValue("company", this.vnComp);
		
		var row1param = " WHERE 1=2 ";
		var row2param = " WHERE 1=2 ";
		this.wpPanel.addParameter("row1_param", row1param);
		this.wpPanel.addParameter("row2_param", row2param);

		this.wpPanelExport.addParameter("row1_param", row1param);
		this.wpPanelExport.addParameter("row2_param", row2param);
		this.wpPanel.refresh();
		
		for (i = 0; i < $('eq.status').length; i++) {
			if(	$('eq.status')[i].value == 'in') {
				$('eq.status')[i].selected = true;
				break;
			}
		}
		
		//this.wpConsole.setFieldValue("cost_total.from", "0.0");
		//this.wpConsole.setFieldValue("cost_total.to", "0.0");
		//this.wpConsole_onSearch(); 
	},
	
	
    wpConsole_onSearch: function() {
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
		var costTotalFrom ='';
		var costTotalTo= '';
		
		row1param = 'WHERE 1=1';
		row2param = 'WHERE 1=1';
		//row1Cost_param = ' HAVING 1=1';
		//row2Cost_param = ' HAVING 1=1';
		//wrCount_param = ' AND 1=1';
		row1zeroCond_param = " CASE WHEN (SELECT SUM(cost_total) from wrhwr where wrhwr.eq_id=e.eq_id) &gt; 0 then 'Total Cost: $' + convert(varchar, cast(str(rtrim(isnull((select SUM(cost_total) from wrhwr where wrhwr.eq_id=e.eq_id),0))) as money), 1) else '' end cost ";
		//wrCost_param = ' AND 1=1';
		
		/*	if (this.wpConsole.getFieldValue('date_requested.from') != '' && this.wpConsole.getFieldValue('date_requested.to') == '') {
			View.showMessage("Date Issued From and Date Issued To are required.");
			return false;
		}
		if (this.wpConsole.getFieldValue('date_requested.from') == '' && this.wpConsole.getFieldValue('date_requested.to') != '') {
			View.showMessage("Date Issued From and Date Issued To are required.");
			return false;
		} */
		if (this.wpConsole.getFieldValue('date_requested.to') == '' && this.wpConsole.getFieldValue('date_requested.to') == '' && this.wpConsole.getFieldValue('wrhwr.wr_id') == '') {
			View.showMessage("Please fill in a WR Code and/or a Date From/To in order to filter.");
			return false;
		}
		
		if (this.wpConsole.getFieldValue('wrhwr.wr_id') != '') {
			wrId = this.wpConsole.getFieldValue('wrhwr.wr_id');
			row1param = row1param+ " and wrhwr.wr_id = '"+ wrId +"'";
			row2param = row2param+ " and wrhwr.wr_id = '"+ wrId +"'";
			//wrCount_param = wrCount_param+ " and wrhwr.wr_id = '"+ wrId +"'";
			//wrCost_param = + " and wrhwr.wr_id = '"+ wrId +"'";
		}
		
		if (this.wpConsole.getFieldValue('wrhwr.bl_id') != '') {
			blId = this.wpConsole.getFieldValue('wrhwr.bl_id');
			row1param = row1param+ " and wrhwr.bl_id = '"+ blId +"'";
			row2param = row2param+ " and wrhwr.bl_id = '"+ blId +"'";
			//wrCount_param = wrCount_param+ " and wrhwr.bl_id = '"+ blId +"'";
			//wrCost_param = wrCost_param+ " and wrhwr.bl_id = '"+ blId +"'";
		}
		
		if (this.wpConsole.getFieldValue('wrhwr.fl_id') != '') {
			flId = this.wpConsole.getFieldValue('wrhwr.fl_id');
			row1param = row1param+ " and wrhwr.fl_id = '"+ flId +"'";
			row2param = row2param+ " and wrhwr.fl_id = '"+ flId +"'";
			//wrCount_param = wrCount_param+ " and wrhwr.fl_id = '"+ flId +"'";
			//wrCost_param = wrCost_param+ " and wrhwr.fl_id = '"+ flId +"'";
		}
		
		if (this.wpConsole.getFieldValue('wrhwr.rm_id') != '') {
			rmId = this.wpConsole.getFieldValue('wrhwr.rm_id');
			row1param = row1param+ " and wrhwr.rm_id = '"+ rmId +"'";
			row2param = row2param+ " and wrhwr.rm_id = '"+ rmId +"'";
			//wrCount_param = wrCount_param+ " and wrhwr.rm_id = '"+ rmId +"'";
			//wrCost_param = wrCost_param+ " and wrhwr.fl_id = '"+ flId +"'";
		}
		
		if (this.wpConsole.getFieldValue('wrhwr.status') != '') {
			status = this.wpConsole.getFieldValue('wrhwr.status');
			row1param = row1param+ " and wrhwr.status = '"+ status +"'";
			row2param = row2param+ " and wrhwr.status = '"+ status +"'";
			//wrCount_param = wrCount_param+ " and wrhwr.status = '"+ status +"'";
			//wrCost_param = wrCost_param+ " and wrhwr.status = '"+ status +"'";
		}
		
		if (this.wpConsole.getFieldValue('eq.status') != '') {
			status = this.wpConsole.getFieldValue('eq.status');
			row1param = row1param+ " and e.status = '"+ status +"'";
			row2param = row2param+ " and eq.status = '"+ status +"'";
			//wrCount_param = wrCount_param + " and e.status = '"+ status +"'";
			//wrCost_param = wrCost_param + " and e.status = '"+ status +"'";
		}
		
		if (this.wpConsole.getFieldValue('wrhwr.tr_id') != '') {
			trId = this.wpConsole.getFieldValue('wrhwr.tr_id');
			row1param = row1param+ " and wrhwr.tr_id = '"+ trId +"'";
			row2param = row2param+ " and wrhwr.tr_id = '"+ trId +"'";
			//wrCount_param = wrCount_param+ " and wrhwr.tr_id = '"+ trId +"'";
			//wrCost_param = wrCost_param+ " and wrhwr.tr_id = '"+ trId +"'";
		}
		
		if (this.wpConsole.getFieldValue('eq.eq_id') != '') {
			eqId = this.wpConsole.getFieldValue('eq.eq_id');
			row1param = row1param + " and e.eq_id = '"+ eqId +"'";
			row2param = row2param + " and eq.eq_id = '"+ eqId +"'";
			//wrCount_param = wrCount_param + " and e.eq_id = '"+ eqId +"'";
			//wrCost_param = wrCost_param + " and e.eq_id = '"+ eqId +"'";
		}
		
		if (this.wpConsole.getFieldValue('wrhwr.prob_type') != '') {
			probType = this.wpConsole.getFieldValue('wrhwr.prob_type');
			row1param = row1param + " and wrhwr.prob_type = '"+ probType +"'";
			row2param = row2param + " and wrhwr.prob_type = '"+ probType +"'";
			//wrCount_param = wrCount_param + " and wrhwr.prob_type = '"+ probType +"'";
			//wrCost_param = wrCost_param + " and wrhwr.prob_type = '"+ probType +"'";
		}
		
		if (this.wpConsole.getFieldValue('eq.eq_std') != '') {
			eqStd = this.wpConsole.getFieldValue('eq.eq_std');
			row1param = row1param + " and e.eq_std like '"+ eqStd +"%'";
			row2param = row2param + " and eq.eq_std like '"+ eqStd +"%'";
			//wrCount_param = wrCount_param + " and e.eq_std like '"+ eqStd +"%'";
			//wrCost_param = wrCost_param + " and e.eq_std like '"+ eqStd +"%'";
		}
		
		if (this.wpConsole.getFieldValue('date_requested.from') != '' && this.wpConsole.getFieldValue('date_requested.to') != '') {
			dateRequestedFrom = this.wpConsole.getFieldValue('date_requested.from');
			dateRequestedTo = this.wpConsole.getFieldValue('date_requested.to');
			
/* 			dateRequestedFrom = new Date(dateRequestedFrom);
			var dd = dateRequestedFrom.getDate()+1;
			var mm = dateRequestedFrom.getMonth()+1;
			var yyyy = dateRequestedFrom.getFullYear();
			if(dd<10){dd='0'+dd} 
			if(mm<10){mm='0'+mm} 
			dateRequestedFrom = mm+'/'+dd+'/'+yyyy; 
			
			dateRequestedTo = new Date(dateRequestedTo);
			var dd = dateRequestedTo.getDate()+1;
			var mm = dateRequestedTo.getMonth()+1;
			var yyyy = dateRequestedTo.getFullYear();
			if(dd<10){dd='0'+dd} 
			if(mm<10){mm='0'+mm} 
			dateRequestedTo = mm+'/'+dd+'/'+yyyy;  */
			
			row1param = row1param+ " and wrhwr.date_requested between '"+dateRequestedFrom
				+ "' and '" +dateRequestedTo+ "'";
			row2param = row2param+ " and wrhwr.date_requested between '"+dateRequestedFrom
				+ "' and '" +dateRequestedTo+ "'";
			//wrCount_param = wrCount_param+ " and wrhwr.date_requested between '"+dateRequestedFrom + "' and '" +dateRequestedTo+ "'";
			//wrCost_param = wrCost_param+ " and wrhwr.date_requested between '"+dateRequestedFrom + "' and '" +dateRequestedTo+ "'";
		} 
		
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
		
		
		
		if (this.wpConsole.getFieldValue('cost_total.from') != '' && this.wpConsole.getFieldValue('cost_total.to') != '') {
			if (isNaN(this.wpConsole.getFieldValue('cost_total.from')) || isNaN(this.wpConsole.getFieldValue('cost_total.to'))) {
				View.showMessage("The cost from and to fields need to be numeric.");
				return false;
			} else if (this.wpConsole.getFieldValue('cost_total.from') == 0 && this.wpConsole.getFieldValue('cost_total.to') == 0){
				row1zeroCond_param = " '' cost ";
				
				costTotalFrom = this.wpConsole.getFieldValue('cost_total.from');
				costTotalTo = this.wpConsole.getFieldValue('cost_total.to');
				
				//wrCount_param = wrCount_param + " AND ISNULL(wrhwr.cost_total,0) between "+costTotalFrom + " and " +costTotalTo; 
				//wrCost_param = wrCost_param + " AND ISNULL(wrhwr.cost_total,0) between "+costTotalFrom + " and " +costTotalTo; 

 				//row1Cost_param = " HAVING ISNULL(wrhwr.cost_total,0) between "+costTotalFrom + " and " +costTotalTo; 
				//row2Cost_param = " HAVING ISNULL(wrhwr.cost_total,0) between "+costTotalFrom+ " and " +costTotalTo;
				row1param += " and ISNULL(wrhwr.cost_total,0) between "+costTotalFrom + " and " +costTotalTo; 
				row2param += " and ISNULL(wrhwr.cost_total,0) between "+costTotalFrom+ " and " +costTotalTo;
				
			} else {
				costTotalFrom = this.wpConsole.getFieldValue('cost_total.from');
				costTotalTo = this.wpConsole.getFieldValue('cost_total.to');
				
				//wrCount_param = " AND ISNULL(wrhwr.cost_total,0) between "+costTotalFrom + " and " +costTotalTo;
				//wrCost_param = wrCost_param + " AND ISNULL(wrhwr.cost_total,0) between "+costTotalFrom + " and " +costTotalTo; 					

 				//row1Cost_param = " HAVING ISNULL(wrhwr.cost_total,0) between "+costTotalFrom + " and " +costTotalTo+ ""; 
				//row2Cost_param = " HAVING ISNULL(wrhwr.cost_total,0) between "+costTotalFrom + " and " +costTotalTo;
				row1param += " and ISNULL(wrhwr.cost_total,0) between "+costTotalFrom + " and " +costTotalTo; 
				row2param += " and ISNULL(wrhwr.cost_total,0) between "+costTotalFrom+ " and " +costTotalTo;
			}
		} 
		else if (this.wpConsole.getFieldValue('cost_total.from') != '' ) {
			costTotalFrom = this.wpConsole.getFieldValue('cost_total.from');
			//wrCount_param = " AND ISNULL(wrhwr.cost_total,0) >= "+costTotalFrom ;
			//wrCost_param = wrCost_param + " AND ISNULL(wrhwr.cost_total,0) >= "+costTotalFrom; 					

			//row1Cost_param = " HAVING ISNULL(wrhwr.cost_total,0) >= "+costTotalFrom; 
			//row2Cost_param = " HAVING ISNULL(wrhwr.cost_total,0) >= "+costTotalFrom;
			
			row1param += " and ISNULL(wrhwr.cost_total,0) >= "+costTotalFrom; 
			row2param += " and ISNULL(wrhwr.cost_total,0) >= "+costTotalFrom;
		}
		else if (this.wpConsole.getFieldValue('cost_total.to') != '') {
			costTotalTo = this.wpConsole.getFieldValue('cost_total.to');
			//wrCount_param = " AND ISNULL(wrhwr.cost_total,0) <= "+costTotalTo ;
			//wrCost_param = wrCost_param + " AND ISNULL(wrhwr.cost_total,0) <= "+costTotalTo; 					

			//row1Cost_param = " HAVING ISNULL(wrhwr.cost_total,0) <= "+costTotalTo; 
			//row2Cost_param = " HAVING ISNULL(wrhwr.cost_total,0) <= "+costTotalTo;
			row1param += " and ISNULL(wrhwr.cost_total,0) <= "+costTotalTo; 
			row2param += " and ISNULL(wrhwr.cost_total,0) <= "+costTotalTo;
		}
		
/* 		select SUM(wrhwr.cost_total) as total, eq.eq_id from wrhwr, eq 
		where wrhwr.eq_id=eq.eq_id
		group by eq.eq_id, wrhwr.eq_id */

		this.wpPanel.addParameter("row1_param", row1param);
		this.wpPanel.addParameter("row2_param", row2param);
		//this.wpPanel.addParameter("row1Cost_param", row1Cost_param);
		//this.wpPanel.addParameter("row2Cost_param", row2Cost_param);
		//this.wpPanel.addParameter("wrCount_param", wrCount_param);
		//this.wpPanel.addParameter("wrCost_param", wrCost_param);
		
		this.wpPanelExport.addParameter("row1_param", row1param);
		this.wpPanelExport.addParameter("row2_param", row2param);
		//this.wpPanelExport.addParameter("row1Cost_param", row1Cost_param);
		//this.wpPanelExport.addParameter("row2Cost_param", row2Cost_param);
		//this.wpPanelExport.addParameter("wrCount_param", wrCount_param);
		//this.wpPanelExport.addParameter("wrCost_param", wrCost_param);
		
		this.wpPanel.refresh();
		//this.wpPanelExport.refresh();
		this.wpPanelExport.show(false);
		
		var panel = this.wpPanel,
		btn = panel.actions.get("expandAll").button;
		this.collapseAll(panel,"eq.state");	
		btn.setText(EXPAND_ALL_TEXT);
	},
	
	exportgrid:function(expandedStream){
		var param = ""
		if (this.expandList != "") {
			param ="(s2=1 or s1 in (" + this.expandList + "''))";
			if (expandedStream) {
				param ="(s1 in (" + this.expandList + "''))";
			}
		}
		else if (expandedStream && this.expandList != "") {
			alert("No Expanded Streams to Export")
			return false;
		} else {
			this.wpPanelExport.addParameter("row2_param", " AND 1=2 ");
		}
		
		this.wpPanelExport.addParameter("row1_param", row1param);
		this.wpPanelExport.addParameter("row2_param", row2param);
		
		if (this.expandList == "") {
			this.wpPanelExport.addParameter("row2_param", " AND 1=2 ");
		}
		//this.wpPanelexport.addParameter("expand_param", param);
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
		this.wpConsole.setFieldValue("cost_total.from", "0.0");
		this.wpConsole.setFieldValue("cost_total.to", "0.0");
	},
	
	
	createWRCellContent : function(panel, stateField){
		var me = this;
		
		//override createcellco
		panel.afterCreateCellContent = function(row, col, cellElement) {
			var state = row[(stateField || "activity_log.state")], link;
			/*
			 if (col.id === "assign" && (state == "sub-title" || state === "") ) {
				cellElement.style.visibility = "hidden";
			 }
			 */
			 
			if (row["eq.s2"] == "2" && col.id == "eq.eq_id") {
				//var rowVal = cellElement.firstChild.attributes[1].nodeValue;
				
				
				//var elem = document.getElementById(rowVal);
				//$('a[id='+'"'+rowVal+'"'+']').contents().unwrap();
				var test = 1;
				var rowVal = cellElement.innerHTML;
				rowVal = rowVal.replace(/<a\b[^>]*>/i,"");
				rowVal = rowVal.replace(/<\/a>/i, "");
				/* var wrap = $('.highlight');
				var text = wrap.text();
				wrap.replaceWith(text); */
				
				cellElement.innerHTML = rowVal;
			}
            if (col.id === "changeState") {
                if(state === ""  || state == "View"){
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
            }/* else if(state == "sub-title"){
				//link = Ext.get(cellElement).child("a");
				//if(link){
					//link.dom.style.cssText += ";text-decoration:none;color:black;cursor:text;";
					
				//}
				row.row.dom.style.cssText += ";background:#E0E0E0;color:blue;font-weight:bold;text-align:center;";
				//row.row.dom.style.cssText += ";background:lightblue;font-weight:bold;text-align:center;";
				cellElement.style.textAlign = "left";
			}else if(state === "" || state == "sub-title"){
				row.row.dom.style.display = "none";
			} */
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
		/* if(this.allExpanded(panel,"bill_type.state")){
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
		if(state !== "View" &&  state !=="" && state !=="Edit" && state !=="Nonedit"){
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
			if(gridRow[stateField] !== "" && gridRow[stateField] !== "View" && gridRow[stateField] !== "Edit" && gridRow[stateField] !== "Nonedit" ){
				break;
			}
			if(state === "-"){
				//Remove item from list
				this.expandList = this.expandList.replace("'" + row.record["eq.s1"].replace(/'/g,"''") + "',","")  
				gridRow.row.dom.style.display = "none";
			}else{
				//Add item to list
				this.expandList += "'" +row.record["eq.s1"].replace(/'/g,"''") + "',"
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
		var btn = Ext.get(cellElement).child("img").dom;
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
				if (state == "+") {image = "/archibus/schema/uc-custom-views/ES/plus.gif"} else if (state == "-") {image = "/archibus/schema/uc-custom-views/ES/minus.gif"} else if (state =="hide") {image = "/archibus/schema/uc-custom-views/ES/blank.gif"} else if (state == "Edit") {image = "/archibus/schema/uc-custom-views/ES/edit.gif"} else if (state =="View") {image = "/archibus/schema/uc-custom-views/ES/blank.gif"}
				btn.setAttribute("data-state",state);
				btn.setAttribute("src",image);
				cellElement.setAttribute("data-state",state);
				cellElement.style.cssText+=";width:18px;";
			}
		return this;
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

function openEquipmentDetails() {
	var wpPanel = View.panels.get("wpPanel");
	var rowIndex = wpPanel.selectedRowIndex;
	var eqId = wpPanel.rows[rowIndex]["eq.s1"];
	var vw = 'eqdetails.axvw'
	View.openDialog(vw, {'eq.eq_id':eqId}, false, {
		width: 850,
		height: 750,
		closeButton: true,
		mode: 'editRecord'
	}); 
}

function selectEqStd(){
	var rest = ''
	
	var eqId = View.panels.get("wpConsole").getFieldValue("eq.eq_id");
	if (eqId != '') { rest = "eq.eq_id = '" + eqId + "'"} else { rest = "eq.eq_std LIKE 'PVARX%'" }

	View.selectValue('wpConsole', '',
						['eq.eq_std'],
						'eq',
						['eq.eq_std'],
						['eq.eq_std', 'eq.eq_id'],
						rest, '', true, true);
}

