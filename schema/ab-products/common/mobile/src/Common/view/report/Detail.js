/**
 * A detail report view that generates the view dymaically using the supplied configuration properties.
 *
 * The {@link Common.view.report.Detail} class supports displaying a single item using a {@link Ext.data.Model} record
 * or a list of items using the {@link Ext.data.Store} store class.
 *
 *  Example: Using a TableDef object to supply the report labels and the report field formats simplifies the class configuration
 *
 *     var tableDef = TableDef.getTableDefWithFieldDefsAsObject('site');
 *     var fieldsToDisplay = [
 *                             'site_photo',
 *                             'site_id',
 *                             'name',
 *                             'city_id',
 *                             'state_id',
 *                             'ctry_id',
 *                             'area_gross_ext',
 *                             'area_gross_int',
 *                             'area_rentable',
 *                             'area_usable'
 *                           ];
 *
 *      var reportView = Ext.create('Common.view.report.Detail', {
 *                                        fieldsToDisplay: fieldsToDisplay,
 *                                        tableDef: tableDef,
 *                                        record: record
 *                                    });
 *
 *      reportView.show();
 *
 * Report views can be defined by specifying each of the fields to be be displayed by using the fieldsToDisplay
 * configuration.
 *
 *   Example: A Building detail report using the {@link Common.model.Building} model as the data source
 *
 *     var reportConfg = {
 *         title: 'Building',
 *         fieldsToDisplay = [
 *             {name: 'site_id', label: 'Site Code'},
 *             {name: 'bl_id', label: 'Building Code'},
 *             {name: 'name', lable: 'Site'}
 *         ],
 *         record: buildingRecord
 *     };
 *
 *     var reportView = Ext.create('Common.view.report.Detail', reportConfig);
 *
 *     reportView.show();
 *
 * Report views can be display multiple records if a {@link Ext.data.Store} is used as the data source.
 *
 *    Example: A report view displaying multiple Employee records
 *
 *    var reportConfig = {
 *        title: 'Employees',
 *        fieldsToDisplay: ['em_id','name_first','name_last'],
 *        tableDef: TableDef.getTableDefWithFieldDefsAsObject('em'),
 *        store: Ext.getStore('employeesStore')
 *    }
 *
 *    var reportView = Ext.create('Common.view.report.Detail', reportConfig);
 *    store.load(function() {
 *        reportView.show();
 *    });
 *
 * @since 21.4
 * @author Jeff Martin
 */
