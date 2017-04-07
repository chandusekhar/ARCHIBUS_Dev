//TODO: Change the Template path to the path of the new app.
Ext.Loader.setPath({
    'Ext': '../touch/src',
    'Common': '../Common',
    'Template': 'app'
});



Ext.require(['Common.scripts.ApplicationLoader', 'Common.Application', 'Common.lang.ComponentLocalizer', 'Common.lang.LocalizedStrings'], function () {

    Ext.application({

        requires: [],

        models: [],

        stores: [],

        views: [
            'Main'
        ],

        controllers: [],

        profiles: [],


        name: 'Template',  //TODO: Change the name property to the name of the new app.

        launch: function() {
            // Initialize the main view
            Ext.Viewport.add(Ext.create('Template.view.Main'));
        }

    });
});
