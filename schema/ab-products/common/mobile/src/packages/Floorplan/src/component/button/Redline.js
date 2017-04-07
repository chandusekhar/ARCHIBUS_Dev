Ext.define('Floorplan.component.button.Redline', {
    extend: 'Common.control.button.Toolbar',

    xtype: 'redlinebutton',

    config: {
        iconCls: 'redline',
        align: 'right',
        action: 'openRedline',
        displayOn: 'all'
    }
});