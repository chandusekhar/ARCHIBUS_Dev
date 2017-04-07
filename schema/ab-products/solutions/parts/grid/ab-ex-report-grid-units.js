
View.createController('exGridUnits', {
	
	exUnitsGrid_onShowAreaVirtualFields: function(row) {
		// the record in the grid contains area value in User Display Units
		var areaUserUnits = row.getFieldValue('rm.area');
        var formattedArea = this.exUnitsDS.formatValue('rm.area', parseFloat(areaUserUnits), true);
		View.alert('Area in User Display Units = ' + formattedArea);
	},

    exUnitsCustomGrid_onShowAreaCustomQuery: function(row) {
        // the record in the grid contains area value in Base Units
        var areaBaseUnits = row.getFieldValue('rm.area1');
        var formattedArea = this.exUnitsDS.formatValue('rm.area', parseFloat(areaBaseUnits), true);
        View.alert('Area in Base Units = ' + formattedArea);
    }
});