/**
 * @since 21.1
 * @author Jeff Martin
 */
Ext.define('Common.control.field.TextArea', {
    extend: 'Ext.field.TextArea',

    requires: 'Common.util.Environment',

    xtype: 'commontextareafield',

    config: {
        autoComplete: 'off',

        /**
         * @cfg {String} title The title that is displayed on the popup view
         */
        title: null,

        /**
         * @cfg {Boolean} displayEditPanel true to display the popup text edit panel
         */
        displayEditPanel: false,

        /**
         * @cfg {Booleam} useFieldDefLabel true to use multiline heading from TableDef as field label,
         * or false to use defined label.
         */
        useFieldDefLabel: true,

        /**
         * @cfg {Boolean} useNativeEditPanel Displays the native text area component when true and when running on the device.
         */
        useNativeTextArea: false
    },

    clearIconTapped: false,

    initialize: function () {
        var me = this,
            inputComponent = this.getComponent(),
            viewport = Ext.ComponentQuery.query('viewport')[0],
            displayEditPanel = me.getDisplayEditPanel();

        me.callParent();

        // Hide the text input overlay
        if (Ext.os.is.Android) {
            inputComponent.addCls('android-hide-overlay');
        }

        me.element.on('tap', me.onTextAreaTap, me);
        me.element.on('focus', function () {
            this.blur();
        }, this);

        if (displayEditPanel) {
            me.on('focus', function () {
                me.blur();
            }, me);
        }
        viewport.on('orientationchange', 'onOrientationChange', me, {buffer: 50});


    },

    onOrientationChange: function () {
        this.onTextPanelPainted();
    },

    onInputChange: function () {
        this.fireEvent('inputchanged', this);
    },

    // @private
    // @override
    doClearIconTap: function (me) {
        // Set the clearIconTapped flag to prevent the edit panel from displaying
        me.clearIconTapped = true;
        me.setValue('');

        //sync with the input
        me.getValue();
    },


    getTextPanel: function () {
        var me = this,
            config = {},
            textAreaField,
            title,
            titleContainer;

        if (!me.textPanel) {
            me.textPanel = Ext.create('Ext.Panel', Ext.apply({
                modal: true,
                zIndex: 30,
                scrollModifier: 1.8,
                scrollable: null,
                width: '100%',
                height: '100%',
                top: 0,
                items: [
                    {
                        xtype: 'titlepanel',
                        style: 'border-top:1px solid white',
                        hidden: true
                    },
                    {
                        xtype: 'textareafield',
                        clearIcon: false
                    },
                    {
                        xtype: 'titlebar',
                        docked: 'top',
                        items: [
                            {
                                xtype: 'button',
                                text: LocaleManager.getLocalizedString('Apply', 'Common.control.field.TextArea'),
                                align: 'right',
                                listeners: {
                                    tap: 'onAccept',
                                    scope: this
                                }
                            },
                            {
                                xtype: 'button',
                                text: LocaleManager.getLocalizedString('Cancel', 'Common.control.field.TextArea'),
                                align: 'left',
                                listeners: {
                                    tap: 'onCancel',
                                    scope: this
                                }
                            }
                        ]
                    }
                ],
                listeners: {
                    painted: 'onTextPanelPainted',
                    scope: me
                }
            }, config));

            me.textPanel.element.on('drag', me.onTouchMove, me);
            textAreaField = me.textPanel.query('textareafield')[0];
            textAreaField.getComponent().addCls('android-hide-overlay');
            textAreaField.on('keyup', me.onInputChange, me);

            title = me.getTitle();
            if(title) {
                titleContainer = me.textPanel.down('titlepanel');
                titleContainer.setHidden(false);
                titleContainer.setTitle(title);
            }
        }
        return me.textPanel;
    },

    onTextAreaTap: function (e) {
        var me = this,
            displayEditPanel = me.getDisplayEditPanel(),
            useNativeTextArea = me.getUseNativeTextArea(),
            textPanel = me.getTextPanel(),
            isReadOnly = me.getReadOnly(),
            textAreaField;

        e.stopPropagation();

        if (!displayEditPanel) {
            return;
        }

        if (me.clearIconTapped) {
            me.clearIconTapped = false;
            return;
        }

        // The native TextArea component is not available on the Windows Phone platform.
        if(displayEditPanel && useNativeTextArea && Environment.getNativeMode() && !Ext.os.is.WindowsPhone) {
            me.showNativeTextArea();
            return;
        }


        textAreaField = textPanel.down('textareafield');

        if (isReadOnly) {
            textPanel.query('titlebar button')[1].setHidden(true);

            textAreaField.on('focus', function (field, e) {
                e.stopPropagation();
                field.blur();
            });
        } else {
            textAreaField.on('focus', function (field, e) {
                e.stopPropagation();
            });
        }

        textAreaField.on('tap', function (e) {
            e.stopPropagation();
        }, me, {element: 'innerElement'});

        textAreaField.setReadOnly(isReadOnly);
        textAreaField.setValue(me.getValue());

        if (!textPanel.getParent()) {
            Ext.Viewport.add(textPanel);
        }

        textPanel.show();
    },

    showNativeTextArea: function() {
        var me = this,
            originalValue = me.getValue(),
            maxLength = me.getMaxLength(),
            readOnly = me.getReadOnly();

        maxLength = Ext.isEmpty(maxLength) ? 5000 : maxLength;
        readOnly = Ext.isEmpty(readOnly) ? false: readOnly;

        TextArea.openTextArea(originalValue, maxLength, readOnly, function(result) {
            if(!result.cancelled) {
                me.setValue(result.text);
            }
        });
    },

    onTextPanelPainted: function () {
        var me = this,
            textPanel = me.textPanel,
            height,
            width;

        if (me.textPanel) {
            height = textPanel.element.down('.x-panel-inner').getHeight();
            width = textPanel.element.down('.x-panel-inner').getWidth();
            textPanel.down('textareafield').setHeight(height);
            textPanel.down('textareafield').setWidth(width);
        }
    },

    onAccept: function (button, e) {
        var me = this;

        e.preventDefault();
        me.setValue(me.textPanel.down('textareafield').getValue());

        setTimeout(function () {
            me.textPanel.hide();
        }, 300);

    },

    onCancel: function (button, e) {
        var me = this;

        e.preventDefault();
        setTimeout(function () {
            me.textPanel.hide();
        }, 300);
    },

    onTouchMove: function (e) {
        var textPanel = this.textPanel;
        textPanel.down('textareafield').element.down('textarea').dom.scrollTop -= (e.deltaY / 1.8);
    }

});