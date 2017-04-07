Ext.define('Solutions.view.PromptBarcode', {
    extend: 'Ext.Container',
    
    requires: ['Common.control.prompt.Building',
        'Common.control.prompt.Floor',
        'Common.control.prompt.Room'],

    config: {
        items: [
            {
                xtype: 'fieldset',
                title: 'Configure prompt fields for multi-key barcode scanning',
                instructions: 'Uses the \'enableBarcodeScanning\' and \'barcodeFormat\' configuration options.' +
                '<br \\>When a barcode value is scanned it is parsed using delimiters defined as application parameter AbSystemAdministration-MobileAppsBarcodeDelimiter and the result values are applied to hierachical prompt fields. When the scanned value cannot be properly parsed accordig to barcodeFormat config then the whole value is set for the current prompt field, in this case Room Code',
                items: [
                    {
                        //in app.js file add 'Common.store.Buildings' in the stores array
                        xtype: 'buildingPrompt',
                        name: 'bl_id',
                        childFields: ['fl_id', 'rm_id']
                    },
                    {
                        //in app.js file add 'Common.store.Floors' in the stores array
                        xtype: 'floorPrompt',
                        name: 'fl_id',
                        parentFields: ['bl_id'],
                        childFields: ['rm_id']
                    },
                    {
                        //in app.js file add 'Common.store.Rooms' in the stores array
                        xtype: 'roomPrompt',
                        name: 'rm_id',
                        parentFields: ['bl_id', 'fl_id'],
                        enableBarcodeScanning: true, //Displays the Barcode icon and allows barcode scanning
                        barcodeFormat: [{useDelimiter: true, fields: ['bl_id', 'fl_id', 'rm_id']}]
                    }
                ]
            }
        ]
    }
});