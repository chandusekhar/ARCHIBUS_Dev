/**
 * A TextArea field with a popup selection list
 *
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.control.field.TextPrompt', {
    extend: 'Common.control.field.TextArea',

    xtype: 'textpromptfield',

    requires: [
        'Common.control.TextPromptInput',
        'Common.plugin.ListPaging'
    ],

    noRecordsText: LocaleManager.getLocalizedString('No {0} to Display', 'Common.control.field.TextPrompt'),

    config: {
        /**
         * @cfg readOnly {Boolean} True to set the DOM element readonly attribute to true.
         * The list display icon is not displayed when readOnly is set to true.
         */
        readOnly: false,

        /**
         * @cfg {Object} component
         * @accessor
         * @hide
         */
        component: {
            xtype: 'textpromptinput'
        },

        /**
         * @cfg {String} store
         * The store that provides the data for the popup list
         */
        store: null,

        /**
         * @cfg {String} listTpl The template used to display the popup list data.
         * If the listTpl config is not provided the valueField will be displayed
         */
        listTpl: '',

        /**
         * @cfg {String} title The title that is displayed on the popup view
         */
        //title: null,

        /**
         * @cfg {String} valueField The underlying {@link Ext.data.Field#name data value name} to bind to this
         * Select control.
         */
        valueField: null

    },

    applyReadOnly: function (config) {
        var me = this;

        if (config) {
            me.element.addCls('x-compose-readonly');
        } else {
            me.element.removeCls('x-compose-readonly');

        }
        me.setClearIcon(!config);
        me.getComponent().setReadOnly(config);

        return config;
    },

    initialize: function () {
        var me = this;

        me.callParent();
        me.element.addCls('x-textprompt-clearicon');
        me.getComponent().on({
            scope: this,
            textpromptbuttontap: 'showListPanel'
        });

        me.getComponent().input.on({
            tap: 'onTextAreaTap',
            scope: this
        });

        me.element.on('focus', function () {
            this.blur();
        }, this);
    },

    applyStore: function (store) {
        if (store) {
            store = Ext.data.StoreManager.lookup(store);
        }
        return store;
    },

    /**
     * Generates the panel used for the popup view
     * @private
     * @returns {Ext.Panel} The popup panel
     */
    getPanel: function () {
        var config = {},
            phoneConfig = {
                width: '100%',
                height: '100%',
                modal: false,
                hideOnMaskTap: false,
                left: 0,
                top: 0
            },
            store = this.getStore();

        if (Ext.os.is.Phone) {
            config = phoneConfig;
        }

        if (!this.listPanel) {
            this.listPanel = Ext.create('Ext.Panel', Ext.apply({
                width: '80%',
                height: '60%',
                modal: true,
                zIndex: 30,
                hideOnMaskTap: true,
                left: '10%',
                top: '10%',
                layout: 'vbox',
                items: [
                    {
                        xtype: 'titlebar',
                        docked: 'top',
                        title: this.getTitle(),
                        items: [
                            {
                                xtype: 'button',
                                text: LocaleManager.getLocalizedString('Cancel', 'Common.control.field.TextPrompt'),
                                hidden: !Ext.os.is.Phone,
                                align: 'left',
                                listeners: {
                                    tap: this.onCancelPrompt,
                                    scope: this
                                }
                            }
                        ]
                    },
                    {
                        xtype: 'list',
                        store: store,
                        scrollToTopOnRefresh: false,
                        itemTpl: this.getListTpl(),
                        flex: 1,
                        emptyText: '<div class="ab-empty-text">' +
                        Ext.String.format(this.noRecordsText, this.getTitle()) + '</div>',
                        listeners: {
                            itemtap: this.onListTap,
                            scope: this
                        },
                        plugins: {
                            xclass: 'Common.plugin.ListPaging',
                            autoPaging: false
                        }
                    }
                ],
                listeners: {
                    show: function (panel) {
                        // Refresh the list when the prompt is displayed
                        panel.down('list').refresh();
                    }
                }

            }, config));
        }

        return this.listPanel;
    },

    /**
     * Displays the popup view
     * @private
     */
    showListPanel: function () {
        var me = this,
            listPanel = me.getPanel(),
            pagingPlugin = listPanel.down('list').getPlugins()[0],
            store = me.getStore();

        me.clearIconTapped = true;

        if (pagingPlugin) {
            pagingPlugin.onStoreLoad(store);
        }

        if (!listPanel.getParent()) {
            Ext.Viewport.add(listPanel);
        }

        if (Ext.os.is.Phone) {
            listPanel.show();
        } else {
            listPanel.showBy(me.element.first());
        }
    },

    /**
     * @private
     */
    onListTap: function (list, index, target, record, e) {
        var me = this,
            valueField = me.getValueField(),
            currentValue = me.getValue(),
            newValue,
            descriptionText = '';

        e.preventDefault();

        if (record) {
            newValue = record.get(valueField);
            if (currentValue && currentValue.length > 0) {
                descriptionText = currentValue + '\n' + newValue;
            } else {
                descriptionText = newValue;
            }
            me.setValue(descriptionText);
        }

        setTimeout(function () {
            me.listPanel.hide();
        }, 300);
    },

    /**
     * @private
     */
    applyListTpl: function (config) {
        var valueField = this.getValueField();

        if (config === '') {
            return '<div>{' + valueField + '}</div>';
        } else {
            return config;
        }
    },

    /**
     * Closes the popup view
     * @private
     */
    onCancelPrompt: function (button, e) {
        var me = this;

        e.preventDefault();
        setTimeout(function () {
            me.listPanel.hide();
        }, 300);
    }
});