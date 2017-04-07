var ucEsStreamSelectRoomController = View.createController('ucEsStreamSelectRoomCntrl', {
	rmRest:null,
	
   	saveRoomRest : function(rest){
		this.rmRest = rest;
	},
	
	/*selectRoom_grid_afterRefresh : function() {
		this.selectRoom_grid.restriction = this.rmRest;
	},
	*/
	
	refreshRmPanel : function() {
		var rowIndex = this.selectBuilding_grid.selectedRowIndex;
		var blId = this.selectBuilding_grid.rows[rowIndex]["bl.bl_id"];
		
		var rowIndex = this.selectFloor_grid.selectedRowIndex;
		var flId = this.selectFloor_grid.rows[rowIndex]["fl.fl_id"];
		
		var rest = "(rm.bl_id = '"+blId+"' and rm.fl_id = '"+flId+"')"
		if (this.rmRest != null){
			rest += " and " + this.rmRest
		}
		
		this.selectRoom_grid.refresh(rest);
	}
	
	/*
	addRooms : function(){
		var rows = this.selectRoom_grid.getSelectedRecords();
		//var selectedRow = selectRoom_grid.rows[selectRoom_grid.selectedRowIndex];
		var ds = View.getOpenerView().dataSources.get("vnAcntLocGrid_ds");
		
		var vnAcntLocGrid = View.getOpenerView().panels.get("vnAcntLocGrid");
		var allGridRecs = vnAcntLocGrid.gridRows;
		
		var vnAcId = vnAcntLocGrid.restriction;
		vnAcId = vnAcId.split('=')[1];
		vnAcId = vnAcId.substring(1, vnAcId.length-1);
		
		var detailsFrameDs = View.getOpenerView().panels.get("detailsPanel");
		var vnId = detailsFrameDs.getFieldValue("vn.vn_id");
		
		for (var i = 0; i < rows.length; i++) {
			var blId = rows[i].values['rm.bl_id'];
			var flId = rows[i].values['rm.fl_id'];
			var rmId = rows[i].values['rm.rm_id'];
			var concatLoc = blId+'-'+flId+'-'+rmId;
			
			var record = new Ab.data.Record({
					'uc_vn_acloc.vn_ac_id': vnAcId,
					'uc_vn_acloc.loc_id': concatLoc,
					'uc_vn_acloc.vn_id': vnId,
					'uc_vn_acloc.status': 'A',
					'uc_vn_acloc.rm_id': rmId,
					'uc_vn_acloc.fl_id': flId,
					'uc_vn_acloc.bl_id': blId
				}, true);
			try {
				ds.saveRecord(record);
			} 
			catch (e) {
				var message = getMessage('errorSave');
				View.showMessage('error', message, e.message, e.data);
				return;
			}
		}   
		
		for (var j = 0; j < vnAcntLocGrid.gridRows.length; j++) {
			var rmRest = vnAcntLocGrid.gridRows.items[j].record["uc_vn_acloc.rm_id"];
			
			
			this.selectRoom_ds.refresh();
		}
	}
	*/
});