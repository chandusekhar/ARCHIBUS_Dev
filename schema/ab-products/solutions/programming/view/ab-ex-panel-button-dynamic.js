
View.createController('panelButtonDynamic', {
    
    afterViewLoad: function() {
        // create a text button
        this.panelButtonDynamic_panel.addAction({
            id: 'button1',
            text: getMessage('testButtonTitle'),
            listener: this.onTest.createDelegate(this)
        }); 

        // create an icon + text button
        this.panelButtonDynamic_panel.addAction({
            id: 'button2',
            text: getMessage('testButtonTitle'),
            icon: '/schema/ab-core/graphics/show.gif',
            cls: 'x-btn-text-icon',
            listener: this.onTest.createDelegate(this)
        });
    },

    onTest: function() {
        View.alert('You clicked on the test button');
    }
});