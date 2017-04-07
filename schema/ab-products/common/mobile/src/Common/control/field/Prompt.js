/**
 * A field used to display a prompt input.
 *
 * A simple prompt field for Employees
 *
 *      Ext.create('Ext.form.Panel',
 *         { fullscreen: true,
 *           items: [
 *               {
 *                   xtype: 'fieldset',
 *                       items: [
 *                           { xtype: 'prompt',
 *                             title: 'Employee',
 *                             label: 'Employee Code',
 *                             store: 'employeesStore',
 *                             displayFields: [
 *                                 {
 *                                    name: 'em_id',
 *                                    title: 'Employee Code',
 *                                 },
 *                                 {
 *                                    name: 'email',
 *                                    title: 'Email',
 *                                 }
 *                             ],
 *                           }
 *                        ]
 *                   }
 *               ]
 *          });
 *
 * ## Configuring Relationships Between Prompt Fields
 *
 *  There may be times when there are multiple prompt fields displayed on a form and you would like to have the
 *  prompts interact with each other. It is common to have location prompts of Building, Floor and Room on a form.
 *  The childFields and parentFields properties provide a way to set the relationship between prompt fields.
 *
 *  Setting the Relationship Between Building, Floor and Room Prompts
 *
 *     config: {
 *         items: [
 *               {
 *                   xtype: 'prompt',
 *                   name: 'bl_id',
 *                   label: 'Building Code',
 *                   title: 'Buildings',
 *                   store: 'buildingsStore',
 *                   displayFields: [
 *                       {
 *                           name: 'bl_id',
 *                           title: 'Building Code'
 *                     },
 *                       {
 *                           name: 'name',
 *                           title: 'Building'
 *                       }
 *                   ],
 *                   childFields: ['fl_id', 'rm_id']
 *               },
 *               {
 *                   xtype: 'prompt',
 *                   label: 'Floor Code',
 *                   title: 'Floor',
 *                   store: 'floorsStore',
 *                   displayFields: [
 *                       {
 *                           name: 'fl_id',
 *                           title: 'Floor Code'
 *                       },
 *                       {
 *                           name: 'bl_id',
 *                           title: 'Building Code'
 *                       }
 *                   ],
 *                   parentFields: ['bl_id'],
 *                   childFields: ['rm_id']
 *               },
 *               {
 *                   xtype: 'prompt',
 *                   name: 'rm_id',
 *                   label: 'Room Code',
 *                   title: 'Rooms',
 *                   store: 'roomsStore',
 *                   displayFields: [
 *                       {
 *                           name: 'rm_id',
 *                           title: 'Room Code'
 *                       },
 *                       {
 *                           name: 'fl_id',
 *                           title: 'Floor Code'
 *                       },
 *                       {
 *                           name: 'bl_id',
 *                           title: 'Building Code'
 *                       }
 *                   ],
 *                   parentFields: ['bl_id', 'fl_id']
 *               }
 *           ]
 *       }
 *
 *  In the previous example, the relationship between prompts is defined using the childFields and parentFields
 *  properties.
 *
 *  The prompt hierarchy is:
 *
 *     Building
 *         |_ Floor
 *              |_ Room
 *
 *  When a prompt value is selected, the prompt will apply a filter to the child prompts using the selected
 *  value. Selecting the HQ value from the building prompt will cause a filter of bl_id='HQ' to be applied to the
 *  floor and room prompts.
 *
 *  The parentFields property defines the prompts above the prompt in the hierarchy.
 *
 *  In the example, selecting a Room will update the floor prompt with the fl_id associated with the selected room and
 *  the building prompt with the bl_id associated with the selected room.
 *
 *  ## Modifying the Default Display Templates
 *
 *  The Prompt control has default display templates that
 *
 * @author Jeff Martin
 * @since 21.2
 */
