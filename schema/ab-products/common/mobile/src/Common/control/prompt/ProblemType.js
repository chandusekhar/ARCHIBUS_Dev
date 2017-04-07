/**
 * Displays the hierarchical problem type data in a nested list
 *
 * @author Jeff Martin
 * @since 21.2
 */
Ext.define('Common.control.prompt.ProblemType', {
    extend: 'Common.control.field.Prompt',

    requires: ['Common.model.Problems',
        'Common.util.ProblemTypeData',
        'Common.control.list.ProblemTypeList'],

    xtype: 'problemtypefield',

    /**
     * Returns the panel containing the Problem Type list data
     * @private
     * @returns {Ext.Panel}
     */
    getPromptPanel: function () {
        var config = {},
            phoneConfig = {
                width: '100%',
                height: '100%',
                modal: false,
                hideOnMaskTap: false,
                left: 0,
                top: 0
            };

        if (Ext.os.is.Phone) {
            config = phoneConfig;
        }

        if (!this.promptPanel) {
            this.promptPanel = Ext.create('Ext.Panel', Ext.apply({
                    width: 400,
                    height: 400,
                    modal: true,
                    hideOnMaskTap: true,
                    left: '30%',
                    top: '20%',
                    layout: 'vbox',
                    items: [
                        {
                            xtype: 'problemtypelist',
                            title: LocaleManager.getLocalizedString('Problem Type', 'Common.control.prompt.ProblemType'),
                            flex: 1,
                            store: {
                                type: 'tree',
                                id: 'NestedListStore',
                                model: 'Common.model.Problems'
                            },
                            displayField: 'text',
                            listeners: {
                                itemselected: 'onProblemTypeSelected',
                                scope: this
                            },
                            getItemTextTpl: function () {
                                return '<span>{code}<tpl if="leaf != true"><div class="ab-probtype-list-disclosure"></div></tpl></span>';
                            }
                        }
                    ],
                    listeners: {
                        initialize: function (promptPanel) {
                            var nestedList = promptPanel.down('nestedlist'),
                                store = nestedList.getStore(),
                                data = this.getProblemTypeData(),
                                button;

                            // Load the nested list data
                            store.setData(data);

                            // Add a Cancel button if we are running on a phone
                            if (Ext.os.is.Phone) {
                                button = Ext.factory({
                                    ui: 'iron',
                                    text: LocaleManager.getLocalizedString('Cancel', 'Common.control.prompt.ProblemType'),
                                    align: 'right',
                                    listeners: {
                                        tap: 'onCancelProblemType',
                                        scope: this
                                    }
                                }, 'Ext.Button');

                                if (nestedList) {
                                    nestedList.getToolbar().add(button);
                                }
                            }
                        },
                        scope: this
                    }
                }, config)
            );
        }
        return this.promptPanel;
    },

    /**
     * Adds the panel to the viewport. Sets the selected item in the list if the field value
     * is populated
     * @private
     */
    showPrompt: function () {
        var me = this,
            panel = this.getPromptPanel(),
            selectedNode = null;

        if (!panel.getParent()) {
            Ext.Viewport.add(panel);
        }

        var nestedList = panel.down('nestedlist');

        if (nestedList) {
            selectedNode = me.getSelectedNode(me.getValue(), nestedList);
            if (Ext.isEmpty(me.getValue())) {
                me.doBackToParent(nestedList);
            }
        }

        if (nestedList && selectedNode !== null) {
            nestedList.getActiveItem().select(selectedNode);
            // Defer to allow the store to load before scrolling to selected item
            Ext.defer(me.scrollToSelectedItem, 50, me, [nestedList]);
        }

        panel.show();
    },

    /**
     * Retrieves the Problem Type database from the client database and formats the data so it
     * can be consumed by the Tree store
     * @returns {Object}
     * @private
     */
    getProblemTypeData: function () {
        return Common.util.ProblemTypeData.generateProbtypeObject();
    },

    /**
     * Sets the value of the Problem Type field when an item is selected from the list
     * @param {Ext.dataview.NestedList} nestedList  The nested list
     * @param {Ext.dataview.List} list  The active list in the nested list
     * @param {Number} index  The index of the selected item in the list
     * @param {Object} target
     * @param {Ext.data.Model} record
     * @private
     */
    onProblemTypeSelected: function (nestedList, list, index, target, record, e) {
        var me = this,
            code = record.get('code');

        e.preventDefault();
        e.stopPropagation();

        me.setValue(code);
        setTimeout(function () {
            me.promptPanel.hide();
        }, 300);

    },

    /**
     * Hides the Problem Type list when the Cancel button is tapped
     * @private
     */
    onCancelProblemType: function () {
        this.promptPanel.hide();
    },

    /**
     * Resets the Problem Type nested list to the parent frame.
     * @param {Ext.dataview.NestedList} nestedList The nested list
     * @private
     */
    doBackToParent: function (nestedList) {
        var node = nestedList.getLastNode(),
            detailCard = nestedList.getDetailCard(),
            detailCardActive = detailCard && nestedList.getActiveItem() === detailCard,
            lastActiveList = nestedList.getLastActiveList();

        nestedList.doBack(nestedList, node, lastActiveList, detailCardActive);
    },

    /**
     * Returns the selected record in the nested list store
     * @param {String} value The value of the PromptField
     * @param {Ext.dataview.NestedList} nestedList  The nested list
     * @returns {Ext.data.Model} The selected node record
     * @private
     */
    getSelectedNode: function (value, nestedList) {
        var store = nestedList.getStore();
        return store.findRecord('code', value);
    },

    /**
     * Scrolls the list to the selected item
     * @param {Ext.dataview.NestedList} list The nested list
     * @private
     */
    scrollToSelectedItem: function (list) {
        var activeList = list.getActiveItem(),
            store = activeList.getStore(),
            selected = activeList.getSelection()[0],
            idx = store.indexOf(selected),
            map = activeList.getItemMap(),
            offset = map.map[idx];

        activeList.getScrollable().getScroller().scrollTo(0, offset);
    }
});