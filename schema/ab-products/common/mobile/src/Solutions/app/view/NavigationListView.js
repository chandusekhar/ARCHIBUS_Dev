// The NavigationListView is the main view and is the one displayed. It calls the list view class defined bellow.
// The navigation feature requires the existance of one controller that extends 'Common.controller.NavigationController' and contains the reference to the main view.
Ext.define('Solutions.view.NavigationListView',{
    extend: 'Common.view.navigation.NavigationView',

    //xtype property identifies the view and it is used in Solutions.controller.Navigation which is the navigation controller.
    xtype: 'navigationListView',

    config: {

        navigationBar: {
            //showSaveButton indicates if the Save or Add (+) button should be displayed.
            // The Save button is displayed when true. The Add button is displayed when false.
            // Both buttons are hidden when the value is null.
            showSaveButton: false
        },

        //call the list view
        items: [{
            xtype: 'employeeListView'
        }],

        //class used on Add (+)
        editViewClass : 'Solutions.view.EmployeeEditView'
    },

    isNavigationList: true
});

//The list view.
Ext.define('Solutions.view.EmployeeListView', {
    extend : 'Common.view.navigation.ListBase',
    requires : 'Ext.plugin.ListPaging',

    //the xtype mathces the value used in items configuration in NavigationListView
    xtype: 'employeeListView',

    config : {
        title: 'Employee List',

        //view displayed on list item tap
        editViewClass : 'Solutions.view.EmployeeEditView',

        items : [
            {
                xtype : 'list',
                itemId: 'employeeList',

                //the id of the store which contains the values to be displayed
                store : 'employeesStore',
                flex: 1,

                //the template for how the employee data will be displayed in the list
                itemTpl: '{em_id} {bl_id} - {fl_id} - {rm_id}',
                plugins : {
                    xclass : 'Ext.plugin.ListPaging',
                    autoPaging : false
                }
            }
        ]
    }
});

//The edit view.
Ext.define('Solutions.view.EmployeeEditView', {
    extend: 'Common.view.navigation.EditBase',

    requires: ['Common.control.prompt.Building',
        'Common.control.prompt.Floor',
        'Common.control.prompt.Room'],

    xtype: 'employeeEditView',

    config: {
        title: 'Edit Employee',

        //the model of the record displayed
        model: 'Common.model.Employee',

        //the store that contains the record displayed
        storeId: 'employeesStore',

        items: [
            {
                html: 'WARNING: Changes made on the employee records using this view will affect the values displayed in other app.'
            },
            {
                xtype: 'commontextfield',
                label: 'Employee Code',
                name: 'em_id'
            },
            {
                xtype: 'buildingPrompt'
            },
            {
                xtype: 'floorPrompt'
            },
            {
                xtype: 'roomPrompt'
            }
        ]
    }
});