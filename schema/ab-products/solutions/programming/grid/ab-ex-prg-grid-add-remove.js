
View.createController('gridExample', {

    afterInitialDataFetch: function() {
        this.inherit();
    },

    prgGridAddRemove_roomGrid_onAddFirst: function() {
        var record = new Ab.data.Record({
            'rm.bl_id': 'Building 1031',
            'rm.fl_id': '78',
            'rm.rm_id': 'Apache'
        });        
        this.prgGridAddRemove_roomGrid.addGridRow(record, 0);        
        this.prgGridAddRemove_roomGrid.update();
    },
    
    prgGridAddRemove_roomGrid_onAddLast: function() {
        var record = new Ab.data.Record({
            'rm.bl_id': 'Building 1031',
            'rm.fl_id': '78',
            'rm.rm_id': 'Apache'
        });        
        this.prgGridAddRemove_roomGrid.addGridRow(record);        
        this.prgGridAddRemove_roomGrid.update();
    },
    
    prgGridAddRemove_roomGrid_onRemove: function(row) {
        var currentIndex = row.getIndex();
        this.prgGridAddRemove_roomGrid.removeGridRow(currentIndex);        
        this.prgGridAddRemove_roomGrid.update();
    },
    
    prgGridAddRemove_roomGrid_onMoveUp: function(row) {
        var currentIndex = row.getIndex();
        if (currentIndex > 0) {
            this.prgGridAddRemove_roomGrid.moveGridRow(currentIndex, currentIndex - 1);
        }
        this.prgGridAddRemove_roomGrid.update();
    },

    prgGridAddRemove_roomGrid_onMoveDown: function(row) {
        var currentIndex = row.getIndex();
        if (currentIndex < this.prgGridAddRemove_roomGrid.gridRows.getCount() - 1) {
            this.prgGridAddRemove_roomGrid.moveGridRow(currentIndex, currentIndex + 1);
        }
        this.prgGridAddRemove_roomGrid.update();
    }
});

