//
// override, set event handlers, and load drawing on startup would typically
// done from the overridden 'user_form_onload' method
//


var controller = View.createController('abExEquipmentController', {
    afterViewLoad: function() {

        // overrides Grid.onChangeMultipleSelection to load a drawing
        this.abExEquipment_floors.addEventListener('onMultipleSelectionChange', function(row) {
            View.panels.get('abExEquipment_cadPanel').addDrawing(row, null);
        });

        this.abExEquipment_floors.multipleSelectionEnabled = false;
    }
});