Ext.define('Common.control.field.Prompt', {

    extend: 'Common.control.Text',

    requires: [
        'Common.control.field.PromptInput',
        'Common.util.Filter',
        'Common.plugin.ListPaging',
        'Common.control.Search',
        'Common.scripts.event.Android',
        'Common.env.Feature'
    ],

    xtype: 'prompt',

    config: {
        /**
         * @cfg {Boolean} clearIcon - The clear icon is not used in the PromptField. Always set it to false
         */
        clearIcon: true,
        /**
         * @cfg {Boolean} promptReadOnly - Sets the read only mode for the prompt control. This setting determines if the
         *      disclose graphic is displayed and if the prompt is displayed when tapped. This configuration is required
         *      because the read only state of the prompt control is different than the read only state of the prompt
         *      input component
         */
        promptReadOnly: false,

        /**
         * @cfg {Object} component The component of the field. The Ext.field.Input class is replaced with the extended
         *      Common.control.field.PromptInput class.
         */
        component: {
            xtype: 'promptinput',
            type: 'text'
        },

        /**
         * @cfg {Boolean} promptIsCleared True when the prompt is cleared. Flag used to prevent the popup from displaying
         * when the Clear icon is tapped.
         */
        promptIsCleared: false,

        /**
         * @cfg {String} store The store id of the store containing the data for the prompt
         */
        store: null,

        /**
         * @cfg {Object[]} displayFields Array of display field objects. The display fields are displayed in
         * the popup prompt
         * The object configuration contains a field property and a title property. The field property is the field name
         * of the field in the Ext.data.Model instance.
         * The title property is displayed in the list header
         *
         * Example: Prompt for the Building Table
         *
         *     {
         *           xtype: 'prompt',
         *           name: 'bl_id',
         *           label: 'Building',
         *           title: 'Buildings',
         *           store: 'buildingsStore',
         *           displayFields: [
         *               {
         *                   name: 'bl_id',
         *                   title: 'Code'
         *               },
         *               {
         *                   name: 'name',
         *                   title: 'Building'
         *               }
         *           ]
         *       },
         *
         *
         *
         */
        displayFields: null,

        // @cfg {String[]} selectedFields The fields from the selection list that will compose the value displayed in the prompt field input element.
        selectedFields: null,

        /**
         * @cfg {String} title The title that is displayed in the prompt view title bar.
         */
        title: '',

        /**
         * @cfg {String} valueField The name of the field in the store that is set when the prompt list is
         * tapped.
         */
        valueField: null,

        /**
         * @cfg {String[]} childFields The field names of each prompt that is a child of this prompt.
         * The childFields array is used to set the relationship between prompts in a fieldset.
         *
         * The values of the child prompts will be cleared when a prompt value is selected. The filters of the child
         * prompts will be set when the prompt value is changed.
         */
        childFields: [],

        /**
         * @cfg {String[]} parentFields The field names of each prompt that is a parent of this prompt. When a prompt
         * value is selected the prompt will set the values in the parent prompts to the parent values of the selected
         * value.
         */
        parentFields: [],

        /**
         * @cfg {String/Object} displayTemplate The template used to display the items in the prompt list. If a
         * displayTemplate configuration is not provided the Prompt control generates a default template using the
         * displayFields values.
         *
         * Setting a template to be used by both the tablet and phone profiles
         *
         *     displayTemplate: '<div>{bl_id} {name}</div>'
         *
         * Setting a different template for phone and tablet profiles
         *
         *     displayTemplate {
         *                       phone: '<div>{bl_id}</div><div>{name}</div>',
         *                       tablet: '<div>{bl_id} Building: {name}</div>'
         *                     }
         *
         * If a template is not defined for a profile the profile will use the default template.
         */
        displayTemplate: '',


        /**
         * @cfg {Boolean} autoPaging True to automatically load the next page when you scroll to the bottom of the list.
         */
        autoPaging: false,


        /**
         * @cfg {String/Object} headerTemplate The template used to display the prompt item header. The template is generated
         * using the displayFields configuration if a headerTemplate value is not provided
         *
         * Setting a template to be used by both the tablet and phone profiles
         *
         *     headerTemplate: '<div>Building</div>'
         *
         * Setting a different template for phone and tablet profiles
         *
         *     headerTemplate {
         *                       phone: '<div>Building</div>',
         *                       tablet: '<div>Building Code Building Name</div>'
         *                     }
         *
         * If a template is not defined for a profile the profile will use the default template.
         */
        headerTemplate: '',

        /**
         * @cfg {Boolean} disableFilter Prevents the filter from being applied as a parent filter for other prompt fields.
         * Setting this value to true can be useful in scenarios where the prompt is used as part of a location or
         * organization hierarchy you wish to not include the prompt field in the filters generated by the other
         * prompt fields.
         *
         * This setting is used in the Maintenance app Create/Update Work Request form. The site prompt is hidden in this
         * form and does not participate in the filtering of the site child fields.
         *
         */
        disableFilter: false,

        /**
         * @cfg {Boolean} resetParentValueOnClear When true, resets the value of the parent prompt field when the prompt is reset.
         * This setting can used to include a prompt field in a hierarchal combination when the top level prompt is hidden.
         */
        resetParentValueOnClear: false,

        /**
         * @cfg {String} searchFieldPlaceHolderText The place holder text displayed in the search field.
         */
        searchFieldPlaceHolderText: '',

        /**
         * @cfg {Boolean} enableBarcodeScanning Displays the Barcode icon and allows barcode scanning when true.
         */
        enableBarcodeScanning: false,

        /**
         * @cfg {Boolean} promptIsScanned True when the prompt is scanned. Flag used to prevent the popup from displaying
         * when the Barcode icon is tapped.
         */
        promptIsScanned: false,

        /**
         * @cfg {Array} barcodeFormat Defines how the sccaned value should be parsed. Used since 23.1 for supporting multi-key barcode values.
         */
        barcodeFormat: [],

        /**
         * A button configuration that will display a button in the title bar. The button can be used to add an addtitional action to the
         * prompt view.
         */
        optionButton: null,

        /**
         * @private
         */
        keyValue: null

        /**
         * @event promptTapped Fired when the input field is single tapped
         * @param {Common.control.field.Prompt} this. The Prompt
         */
    },


    /**
     * Flag used to prevent recursive calls when child prompt values are cleared.
     * @private
     */
    disableClear: false,

    noRecordsText: LocaleManager.getLocalizedString('No data to display for: {0}', 'Common.control.field.Prompt'),

    // @private
    initialize: function () {
        var me = this;

        me.callParent();

        me.getComponent().on({
            scope: this,

            keyup: 'onKeyUp',
            change: 'onChange',
            focus: 'onFocus',
            paste: 'onPaste',
            mousedown: 'onMouseDown',
            clearicontap: 'onClearIconTap',
            barcodeicontap: 'onBarcodeIconTap'
        });

        me.element.addCls('x-prompt-clearicon');
        me.element.addCls('x-prompt-barcode');

        // set the originalValue of the textfield, if one exists
        me.originalValue = me.originalValue || "";
        me.getComponent().originalValue = me.originalValue;

        me.displayBarcodeIcon(me.getEnableBarcodeScanning() && !me.getPromptReadOnly());

        me.syncEmptyCls();

        // Added code
        me.on('singletap', me.onPromptFieldTapped, me, {
            element: 'element'
        });

        // Always set the input field to read only
        me.getComponent().setReadOnly(me);

        // class used to distinguish prompt fields for setting the background color for read-only fields
        me.getComponent().addCls('x-prompt-input');

        me.resetFilter();

    },

    displayBarcodeIcon: function (config) {
        var barcodeIcon = this.getComponent().barcodeIcon;

        if (config) {
            barcodeIcon.show();
        } else {
            barcodeIcon.hide();
        }
    },

    applyReadOnly: function (config) {
        var me = this;
        if (config) {
            me.element.addCls('x-prompt-readonly');
            me.element.removeCls('x-field-clearable');

            //hide the barcode icon when the field is read only
            me.displayBarcodeIcon(false);
        } else {
            me.element.removeCls('x-prompt-readonly');
            me.element.addCls('x-field-clearable');
        }

        me.setPromptReadOnly(config);

        // Always set the input field to read only
        me.getComponent().setReadOnly(true);
    },

    applyPromptIsCleared: function (config) {
        var me = this,
            searchField,
            list;

        if (config && config === true) {
            if (me.listPanel) {
                searchField = me.listPanel.query('search');
                list = me.listPanel.query('list');
                searchField[0].setValue('');
                list[0].deselectAll(true);
            }
        }

        return config;
    },

    onPromptFieldTapped: function () {
        // Don't fire this event if the control is in read only mode
        var me = this,
            isReadOnly = me.getPromptReadOnly(),
            promptIsCleared = me.getPromptIsCleared(),
            promptIsScanned = me.getPromptIsScanned();

        if (promptIsCleared) {
            me.setPromptIsCleared(false);
            return;
        }

        if (promptIsScanned) {
            me.setPromptIsScanned(false);
            return;
        }

        if (isReadOnly) {
            return;
        }
        me.showPrompt();
        me.fireEvent('promptTapped', me);
    },

    onClearIconTap: function (e) {
        var me = this;

        me.setPromptIsCleared(true);

        //handle custom app level code before clear child prompts
        me.fireAction('clearicontap', [this, e], 'doClearIconTap');

        me.clearChildPrompts();
        me.onClearFilter();
    },

    // @private
    doClearIconTap: function (me) {
        me.setValue('');

        //sync with the input
        me.getValue();
    },

    // @private
    showClearIcon: function () {
        var me = this,
            value = me.getValue(),
        // allows value to be zero but not undefined, null or an empty string (other falsey values)
            valueValid = value !== undefined && value !== null && value !== '';

        // Override. Do not display the clear icon if the prompt is readonly
        if (me.getPromptReadOnly()) {
            return me;
        }

        if (me.getClearIcon() && !me.getDisabled() && !me.getReadOnly() && valueValid) {
            me.element.addCls(Ext.baseCSSPrefix + 'field-clearable');
        }

        return me;
    },

    onBarcodeIconTap: function (e) {
        var me = this;

        me.setPromptIsScanned(true);

        //handle custom app level code before clear child prompts
        me.fireAction('barcodeicontap', [this, e], 'doBarcodeIconTap');
    },

    doBarcodeIconTap: function () {
        var me = this,
            value;

        Common.device.Barcode.scanAndDecode(me.getBarcodeFormat())
            .then(function (scanResult) {
                    // Update field
                    if (scanResult.fields) {
                        value = scanResult.fields[me.getName()];
                    } else {
                        value = scanResult.code;
                    }

                    me.setValue(value);

                    // if multi-key barcode was scanned, update parent prompt fields
                    if (value !== scanResult.code) {
                        me.setParentScannedValues(scanResult.fields);
                    }

                    me.fireEvent('scancomplete', scanResult);
                },
                function (error) {
                    me.setReadOnly(false);
                    Ext.Msg.alert(me.errorTitle, error);
                });
    },

    /**
     * Returns a reference to the prompt field identified by the promptValueField
     * @param {String} promptValueField
     * @returns {Common.control.field.Prompt}
     */
    getPromptField: function (promptValueField) {
        var parent = this.getParent(),
            promptField,
            grandParent;

        promptField = parent.down('prompt[name=' + promptValueField + ']');

        if (Ext.isEmpty(promptField)) {
            grandParent = parent.getParent();
            if (grandParent) {
                promptField = grandParent.down('prompt[name=' + promptValueField + ']');
            }
        }

        return Ext.isEmpty(promptField) ? null : promptField;
    },

    updateValue: function (newValue) {
        var me = this;

        if (newValue) {
            me.setParentValues();
            me.setChildFilter(newValue);
            me.clearChildPrompts();
        }

        // callParent must be called after setting the parent values and child prompt filters.
        // See KB 3045526
        me.callParent(arguments);
    },

    applyStore: function (store) {
        if (store) {
            store = Ext.data.StoreManager.lookup(store);
        }
        return store;
    },

    getPromptPanel: function () {
        var me = this,
            config = {},
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

        if (!me.listPanel) {
            me.listPanel = Ext.create('Ext.Panel', Ext.apply({
                width: '80%',
                height: '60%',
                modal: true,
                hideOnMaskTap: true,
                left: '10%',
                top: '10%',
                layout: 'vbox',
                zIndex: 12,
                border: 2,
                style: 'border-color: black; border-style: solid;'
            }, config));

            me.listPanel.add(me.getTitleBar());
            // If this is a phone profile, add the search field panel
            if (Ext.os.is.Phone) {
                me.listPanel.add({
                    xtype: 'toolbar',
                    docked: 'top',
                    items: [
                        {
                            xtype: 'search',
                            name: 'phoneSearch' + this.getTitle(),
                            centered: true,
                            placeHolder: me.getSearchFieldPlaceHolderText(),
                            listeners: {
                                searchkeyup: me.onApplyFilter,
                                searchclearicontap: me.onClearFilter,
                                scope: me
                            }
                        }
                    ]
                });
            }

            // Add the list header
            me.listPanel.add({
                xtype: 'container',
                html: this.getHeaderTemplate()
            });

            // Add the list
            me.listPanel.add({
                xtype: 'list',
                store: store,
                scrollToTopOnRefresh: false,
                itemTpl: this.getDisplayTemplate(),
                flex: 1,
                emptyText: '<div class="ab-empty-text">' + Ext.String.format(me.noRecordsText, me.getLowerCaseTitleString(me.getTitle())) + '</div>',
                plugins: {
                    xclass: 'Common.plugin.ListPaging',
                    autoPaging: me.getAutoPaging()
                },
                listeners: {
                    itemtap: me.onListTap,
                    scope: me
                }
            });

            // Add a tool bar on the bottom of the view for HTC phones to compensate for the soft navigation bar.
            if(Common.env.Feature.isHTCPhone) {
                me.listPanel.add({
                    xtype: 'toolbar',
                    docked: 'bottom',
                    style: 'background-color: black'
                });
            }
        }

        me.listPanel.addListener('show', function (panel) {
            // Refresh the list when the prompt is displayed
            panel.down('list').refresh();
        });

        me.listPanel.addListener('hide', function () {
            me.removeKeyboardEvents();
        }, me);

        return me.listPanel;
    },

    /**
     * Returns a Ext.TitleBar that contains an Ext.Button for phone profiles or a Ext.SearchField for
     * tablet profiles
     * @returns {Ext.TitleBar}
     */
    getTitleBar: function () {
        var titleBar,
            titleBarConfig = {
                docked: 'top',
                title: this.getTitle()
            },
            optionButtonConfig = this.getOptionButton(),
            defaultOptionConfig = {
                xtype: 'button',
                align: 'right',
                listeners: {
                    tap: this.onOptionButtonTap,
                    scope: this
                }
            },
            optionConfig;

        titleBar = Ext.factory(titleBarConfig, 'Ext.TitleBar');

        if (optionButtonConfig) {
            optionConfig = Ext.merge(defaultOptionConfig, optionButtonConfig);
            titleBar.add(optionConfig);
        }

        if (Ext.os.is.Phone) {
            titleBar.add({
                xtype: 'button',
                text: LocaleManager.getLocalizedString('Done', 'Common.control.field.Prompt'),
                align: 'right',
                listeners: {
                    tap: this.onCancelPrompt,
                    scope: this
                }
            });
        } else {
            titleBar.add({
                xtype: 'search',
                name: 'search' + this.getTitle(),
                align: 'right',
                style: 'margin-right:.5em',
                placeHolder: this.getSearchFieldPlaceHolderText(),
                listeners: {
                    searchkeyup: this.onApplyFilter,
                    searchclearicontap: this.onClearFilter,
                    scope: this
                }
            });
        }

        return titleBar;
    },

    /**
     * Sets the first character of the title string to lower case
     * @private
     */
    getLowerCaseTitleString: function (title) {
        var lowerCaseTitle = title;

        if (lowerCaseTitle && lowerCaseTitle.length > 1) {
            lowerCaseTitle = lowerCaseTitle.charAt(0).toLowerCase() + lowerCaseTitle.substring(1);
        }
        return lowerCaseTitle;
    },

    showPrompt: function () {
        var me = this,
            listPanel = me.getPromptPanel(),
            pagingPlugin = listPanel.query('list')[0].getPlugins()[0],
            store = me.getStore();

        if (!listPanel.getParent()) {
            Ext.Viewport.add(listPanel);
        }

        // Execute the list paging plugin onStoreLoad function
        // to force the Load More.. text to display. We need to do this because
        // the store is loaded before the list is created.
        if (pagingPlugin) {
            pagingPlugin.onStoreLoad(store);
        }

        AndroidEvent.on('hidekeyboard', me.onHideKeyboard, me);

        listPanel.show();
    },

    onListTap: function (list, index, target, record, e) {
        var me = this,
            valueField = me.getValueField();

        e.preventDefault();
        e.stopPropagation();

        if (record) {
            me.setRecord(record);
            me.setValue(record.get(valueField)).then(function () {
                setTimeout(function () {
                    me.listPanel.hide();
                }, 300);
            });
            me.fireEvent('itemselected', record, me);
        } else {
            setTimeout(function () {
                me.listPanel.hide();
            }, 300);
        }
    },

    setValue: function (newValue) {
        var me = this,
            value = '',
            valueField = me.getValueField(),
            store = me.getStore(),
            filterArray = [],
            record;

        me.setKeyValue(newValue);
        me.callParent(arguments);

        if (!Ext.isEmpty(me.getValue()) && me.getSelectedFields()) {
            filterArray.push(Ext.create('Common.util.Filter', {
                property: valueField,
                value: me.getValue(),
                exactMatch: true
            }));
            return store.retrieveAllRecords(filterArray)
                .then(function (records) {
                    if (records.length > 0) {
                        record = records[0];
                        // compose the value to show in the input element from the values of the fields displayed in the list
                        if (Ext.isArray(me.getSelectedFields())) {
                            Ext.each(me.getSelectedFields(), function (field) {
                                if (!Ext.isEmpty(record.get(field))) {
                                    value += record.get(field) + ' ';
                                }
                            });

                            me.selectedValue = value.trim();

                        } else {
                            me.selectedValue = record.get(me.selectedFields);
                        }

                        if (!Ext.isEmpty(me.selectedValue)) {
                            // set the value directly in the input dom element to avoid changing the record
                            me.getComponent().input.dom.value = me.selectedValue;
                        }
                    }
                });
        } else {
            return Promise.resolve();
        }
    },

    getValue: function () {
        var me = this;
        return me.getKeyValue();
    },

    onCancelPrompt: function () {
        this.listPanel.hide();
    },

    onApplyFilter: function (value) {
        var me = this,
            store = me.getStore(),
            fields = me.getDisplayFields(),
            filterArray = [],
            parentPrompts = me.getParentPrompts();

        // Create filters for the existing parent values
        Ext.each(parentPrompts, function (parentPrompt) {
            var parentValue = parentPrompt.getValue(),
                filter,
                disableFilter = parentPrompt.getDisableFilter();

            if (parentValue !== null && parentValue !== '') {
                filter = Ext.create('Common.util.Filter', {
                    property: parentPrompt.getValueField(),
                    value: parentPrompt.getValue(),
                    conjunction: 'AND',
                    anyMatch: false
                });
                if (!disableFilter) {
                    filterArray.push(filter);
                }
            }
        }, me);

        // Create Child Filters
        Ext.each(fields, function (field) {
            var filter = Ext.create('Common.util.Filter', {
                property: field.name,
                value: value,
                conjunction: 'OR',
                anyMatch: true
            });
            filterArray.push(filter);
        });

        store.clearFilter();
        store.setFilters(filterArray);
        store.loadPage(1);
    },

    setChildFilter: function (promptValue) {
        // Get the child prompt
        var me = this,
            childFields = me.getChildFields(),
            parentPrompts = me.getParentPrompts(),
            promptValueField = me.getValueField(),
            filters = [];

        // TODO: Parent Prompt get filter is duplicated, refactor
        // Get filters from the parent prompt values
        Ext.each(parentPrompts, function (parentPrompt) {
            var parentFieldName = parentPrompt.getValueField(),
                parentValue = parentPrompt.getValue(),
                disableFilter = parentPrompt.getDisableFilter();
            if (!disableFilter) {
                filters.push({field: parentFieldName, value: parentValue});
            }
        }, me);


        // Prepare the filter for the child prompts
        filters.push({field: promptValueField, value: promptValue});

        // Get the child prompts
        Ext.each(childFields, function (childField) {
            var childPromptField = me.getPromptField(childField),
                childStore,
                childModel;

            if (childPromptField === null) {
                return;
            }

            childStore = childPromptField.getStore();
            childStore.clearFilter();

            Ext.each(filters, function (filter) {
                childModel = childStore.getModel();
                if (childModel.getFields().containsKey(filter.field)) {
                    childStore.filter(filter.field, filter.value);
                }
            }, me);

            childStore.loadPage(1, function (records) {
                if (records.length === 0) {
                    childPromptField.setPlaceHolder(Ext.String.format(me.noRecordsText, me.getLowerCaseTitleString(childPromptField.getTitle())));
                } else {
                    childPromptField.setPlaceHolder('');
                }
            });
        }, me);
    },

    clearChildPrompts: function () {
        var me = this,
            childFields = me.getChildFields();

        if (me.disableClear) {
            return;
        }

        Ext.each(childFields, function (childField) {
            var childPromptField = me.getPromptField(childField),
                childPromptValue;

            if (childPromptField === null) {
                return;
            }

            childPromptValue = childPromptField.getValue();

            if (childPromptValue !== '') {
                childPromptField.setRecord(null);
                childPromptField.setValue('');
            }
            childPromptField.setPlaceHolder('');

        }, me);
    },

    setParentValues: function () {
        var me = this,
            parentPrompts = me.getParentPrompts();

        Ext.each(parentPrompts, function (parentPrompt) {
            var record = me.getRecord(),
                parentFieldName = parentPrompt.getName(),
                value;

            if (record !== null) {
                value = record.get(parentFieldName);
                parentPrompt.disableClear = true;
                parentPrompt.setValue(value);
                parentPrompt.disableClear = false;
            }
        }, me);
    },

    /**
     * Set values from parent prompt fields from scanned value.
     * @param fields
     */
    setParentScannedValues: function (fields) {
        var me = this,
            parentPrompts = me.getParentPrompts();

        Ext.each(parentPrompts, function (parentPrompt) {
            var parentFieldName = parentPrompt.getName(),
                value;

            if (fields !== null) {
                value = fields[parentFieldName];
                parentPrompt.disableClear = true;
                parentPrompt.setValue(value);
                parentPrompt.disableClear = false;
            }
        }, me);
    },

    onClearFilter: function () {
        var me = this,
            store = me.getStore(),
            parentPrompts = me.getParentPrompts(),
            filters = [],
            childFields = me.getChildFields(),
            resetParentPromptOnClear = me.getResetParentValueOnClear();

        Ext.each(parentPrompts, function (parentPrompt) {
            var parentValue = parentPrompt.getValue(),
                filter,
                disableFilter = parentPrompt.getDisableFilter();

            if (parentValue !== null && parentValue !== '' && !disableFilter) {
                filter = Ext.create('Common.util.Filter', {
                    property: parentPrompt.getValueField(),
                    value: parentPrompt.getValue(),
                    conjunction: 'AND',
                    anyMatch: false
                });
                filters.push(filter);
            }

            if (resetParentPromptOnClear) {
                parentPrompt.disableClear = true;
                parentPrompt.setValue('');
                parentPrompt.disableClear = false;
            }
        }, me);

        // Clear filter
        if (store) {
            store.clearFilter();
            Ext.each(filters, function (filter) {
                store.filter(filter);
            }, me);
            store.loadPage(1);
        }

        // Clear child filters
        Ext.each(childFields, function (childField) {
            var childPrompt = me.getPromptField(childField),
                childStore;

            if (childPrompt === null) {
                return;
            }

            childStore = childPrompt.getStore();

            childStore.clearFilter();
            Ext.each(filters, function (filter) {
                childStore.filter(filter);
            }, me);
            childStore.loadPage(1);
        }, me);

    },

    applyHeaderTemplate: function (config) {
        return this.doApplyTemplate(config, 'header');
    },

    applyDisplayTemplate: function (config) {
        return this.doApplyTemplate(config, 'list');
    },

    /**
     * @private
     */
    doApplyTemplate: function (config, templateType) {
        var me = this,
            displayFields,
            numberOfDisplayFields,
            headerTemplate = '<div class="prompt-list-label">{0}</div>',
            headerItemTemplate = '<h3 style="width:xx%">{0}</h3>',
            listTemplate = '<div class="prompt-list-hbox">{0}</div>',
            listItemTemplate = '<div style="width:xx%">{{0}}</div>',
            templateText = '',
            profile = Ext.os.is.Phone ? 'phone' : 'tablet',
            template,
            itemTemplate,
            width = 30;

        if (Ext.isObject(config)) {
            if (config[profile]) {
                config = config[profile];
            } else {
                config = '';
            }
        }

        // We are finished if the template is defined in the prompt config.
        if (config !== '') {
            return config;
        }

        displayFields = me.getDisplayFieldsByProfile();
        numberOfDisplayFields = displayFields.length;

        // Calculate the display width for each field
        if (numberOfDisplayFields > 0) {
            width = 100 / numberOfDisplayFields;
        }

        listItemTemplate = listItemTemplate.replace('xx', width.toString());
        headerItemTemplate = headerItemTemplate.replace('xx', width.toString());

        //<debug>
        if (numberOfDisplayFields > 4) {
            Ext.Logger.warn('The prompt control is displaying more that four fields. This may cause problems rendering the prompt.');
        }
        //</debug>

        template = templateType === 'header' ? headerTemplate : listTemplate;
        itemTemplate = templateType === 'header' ? headerItemTemplate : listItemTemplate;

        Ext.each(displayFields, function (field) {
            var item = templateType === 'header' ? field.title : field.name;
            templateText += Ext.String.format(itemTemplate, item);
        }, me);

        return Ext.String.format(template, templateText);
    },

    /**
     * Returns the displayFields for the current profile depending on the value of the
     * displayField profile property. The profile property can be one of 'all', 'tablet', or 'phone'
     * The field is included in the current profile using the following rule:
     *
     *  all - The field is included in the phone and tablet profile
     *  phone - The field is only included in the phone profile
     *  tablet - The field is only included in the tablet profile
     *  empty - If the profile property is not specified the field is included in both the tablet and phone
     *  profile
     * @returns {Array}
     */
    getDisplayFieldsByProfile: function () {
        var displayFields = this.getDisplayFields(),
            profile = Ext.os.is.Phone ? 'phone' : 'tablet',
            displayFieldsByProfile = [];

        Ext.each(displayFields, function (displayField) {
            if (!displayField.hasOwnProperty('profile')) {
                displayField.profile = 'all';
            }
            if (displayField.profile === profile || displayField.profile === 'all') {
                displayFieldsByProfile.push(displayField);
            }
        }, this);

        return displayFieldsByProfile;
    },

    getParentPrompts: function () {
        var me = this,
            parentFields = me.getParentFields(),
            parentPrompts = [];

        Ext.each(parentFields, function (parentFieldName) {
            var promptField = me.getPromptField(parentFieldName);

            if (promptField && promptField !== null) {
                parentPrompts.push(promptField);
            }
        }, me);

        return parentPrompts;
    },

    /**
     * Override valueField getter
     */
    getValueField: function () {
        var me = this;

        if (me._valueField !== null) {
            return me._valueField;
        } else {
            return me.getName();
        }
    },

    /**
     * Resets the filter of the prompt store
     * Used to initialize the filter on start up.
     */
    resetFilter: function () {
        var store = this.getStore();
        if (store && store.getFilters().length > 0) {
            store.clearFilter();
            store.loadPage(1);
        }
    },

    onHideKeyboard: function () {
        var me = this,
            searchField;

        if (me.listPanel) {
            searchField = me.listPanel.query('search');
            if (Ext.isFunction(searchField[0].blur)) {
                searchField[0].blur();
            }
        }
    },

    removeKeyboardEvents: function () {
        AndroidEvent.un('hidekeyboard', this.onHideKeyboard, this);
    },

    hidePromptView: function() {
        if(this.listPanel) {
            this.listPanel.hide();
        }
    },

    /**
     * Fires the optiontap event when the optional button is tapped.
     */
    onOptionButtonTap: function () {
        this.fireEvent('optiontap', this);
    }
});