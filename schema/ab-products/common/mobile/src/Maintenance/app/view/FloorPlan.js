// TODO: This should be a container with a floor plan view and a list view
Ext.define('Maintenance.view.FloorPlan', {
    extend: 'Floorplan.view.FloorPlan',

    requires: 'Floorplan.component.Svg',

    xtype: 'floorPlanPanel',

    config: {
        layout: 'vbox',

        title: LocaleManager.getLocalizedString('Floor Plans', 'Maintenance.view.FloorPlan'),

        /**
         * @cfg record {Model} The Work Request model for the displayed floor plan
         */
        record: null,

        planType: '',

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                text: LocaleManager.getLocalizedString('Site', 'Maintenance.view.FloorPlan'),
                itemId: 'sitePlanButton',
                displayOn: 'all',
                align: 'right'
            }
        ],

        items: [
            {
                xtype: 'svgcomponent',
                itemId: 'floorPlan',
                height: '100%'
            }
        ]
    }
});
