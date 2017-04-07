Ext.define('AssetAndEquipmentSurvey.view.TaskPromptList', {
    extend: 'Ext.Panel',

    xtype: 'taskPromptList',

    phoneConfig: {
        width: '100%',
        height: '100%'
    },

    tabletConfig: {
        width: '80%',
        height: '60%',
        left: '10%',
        top: '10%',
        modal: true,
        hideOnMaskTap: true
    },

    config: {
        layout: 'vbox',
        zIndex: 12,

        /**
         * @cfg {Object[]} The filters that are applied to the task list. The search function uses these
         * filters to restrict the search
         */
        taskFilters: null,

        items: [
            {
                xtype: 'titlebar',
                docked: 'top',
                title: LocaleManager.getLocalizedString('Select Equipment', 'AssetAndEquipmentSurvey.view.TaskPromptList')
            },
            {
                xtype: 'taskList',
                height: '100%'
            }
        ]
    },

    constructor: function () {
        var platformConfig = Ext.os.is.Phone ? this.phoneConfig : this.tabletConfig,
            viewConfig = Ext.apply(this.config, platformConfig);

        this.callParent([viewConfig]);

    },

    initialize: function () {
        var me = this,
            isPhone = Ext.os.is.Phone,
            titleBar = me.down('titlebar'),
            searchField,
            doneButton,
            toolBar;

        me.callParent(arguments);

        if (isPhone) {
            searchField = Ext.factory({centered: true, name: 'searchTaskPromptList'}, 'Common.control.Search');
            doneButton = Ext.factory({
                text: LocalizedStrings.z_Done,
                align: 'right',
                action: 'cancelTaskPromptList'
            }, 'Ext.Button');
            titleBar.add(doneButton);
            searchField.setCentered(true);
            toolBar = Ext.factory({docked: 'top'}, 'Ext.Toolbar');
            toolBar.add(searchField);
            me.add(toolBar);
        } else {
            searchField = Ext.factory({align: 'right', name: 'searchTaskPromptList'}, 'Common.control.Search');
            //need some extra space for history icon
            searchField.setStyle('margin-right:.5em');
            titleBar.add(searchField);
        }

    }

});