Ext.define('SpaceOccupancy.view.EmployeeCarousel', {
    extend: 'Common.view.navigation.Carousel',

    xtype: 'employeecarousel',

    config: {
        view: 'SpaceOccupancy.view.EmployeeEdit',
        store: 'employeesSyncStore'
    }
});