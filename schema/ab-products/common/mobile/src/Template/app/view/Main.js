Ext.define('Template.view.Main', {
    extend: 'Ext.Container',
    xtype: 'main',
    
    viewText: [
        '<div>The Template app is an empty application template that can be used to create a new ARCHIBUS Mobile app.</div>',
        '<div>Perform the following steps to create a new app using the Template app.</div>',
        '<div><ul><li>Create a new folder for your app in the ../schema/ab-products/common/mobile/src folder.</li>',
        '<li>Copy the files from the Template folder to the new app folder.</li>',
        '<li>Edit the app.json file.<ul><li>Modify the id property. Set the id property value to a value that uniquely identifies your app.</li>',
        '<li>Set the name property to the name of the new app.</li></ul></li>',
        '<li>Edit the index.html file',
        '<ul><li>Set the title attribute to the title of the new app</li><li>Set the start up script function parameter to the app id set in the app.json file</li></ul>',
        '<li>Edit the app.js file</li><ul><li>Modify the app path configuration in the Ext.Loader.setPath function.</li>',
        '<li>Set the name property to the name of the new app.</li><li>Modify the launcher function to use the new view.</li></ul>',
        '</ul></div>'
    ],

    config: {
        items: [
            {
                xtype: 'titlebar',
                title: 'ARCHIBUS App Template',
                docked: 'top'
            },
            {
                xtype: 'container',
                itemId: 'content',
                styleHtmlContent: true
            }
        ]
    },

    initialize: function() {
        this.down('#content').setHtml(this.viewText.join(''));
    }
});
