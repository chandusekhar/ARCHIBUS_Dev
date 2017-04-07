Ext.define('Solutions.controller.Navigation',{
    extend: 'Common.controller.NavigationController',
    config: {
        refs:{
            //Defining the mainView in the controller that extends 'Common.controller.NavigationController' is mandatory.
            mainView: 'navigationListView'
        }
    },

    /**
     * Override the function in Common.controller.NavigationController in order to save the record without updating the mobile fields,
     * which are specific to sync tables and don't exist in em table.
     * @param currentView
     */
    saveEditPanel: function (currentView) {
        var me = this,
            record = currentView.getRecord(),
            store = Ext.getStore(currentView.getStoreId());

        // Check validation
        if (record.isValid()) {

            //The only change applied to the overriden function
            //record.setChangedOnMobile();

            store.add(record);
            store.sync(function () {
                if(currentView.getIsCreateView()){
                    Ext.Viewport.remove(currentView);
                } else{
                    me.getMainView().pop();
                }
            });
        } else {
            currentView.displayErrors(record);
        }
    }

});