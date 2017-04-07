Ext.define('SpaceOccupancy.view.TransactionCarousel', {
    extend: 'Common.view.navigation.Carousel',

    xtype: 'transactioncarousel',

    isNavigationEdit: true, //required in NavigationView#hasValidModel

    config: {
        view: 'SpaceOccupancy.view.TransactionEdit',
        store: 'roomPctsStore',
        storeId: 'roomPctsStore' //required in NavigationView#hasValidModel
    }
});