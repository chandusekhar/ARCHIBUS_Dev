var ucPrevMaintDisplay = View.createController('ucPrevMainDisplay', {
	afterViewLoad: function()
	{
		this.inherit();

		// add in a afterCreateCellContent handler for the display grid.
		//this.ucPrevMaintDisplay_treePanel.origCreateCellContent = this.ucPrevMaintDisplay_treePanel.createCellContent;
		this.ucPrevMaintDisplay_treePanel.afterCreateCellContent = function (row, column, cellElement) {
			// change the interval freq to active (1-3)/inactive (4)
			if (column.id == "pms.interval_freq") {
				var cellValue = "";
				var interval_freq = row["pms.interval_freq"];
				if (interval_freq == 4) {
					cellValue = "Inactive";
					cellElement.style.color = "red";
				}
				else {
					cellValue = "Active";
					cellElement.style.color = "green";
				}
				
				cellElement.style.fontWeight = "bold";
				cellElement.innerHTML = cellValue;
			}
		};
	},
	
	ucPrevMaintDisplay_treePanel_onActivatePM: function()
	{
		this.setIntervalFreq(1);
		this.ucPrevMaintDisplay_treePanel.refresh();
	},
	
	ucPrevMaintDisplay_treePanel_onDisablePM: function()
	{
		this.setIntervalFreq(4);
		this.ucPrevMaintDisplay_treePanel.refresh();
	},
	
	/**
	 * Saves the freq for each selected record.
	 */
	setIntervalFreq: function(freq)
	{
		View.openProgressBar("Updating status...");
		var selectedRecords = this.ucPrevMaintDisplay_treePanel.getSelectedRecords();
		var ds = this.ds_ucPrevMaintSchedSave;
		
		for (var i=0, numOfRecords = selectedRecords.length; i < numOfRecords; i++) {
			var pms_id = selectedRecords[i].values["pms.pms_id"];
			
			var saveRec = new Ab.data.Record();
			saveRec.values["pms.pms_id"] = pms_id;
			saveRec.values["pms.interval_freq"] = freq;
			
			saveRec.oldValues = new Object();
			saveRec.oldValues["pms.pms_id"] = pms_id;

			saveRec.isNew = false;
			
			ds.saveRecord(saveRec);
		}
		
		View.closeProgressBar();
	}
});