
View.createController('Ext5Test', {

    afterViewLoad: function() {
        // Ext 5 "sandbox" version still uses the Ext4 alias. This may change.
        Ext4.define('User', {
            extend: 'Ext.data.Model',
            fields: [ 'name', 'email', 'phone' ]
        });

        var userStore = Ext4.create('Ext.data.Store', {
            model: 'User',
            data: [
                { name: 'Lisa', email: 'lisa@simpsons.com', phone: '555-111-1224' },
                { name: 'Bart', email: 'bart@simpsons.com', phone: '555-222-1234' },
                { name: 'Homer', email: 'homer@simpsons.com', phone: '555-222-1244' },
                { name: 'Marge', email: 'marge@simpsons.com', phone: '555-222-1254' }
            ]
        });

        var childPanel = Ext4.create('Ext.grid.Panel', {
            renderTo: 'testPanel',
            width: '100%',
            height: 500,
            store: userStore,
            columns: [
                {
                    text: 'Name',
                    width: 100,
                    sortable: false,
                    hideable: false,
                    dataIndex: 'name'
                },
                {
                    text: 'Email Address',
                    width: 150,
                    dataIndex: 'email',
                    hidden: true
                },
                {
                    text: 'Phone Number',
                    flex: 1,
                    dataIndex: 'phone'
                }
            ]
        });

        // the HTML panel will resize Ext 5 content
        this.testPanel.setContentPanel(childPanel.body);
    }
});