Ext.define('Common.view.report.Detail', {

    /**
     * @property {Object} defaultViewConfig
     */
     defaultViewConfig: {
        itemId: 'detailview',
        showAnimation: {
            type: 'fade',
            direction: 'in',
            duration: 200
        },
        items: [
            {
                xtype: 'titlebar',
                docked: 'top',
                hidden: !(!!Ext.os.is.Phone),
                items: [
                    {
                        xtype: 'button',
                        iconCls: 'delete',
                        itemId: 'doneButton',
                        align: 'right'
                    }
                ]
            },
            {
                xtype: 'container',
                itemId: 'dataContainer'
            }
        ]
    },

    /**
     * @property {Object} defaultViewTabletConfig The default configuration used when the app is executing in
     * the tablet profile
     */
    defaultViewTabletConfig: {
        modal: true,
        width: 430,
        height: 0,
        minContainerHeight: 300,
        maxContainerHeight: 600,
        centered: true,
        border: 3,
        cls: 'ab-report-container'
    },

    /**
     * @property {Object} defaultViewPhoneConfig The default configuratio applied to the view when the app is
     * using the phone profile
     */
    defaultViewPhoneConfig: {
        height: '100%',
        width: '100%',
        minContainerHeight: '100%',
        maxContainerHeight: '100%',
        scrollable: true,
        zIndex: 20
    },

    /**
     * @property {Ext.Container} container The main view container
     */
    container: null,

    /**
     * @property {String} dateFormat The date format applied to date fields used in the template
     */
    dateFormat: LocaleManager.getLocalizedDateFormat(),

    config: {
        /**
         * @cfg {String} title The view title
         */
        title: null,

        /**
         * @cfg {Object[]/Array} fieldsToDisplay An array of objects or strings containing the fields to display in the report
         * view.
         * The valid object properties are:
         *
         *  - `name` - {String} The name of the field. The name must match the {@Ext.data.Model} field name
         *  - `label` - {String} The field label. The label property is not required if a TableDef configuration is supplied
         *  - `format` - {String} The format function used by the display template. The format function can be any Ext.format or {@link Common.util.Format} function.
         *  - `isDocument` - {Boolean} true if the field is a Document field
         *  - `isPhone` - {Boolean} true if this field is a phone number field
         *  - `isEmail` - {Boolean} true if this field is an email field
         *
         * The fieldsToDisplay can be supplied as an array of field names if a tableDef config is supplied to the class
         *
         *     var fieldsToDisplay = ['site_id', 'name', 'city_id']
         *
         * There may be times when a tableDef config is supplied but the tableDef does not contain all of the fields that are
         * displayed in the report view. This situation happens when the report view data source contains fields that are
         * not contained in the server side table.
         *
         * In this case a fieldsToDisplay array with mixed types can be used.
         *
         *  Defining fields to display for a report using the Floor (fl) table with an additional building name field.
         *
         *     var fieldsToDisplay = [ 'bl_id',
         *                             {name: 'blName', label: 'Building Name'}, // The blName field is not included in the server side fl table
         *                             'fl_id', 'name',
         *                             'area_gross_ext',
         *                             'area_gross_int',
         *                             'area_rentable',
         *                              'area_usable'
         *                            ];
         *
         * The name and label properties must be supplied for each of the fields if a tableDef config is not supplied.
         *
         *      var fieldsToDisplay = [ {name: 'bl_id', label: 'Building Code'},
         *                              {name: 'fl_id', label: 'Floor Code'},
         *                            ];
         *
         * The report view class supports displaying document fields if the field is defined as a document field and the
         * data source contains a document '_contents' field.
         *
         * The document field type is set automatically if a tableDef config is supplied. The fieldsToDisplay isDocument property
         * can be used to identify a document field when a tableDef is not used.
         *
         *      var fieldsToDisplay = [ {name: 'bl_id', label: 'Building Code'},
         *                              {name: 'fl_id', label: 'Floor Code'},
         *                              {name: 'bldg_photo', isDocument: true}
         *                            ];
         */
        fieldsToDisplay: [],

        /**
         * @cfg {Object} tableDef The tableDef object of the associated server side table. The tableDef object should
         * be supplied using the {@link Common.util.TableDef#getTableDefWithFieldDefsAsObject} function
         */
        tableDef: null,

        /**
         * @cfg {Ext.data.Model} record Use the record config when there is a single item to display in the Detail view.
         */
        record: null,

        /**
         * @cfg {Ext.data.Store} store Use the store config when there are multiple records to display in the
         * detail view
         */
        store: null,

        /**
         * @cfg {Ext.XTemplate/String} tpl The generated template for the Detail view. The template is genereated
         * dynamically using the fieldsToDisplay and tableDef configs. It should not be required to supply
         * a tpl config.
         * @readonly
         */
        tpl: null
    },


    constructor: function (config) {
        this.initConfig(config);
        this.init();
    },

    init: function () {
        // Create container
        this.getDetailView();
    },

    applyFieldsToDisplay: function (config) {
        var me = this;

        if (config) {
            config = me.getFieldsToDisplayObjectArray(config);
            me.generateViewTemplate(config);
        }
        return config;
    },

    applyTableDef: function (config) {
        var me = this;
        if (config) {
            me.generateViewTemplate();
        }
        return config;
    },

    applyStore: function (store) {
        var me = this;
        if (store) {
            store = Ext.data.StoreManager.lookup(store);
            store.on('load', me.onStoreLoad, me);
        }
        return store;
    },

    applyRecord: function (record) {
        var me = this,
            container = me.container,
            dataContainer;

        if (record && container) {
            dataContainer = container.down('#dataContainer');
            dataContainer.setData([record]);
        }
        return record;
    },

    /**
     * @private
     * Creates the detailView container and saves it in the container property
     */
    getDetailView: function () {
        var me = this,
            template = me.getTpl(),
            record = me.getRecord(),
            doneButton,
            viewType = Ext.os.is.Phone ? 'Ext.Container' : 'Ext.Panel',
            platformConfig,
            viewConfig = {},
            dataContainer,
            titleBar;

        // Get the height of the tablet view
        //me.defaultViewTabletConfig.height = me.getTabletViewHeight();
        platformConfig = Ext.os.is.Phone ? me.defaultViewPhoneConfig : me.defaultViewTabletConfig;

        Ext.merge(viewConfig, me.defaultViewConfig, platformConfig);

        me.container = Ext.factory(viewConfig, viewType);

        titleBar = me.container.down('titlebar');
        titleBar.setTitle(me.getViewTitle());

        // Add listener for the Done button
        doneButton = me.container.down('#doneButton');
        doneButton.on('tap', me.onDoneTap, me);

        dataContainer = me.container.down('#dataContainer');
        dataContainer.setTpl(template);
        // Use the single option because the painted event is fired twice by the framework.
        // The detail view is created and destroyed each time it is invoked. This allows us to
        // use the single option.
        dataContainer.on('painted', me.onDataContainerPainted, me, {buffer: 50, single: true});

        if (record) {
            dataContainer.setData([record]);
        }
    },

    /**
     * @private
     * Creates the view template using the fieldsToDisplay and tableDef configs.
     * @param {Object[]} fieldsToDisplay The converted fieldsToDisplay object array.
     */
    generateViewTemplate: function (fieldsToDisplay) {
        var me = this,
            tableDef = me.getTableDef(),
            template = '<div class="ab-report"><tpl for="."><div class="ab-report-item">';

        // Get labels and format from the TableDef if it is provided
        if (tableDef !== null) {
            me.getLabelAndFormatFromTableDef(tableDef, fieldsToDisplay);
        }

        Ext.each(fieldsToDisplay, function (field) {
            if (field.isDocument && field.isDocument === true) {
                template += '<tpl if="data.' + field.name + '_contents' + '"><div class="ab-report-image"><img src="data:image/png;base64,{data.' + field.name + '_contents}"</img></div></tpl>';
            } else if(field.isPhone && field.isPhone === true){
                template += '<div class="ab-detail"><div class="label">' + field.label + '</div><div><a href="tel:+{data.' + field.name + field.format + '}">{data.' + field.name + field.format + '}</a></div></div>';
            } else if(field.isEmail && field.isEmail === true) {
                template += '<div class="ab-detail"><div class="label">' + field.label + '</div><div><a href="mailto:{data.' + field.name + field.format + '}">{data.' + field.name + field.format + '}</a></div></div>';
            }else{
                template += '<div class="ab-detail"><div class="label">' + field.label + '</div><div>{data.' + field.name + field.format + '}</div></div>';
            }
        }, me);

        template += '</div></tpl></div>';

        me.setTpl(template);
    },

    /**
     * @private
     * Hides and destroys the view when the Done button is tapped
     */
    onDoneTap: function () {
        var me = this;
        if (me.container) {
            me.container.hide();
            me.container.destroy();
            me.container = null;
        }
    },

    /**
     * Converts the multiline heading array into a single line to be used for labels
     * @private
     * @param {Array} multiLineHeadings The multiLineHeadings property from the TableDef
     * @returns {string}
     */
    multilineHeadingToSingleLine: function (multiLineHeadings) {
        var heading = '';
        Ext.each(multiLineHeadings, function (item) {
            heading += item + ' ';
        });

        return heading;
    },

    /**
     * Uses the fieldDef dataType and decimals fields to determing the format function to
     * apply
     * @private
     * @param {Object} fieldDef
     * @returns {string}
     */
    getFormatFromFieldDef: function (fieldDef) {
        var me = this,
            formatStr = '',
            dataType = fieldDef.dataType,
            decimals = fieldDef.decimals;

        switch (dataType) {
            case 'STRING':
                formatStr = '';
                break;
            case 'DOUBLE':
            case 'INTEGER':
                formatStr = ':number(' + decimals + ')';
                break;
            case 'DATE':
                formatStr = ':date("' + me.dateFormat + '")';
                break;
            case 'TIME':
                formatStr = ':date("H:i")';
                break;
            default:
                formatStr = '';
        }

        return formatStr;
    },


    /**
     * Converts the fieldsToDisplay array into an object array. Populates default property values.
     * @private
     * @param {Object[]/String[]} fieldsToDisplay
     * @returns {Object[]}
     */
    getFieldsToDisplayObjectArray: function (fieldsToDisplay) {
        var me = this,
            fieldsToDisplayObjectArray = [],
            defaultFieldObject = {name: '', label: '', format: ''};

        Ext.each(fieldsToDisplay, function (field) {
            var mergedObject = {};
            if (Ext.isObject(field)) {
                Ext.apply(mergedObject, field, defaultFieldObject);
            } else {
                Ext.apply(mergedObject, {name: field}, defaultFieldObject);
            }
            fieldsToDisplayObjectArray.push(mergedObject);
        }, me);

        return fieldsToDisplayObjectArray;
    },

    /**
     * Extracts the label and format information for each field from the TableDef object
     * @private
     * @param {Object} tableDef
     * @param {Object[]} fieldsToDisplay
     */
    getLabelAndFormatFromTableDef: function (tableDef, fieldsToDisplay) {
        var me = this,
            fieldDefs = tableDef.fieldDefs;

        Ext.each(fieldsToDisplay, function (field) {
            var fieldDef = fieldDefs[field.name];
            if (fieldDef) {
                field.label = me.multilineHeadingToSingleLine(fieldDef.multiLineHeadings);
                field.format = me.getFormatFromFieldDef(fieldDef);
                field.isDocument = (fieldDef.archibusType === 'DOCUMENT');
            }
        }, me);
    },

    /**
     * Supplies the title text using the TableDef heading field if no tilte configuration is
     * supplied
     * @private
     * @returns {string}
     */
    getViewTitle: function () {
        var me = this,
            configTitle = me.getTitle(),
            tableDef = me.getTableDef(),
            title = '';

        if (configTitle === null && tableDef !== null) {
            title = tableDef.heading;
        } else if (configTitle !== null) {
            title = configTitle;
        }

        return title;

    },

    onStoreLoad: function () {
        var me = this,
            store = me.getStore(),
            dataContainer;

        if (me.container) {
            dataContainer = me.container.down('#dataContainer');
            dataContainer.setData(store.data.all);
        }
    },

    /**
     * Sets the size and scrolling configuration of the report view
     * @private
     * @param element
     */
    onDataContainerPainted: function (element) {
        var me = this,
            rect = element.dom.getBoundingClientRect(),
            minHeight = me.container.config.minContainerHeight,
            maxHeight = me.container.config.maxContainerHeight,
            titleBar = me.container.down('titlebar');

        // Set the size for the tablet view
        if(!Ext.os.is.Phone) {
            if (rect.height > maxHeight) {
                me.container.setHeight(maxHeight);
                me.container.setScrollable(true);
            } else if (rect.height < minHeight) {
                me.container.setHeight(minHeight);
            } else {
                me.container.setHeight(rect.height + 55);
            }
            titleBar.setHidden(false);
        }

    },

    /**
     * Adds the generated view to the {@link Ext.Viewport} and displays the view.
     */
    show: function () {
        var me = this,
            view = me.container;

        Ext.Viewport.add(view);
        view.show();
    }

});