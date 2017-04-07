
var moveController = View.createController('move', {
    
    // ----------------------- event handlers -----------------------------------------------------
    
    moveForm_onSelectFromDataJack: function() {
        this.selectJack('mo.from_bl_id', 'mo.from_fl_id', 'mo.from_rm_id', ['mo.from_jk_id_data'], getMessage('fromDataJack'));
    },

    moveForm_onSelectToDataJack: function() {
        this.selectJack('mo.to_bl_id', 'mo.to_fl_id', 'mo.to_rm_id', ['mo.to_jk_id_data'], getMessage('toDataJack'));
    },

    moveForm_onSelectFromVoiceJack: function() {
        this.selectJack('mo.from_bl_id', 'mo.from_fl_id', 'mo.from_rm_id', ['mo.from_jk_id_voice'], getMessage('fromVoiceJack'));
    },

    moveForm_onSelectToVoiceJack: function() {
        this.selectJack('mo.to_bl_id', 'mo.to_fl_id', 'mo.to_rm_id', ['mo.to_jk_id_voice'], getMessage('toVoiceJack'));
    },

    // ----------------------- helper methods -----------------------------------------------------
    
    selectJack: function(buildingField, floorField, roomField, jackFields, dialogTitle) {
        var buildingId = this.moveForm.getFieldValue(buildingField);
        var floorId = this.moveForm.getFieldValue(floorField);
        var roomId = this.moveForm.getFieldValue(roomField);

        var restriction = '';
        if (buildingId != '') {   
            restriction = "jk.bl_id='" + buildingId + "'";
            if (floorId != '')
            {   restriction = restriction + " AND jk.fl_id='" + floorId + "'";
                if (roomId != "")
                {   restriction = restriction + " AND jk.rm_id='" + roomId + "'";
                }
            }
        }

        View.selectValue({
        	formId: 'moveForm', 
        	title: dialogTitle, 
        	fieldNames: jackFields, 
        	selectTableName: 'jk', 
        	selectFieldNames: ['jk.jk_id'], 
        	visibleFieldNames: ['jk.jk_id','jk.jk_std'], 
        	restriction: restriction, 
            showIndex: true
        });
    }
});
