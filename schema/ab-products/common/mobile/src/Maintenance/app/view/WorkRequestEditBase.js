Ext.define('Maintenance.view.WorkRequestEditBase', {
    extend: 'Maintenance.view.WorkRequestValidateBase',

    config: {

        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        title: '',
        editTitle: '',
        addTitle: '',

        viewIds: {
            workRequestId: null,
            mobileId: null
        }
    },

    initialize: function () {
        // Set the title
        var title = this.getIsCreateView() ? this.getAddTitle() : this.getEditTitle();
        this.setTitle(title);

        this.callParent();
    }
});