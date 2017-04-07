var ucEsStreamVnEditController = View.createController('ucEsStreamVnEditCntrl', {
	blId: null,
	vn_ac_id: null,
	allLocId: "( ",

	/*vnAcntLocGrid_afterRefresh: function() {
		var tabs = View.panels.get("abMoGroupEditComplete_tabsFrame");
		tabs.tabs[2].setTitle('Actions');
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");

	},
	*/

	selectInitialVnAcntLoc: function() {
		var vnAcId = null;

		if (this.vnAcntGrid.gridRows.length > 0) {
			vnAcId = this.vnAcntGrid.rows[0]["vn_ac.vn_ac_id"];
		
			//this.vn_ac_id = this.vnAcntGrid.rows[0]["vn_ac.vn_ac_id"];
			var vnId = this.detailsPanel.getFieldValue("vn.vn_id");

			if (vnAcId != null && vnAcId != '') {
				var parameters = {
					tableName: 'uc_vn_acloc',
					fieldNames: toJSON(['uc_vn_acloc.vn_ac_id']),
					restriction: "uc_vn_acloc.vn_ac_id = '" + this.vnAcId + "'"
				};

				var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);

				if (result.code == 'executed' && result.data != "undefined" && result.data.records.length > 0){
					var test=1;
				
					this.vnAcntLocGrid.refresh("uc_vn_acloc.vn_ac_id='"+vnAcId.replace(/'/g, "''")+"'");
					//this.vnAcntLocGrid.refresh("uc_vn_acloc.vn_id='"+vnId.replace(/'/g, "''")+"' AND uc_vn_acloc.vn_ac_id='"+vnAcId.replace(/'/g, "''")+"'");
					blId = this.vnAcntGrid.rows[0]["vn_ac.bl_id"];
				} else {
					this.vnAcntLocGrid.show(false);
				}
			} else {
				this.vnAcntLocGrid.show(false);
			}

			this.vnAcntLocGrid.setTitle(vnId+" "+vnAcId+" locations");
		} else {
			this.vnAcntLocGrid.show(false);
		}
	},

	setVnAcntGridRest: function() {
		var rowIndex = this.vnAcntGrid.selectedRowIndex;
		this.vn_ac_id = this.vnAcntGrid.rows[rowIndex]["vn_ac.vn_ac_id"];

		var vnId = this.detailsPanel.getFieldValue("vn.vn_id");

		//this.vnAcntLocGrid.setTitle(vnId+this.vn_ac_id+" locations");
		//loc_id = this.vnAcntGrid.rows[rowIndex]["vn_ac.loc_id"];

		/*
		var rows = this.vnAcntLocGrid.rows;
		for (var i = 0; i < rows.length; i++) {
			var row = rows[i];
			if (row['uc_vn_acloc.loc_id'] && i!=(rows.length-1)) {
				this.allLocId += "'"+row['uc_vn_acloc.loc_id']+"',";
			} else if (row['uc_vn_acloc.loc_id']) {
				this.allLocId += "'"+row['uc_vn_acloc.loc_id']+"' )";
			}
		}
		*/

		blId = this.vnAcntGrid.rows[rowIndex]["vn_ac.bl_id"];
		//this.vnAcntLocGrid.refresh("uc_vn_acloc.vn_ac_id='"+this.vn_ac_id.replace(/'/g, "''")+"'");
		this.vnAcntLocGrid.refresh("uc_vn_acloc.vn_id='"+vnId.replace(/'/g, "''")+"' AND uc_vn_acloc.vn_ac_id='"+this.vn_ac_id.replace(/'/g, "''")+"'");

		this.vnAcntLocGrid.setTitle(vnId+" "+this.vn_ac_id+" locations");
	},

	vnAcntGrid_onAddNew : function(){
		var vnId = View.panels.get("detailsPanel").getFieldValue("vn.vn_id");

		View.openDialog('uc-es-stream-vnac-edit.axvw', null, true, {
			width: 1200,
			height: 600,
			closeButton: false,
			afterInitialDataFetch: function(dialogView){
				var controller = dialogView.controllers.get('ucEsStreamVnacEditCntrl');
				controller.editVnAc_form.setFieldValue("vn_ac.vn_id", vnId);
				var test= 1;
			}
		});
	},

	vnAcntGrid_onBtnEdit : function(row){
		var vnId = View.panels.get("detailsPanel").getFieldValue("vn.vn_id");
		var rec = row.record;
		//var rest = "vn_ac.vn_ac_id = '"+rec["vn_ac.vn_ac_id"]+"'";

		var restriction = new Ab.view.Restriction();
		restriction.addClause("vn_ac.vn_ac_id",rec["vn_ac.vn_ac_id"],'=');

		View.openDialog('uc-es-stream-vnac-edit.axvw', restriction, false, {
			width: 1200,
			height: 600,
			closeButton: false
			/*
			afterInitialDataFetch: function(dialogView){
				var controller = dialogView.controllers.get('ucEsStreamVnacEditCntrl');
				controller.editVnAc_form.setFieldValue("vn_ac.vn_id", vnId);
				var test= 1;
			}
			*/
		});
	},


   	vnAcntLocGrid_onAddNew : function(){
		var rest = "bl.bl_id = '"+blId+"'";
		var roomRest;
		var floorRest;
		var buildingRest;

		//roomRest = "(rm.ls_id not in ("+makeLiteralOrNull(ls)+") or rm.ls_id is NULL)";
		var rows = this.vnAcntLocGrid.rows;

		this.allLocId = '';
		for (var i = 0; i < rows.length; i++) {
			var row = rows[i];
			if (row['uc_vn_acloc.loc_id'] && i!=(rows.length-1)) {
				this.allLocId += "'"+row['uc_vn_acloc.loc_id']+"',";
			} else if (row['uc_vn_acloc.loc_id']) {
				this.allLocId += "'"+row['uc_vn_acloc.loc_id']+"' )";
			}
		}

		if (rows.length > 0) {
			roomRest = "(rtrim(rm.bl_id)+'-'+rtrim(rm.fl_id)+'-'+rtrim(rm.rm_id) not in ("+this.allLocId+")";
			floorRest = "(rtrim(fl.bl_id)+'-'+rtrim(fl.fl_id) not in ("+this.allLocId+")";
			//buildingRest = "(rtrim(bl.bl_id) not in ("+this.allLocId+")";
		} else {
			roomRest = null;
			floorRest = null;
			//buildingRest = null;
		}
		addRoomClbk =  this.addRoomClbk;
		addFloorClbk =  this.addFloorClbk;
		addBuildingClbk =  this.addBuildingClbk;

		View.openDialog('uc-es-stream-select-room.axvw', null, true, {
			width: 1200,
			height: 600,
			closeButton: false,
			afterInitialDataFetch: function(dialogView){
				var rmpanel = dialogView.panels.get("selectRoom_grid");
				var flpanel = dialogView.panels.get("selectFloor_grid");
				var blpanel = dialogView.panels.get("selectBuilding_grid");
				var controller = dialogView.controllers.get('ucEsStreamSelectRoomCntrl');
				controller.saveRoomRest(roomRest);

				//dialogView.panels.get("selectBuilding_grid").refresh(rest);

				var btn1 = rmpanel.actions.get("addRooms").button;
				var btn2 = flpanel.actions.get("addFloors").button;
				var btn3 = blpanel.actions.get("addBuildings").button;

				//rmpanel.addParameter('roomRest',roomRest);
				flpanel.addParameter('floorRest',floorRest);
				//blpanel.addParameter('buildingRest',buildingRest);
				btn1.el.on("click", addRoomClbk(rmpanel));
				btn2.el.on("click", addFloorClbk(flpanel));
				btn3.el.on("click", addBuildingClbk(blpanel));
			}
		});
	},

	vnAcntLocGrid_onRemove : function(){
		var selectedRecords = this.vnAcntLocGrid.getSelectedRecords();

		for (var i = 0; i < selectedRecords.length; i++) {
			var record = selectedRecords[i];
			record.setValue('uc_vn_acloc.status', 'I');
			ucEsStreamVnEditController.vnAcntLocGrid_ds.saveRecord(record);
		}

		ucEsStreamVnEditController.vnAcntLocGrid.refresh();
	},
	vnAcntLocGrid_onActivate : function(){
		var selectedRecords = this.vnAcntLocGrid.getSelectedRecords();

		for (var i = 0; i < selectedRecords.length; i++) {
			var record = selectedRecords[i];
			record.setValue('uc_vn_acloc.status', 'A');
			ucEsStreamVnEditController.vnAcntLocGrid_ds.saveRecord(record);
		}

		ucEsStreamVnEditController.vnAcntLocGrid.refresh();
	},

	addRoomClbk : function(rmpanel){
		var me = ucEsStreamVnEditController;
		return function(){
			me.addRooms(me, rmpanel);
		};
	},

	addFloorClbk : function(flpanel){
		var me = ucEsStreamVnEditController;
		return function(){
			me.addFloors(me, flpanel);
		};
	},

	addBuildingClbk : function(blpanel){
		var me = ucEsStreamVnEditController;
		return function(){
			me.addBuildings(me, blpanel);
		};
	},

	/*
	onAddRooms: function(rmpanel){
		var me = ucEsStreamVnEditController;

		me.addRooms(me, rmpanel);
	},
	*/

	addRooms : function(me, rmpanel){
		var selectedRecords = rmpanel.getSelectedRecords();
		var recBlId = null;
		var recFlId = null;
		var recRmId = null;
		var rest = rmpanel.restriction;
		rest += " AND rtrim(rm.bl_id)+'-'+rtrim(rm.fl_id)+'-'+rtrim(rm.rm_id) NOT IN ('";
		
		for (var i = 0; i < selectedRecords.length; i++) {
			var record = selectedRecords[i];
			recBlId = record.getValue('rm.bl_id');
			recFlId = record.getValue('rm.fl_id');
			recRmId = record.getValue('rm.rm_id');
			var addRest = recBlId+'-'+recFlId+'-'+recRmId;
			
			if(i!=(selectedRecords.length-1)){
				rest+= addRest+"','";
			}
			else{
				rest+= addRest+"')";
			}

			var fullLoc = recBlId+"-"+recFlId+"-"+recRmId;
			
			//var detailsFrameDs = View.getOpenerView().panels.get("detailsPanel");
			var vnId = this.detailsPanel.getFieldValue("vn.vn_id");
			
/* 			var vnAcId = this.vnAcntLocGrid.restriction;
			vnAcId = vnAcId.split('=')[1];
			vnAcId = vnAcId.substring(1, vnAcId.length-1); */

			var rec = new Ab.data.Record();
			rec.setValue('uc_vn_acloc.vn_ac_id', this.vn_ac_id);
			rec.setValue('uc_vn_acloc.vn_id', vnId);
			rec.setValue('uc_vn_acloc.loc_id', fullLoc);
			rec.setValue('uc_vn_acloc.bl_id', recBlId);
			rec.setValue('uc_vn_acloc.fl_id', recFlId);
			rec.setValue('uc_vn_acloc.rm_id', recRmId);
			
			try {
				me.vnAcntLocGrid_ds.saveRecord(rec);
			} catch (ex) {}
		}

		me.vnAcntLocGrid.refresh();
		rmpanel.refresh(rest);
		//View.closeDialog();
	},

	addFloors : function(me, flpanel){
		var selectedRecords = flpanel.getSelectedRecords();
		for (var i = 0; i < selectedRecords.length; i++) {
			var record = selectedRecords[i];
			var recBlId = record.getValue('fl.bl_id');
			var recFlId = record.getValue('fl.fl_id');

			var fullLoc = recBlId+"-"+recFlId;
			
			var vnId = this.detailsPanel.getFieldValue("vn.vn_id");
			
			// var vnAcId = this.vnAcntLocGrid.restriction;
			// vnAcId = vnAcId.split('=')[1];
			// vnAcId = vnAcId.substring(1, vnAcId.length-1);

			var rec = new Ab.data.Record();
			rec.setValue('uc_vn_acloc.vn_ac_id', this.vn_ac_id);
			rec.setValue('uc_vn_acloc.vn_id', vnId);
			rec.setValue('uc_vn_acloc.loc_id', fullLoc);
			rec.setValue('uc_vn_acloc.bl_id', recBlId);
			rec.setValue('uc_vn_acloc.fl_id', recFlId);
			
			try {
				me.vnAcntLocGrid_ds.saveRecord(rec);
			} catch (ex) {}
		}

		me.vnAcntLocGrid.refresh();
		flpanel.refresh();
		//View.closeDialog();
	},

	addBuildings : function(me, blpanel){
		var selectedRecords = blpanel.getSelectedRecords();
		for (var i = 0; i < selectedRecords.length; i++) {
			var record = selectedRecords[i];
			var recBlId = record.getValue('bl.bl_id');
			//var recFlId = record.getValue('rm.fl_id');
			//var recRmId = record.getValue('rm.rm_id');

			var fullLoc = recBlId;
			
			var vnId = this.detailsPanel.getFieldValue("vn.vn_id");
			
/* 			var vnAcId = this.vnAcntLocGrid.restriction;
			vnAcId = vnAcId.split('=')[1];
			vnAcId = vnAcId.substring(1, vnAcId.length-1); */

			var rec = new Ab.data.Record();
			rec.setValue('uc_vn_acloc.vn_ac_id', this.vn_ac_id);
			rec.setValue('uc_vn_acloc.vn_id', vnId);
			rec.setValue('uc_vn_acloc.loc_id', fullLoc);
			rec.setValue('uc_vn_acloc.bl_id', recBlId);
			//rec.setValue('uc_vn_acloc.fl_id', recFlId);
			//rec.setValue('uc_vn_acloc.rm_id', recRmId);
			try {
				me.vnAcntLocGrid_ds.saveRecord(rec);
			} catch (ex) {}
		}

		me.vnAcntLocGrid.refresh();
		blpanel.refresh();
		//View.closeDialog();
	}
});

function hidePanel() {
	View.panels.get("vnAcntLocGrid").show(false);
}

function setLocStatus() {
        var grid = View.panels.get(gridName);
	var selectedRecords = grid.getSelectedRecords();

	if (selectedRecords.length == 0) {
		View.showMessage(getMessage('noRecordSelected'));
		return false;
	}
}