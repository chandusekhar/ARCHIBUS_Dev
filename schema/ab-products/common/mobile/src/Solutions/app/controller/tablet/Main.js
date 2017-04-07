Ext.define('Solutions.controller.tablet.Main', {
    extend: 'Solutions.controller.Main',


    onNavTap: function(nestedList, list, index) {
        var record = list.getStore().getAt(index);

        // Hide Back to Apps button
        this.getBackToAppLauncherButton().setHidden(true);

        if(record.isLeaf()) {
            this.redirectTo(record);
        }
    },

    // Used by a route configuration in the parent controller.
    showMenuById: function() {}

});