// Test the TableDef comparison functions
/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* jshint newcap: false */
/* global StartTest */

StartTest(function (t) {

    t.requireOk('Common.store.sync.SchemaUpdaterStore', 'Common.util.TableDef',  function () {

    // Data used for the test
    var tableDef1 = {
        "autoNumber":false,
        "fieldDefs":[
            {
                "allowNull":true,
                "archibusType":"GRAPHIC",
                "assetTextIndex":0,
                "autoNumber":false,
                "canEdit":true,
                "dataType":"STRING",
                "decimals":0,
                "defaultValue":null,
                "displaySizeHeading":20,
                "displaySizeNoHeading":64,
                "enumObjectToDisplay":null,
                "foreignKey":false,
                "formatting":"Upper",
                "mask":null,
                "memo":false,
                "multiLineHeadings":[
                    "Building",
                    "Graphic"
                ],
                "name":"image_file",
                "primaryKey":false,
                "primaryKeyIndex":0,
                "referenceTable":null,
                "singleLineHeading":null,
                "size":64,
                "tableName":"bl"
            },
            {
                "allowNull":false,
                "archibusType":"CALCULATED",
                "assetTextIndex":0,
                "autoNumber":false,
                "canEdit":true,
                "dataType":"DOUBLE",
                "decimals":2,
                "defaultValue":0,
                "displaySizeHeading":16,
                "displaySizeNoHeading":12,
                "enumObjectToDisplay":null,
                "foreignKey":false,
                "formatting":"Float",
                "mask":null,
                "memo":false,
                "multiLineHeadings":[
                    "Total Non-Occup.",
                    "Dept. Area",
                    "ft."
                ],
                "name":"area_nocup_dp",
                "primaryKey":false,
                "primaryKeyIndex":0,
                "referenceTable":null,
                "singleLineHeading":null,
                "size":12,
                "tableName":"bl"
            }
        ],
        "foreignKeys":[
            {
                "foreignColumns":[
                    "state_id"
                ],
                "primaryColumns":[
                    "state_id"
                ],
                "primaryTableName":"state"
            },
            {
                "foreignColumns":[
                    "weather_source_id",
                    "weather_station_id"
                ],
                "primaryColumns":[
                    "weather_source_id",
                    "weather_station_id"
                ],
                "primaryTableName":"weather_station"
            },
            {
                "foreignColumns":[
                    "pr_id"
                ],
                "primaryColumns":[
                    "pr_id"
                ],
                "primaryTableName":"property"
            },
            {
                "foreignColumns":[
                    "ac_id"
                ],
                "primaryColumns":[
                    "ac_id"
                ],
                "primaryTableName":"ac"
            },
            {
                "foreignColumns":[
                    "energy_baseline_year"
                ],
                "primaryColumns":[
                    "time_period"
                ],
                "primaryTableName":"energy_time_period"
            },
            {
                "foreignColumns":[
                    "site_id"
                ],
                "primaryColumns":[
                    "site_id"
                ],
                "primaryTableName":"site"
            },
            {
                "foreignColumns":[
                    "weather_source_id"
                ],
                "primaryColumns":[
                    "weather_source_id"
                ],
                "primaryTableName":"weather_station_source"
            }

        ],
        "heading":"Buildings",
        "name":"bl",
        "primaryKey":{
            "fieldNames":[
                "bl.bl_id"
            ]
        },
        "sqlView":false
    };

    var tableDef2 = {
        "autoNumber":false,
        "fieldDefs":[
            {
                "allowNull":true,
                "archibusType":"GRAPHIC",
                "assetTextIndex":0,
                "autoNumber":false,
                "canEdit":true,
                "dataType":"STRING",
                "decimals":0,
                "defaultValue":null,
                "displaySizeHeading":20,
                "displaySizeNoHeading":64,
                "enumObjectToDisplay":null,
                "foreignKey":false,
                "formatting":"Upper",
                "mask":null,
                "memo":false,
                "multiLineHeadings":[
                    "Building",
                    "Graphic"
                ],
                "name":"image_file",
                "primaryKey":false,
                "primaryKeyIndex":0,
                "referenceTable":null,
                "singleLineHeading":null,
                "size":64,
                "tableName":"bl"
            },
            {
                "allowNull":false,
                "archibusType":"CALCULATED",
                "assetTextIndex":0,
                "autoNumber":false,
                "canEdit":true,
                "dataType":"DOUBLE",
                "decimals":2,
                "defaultValue":0,
                "displaySizeHeading":16,
                "displaySizeNoHeading":12,
                "enumObjectToDisplay":null,
                "foreignKey":false,
                "formatting":"Float",
                "mask":null,
                "memo":false,
                "multiLineHeadings":[
                    "Total Non-Occup.",
                    "Dept. Area",
                    "ft."
                ],
                "name":"area_nocup_dp",
                "primaryKey":false,
                "primaryKeyIndex":0,
                "referenceTable":null,
                "singleLineHeading":null,
                "size":12,
                "tableName":"bl"
            }
        ],
        "foreignKeys":[
            {
                "foreignColumns":[
                    "state_id"
                ],
                "primaryColumns":[
                    "state_id"
                ],
                "primaryTableName":"state"
            },
            {
                "foreignColumns":[
                    "weather_source_id",
                    "weather_station_id"
                ],
                "primaryColumns":[
                    "weather_source_id",
                    "weather_station_id"
                ],
                "primaryTableName":"weather_station"
            },
            {
                "foreignColumns":[
                    "pr_id"
                ],
                "primaryColumns":[
                    "pr_id"
                ],
                "primaryTableName":"property"
            },
            {
                "foreignColumns":[
                    "ac_id"
                ],
                "primaryColumns":[
                    "ac_id"
                ],
                "primaryTableName":"ac"
            },
            {
                "foreignColumns":[
                    "energy_baseline_year"
                ],
                "primaryColumns":[
                    "time_period"
                ],
                "primaryTableName":"energy_time_period"
            },
            {
                "foreignColumns":[
                    "site_id"
                ],
                "primaryColumns":[
                    "site_id"
                ],
                "primaryTableName":"site"
            },
            {
                "foreignColumns":[
                    "weather_source_id"
                ],
                "primaryColumns":[
                    "weather_source_id"
                ],
                "primaryTableName":"weather_station_source"
            }

        ],
        "heading":"Buildings",
        "name":"bl",
        "primaryKey":{
            "fieldNames":[
                "bl.bl_id"
            ]
        },
        "sqlView":false
    };

    var store = Ext.create('Common.store.sync.SchemaUpdaterStore', {tableName: 'testStore'});

    var result = store.isTableDefEqual(tableDef1, tableDef2);

    // Verify table defs match
    t.ok(result, 'TableDefs match');


    result = TableDef.compareTableDefObject(tableDef1, tableDef2);
    t.ok(result, 'Compare Array works');


    // Verify tableDef property comparison
    tableDef2.heading = 'Test Value';

    result = store.isTableDefEqual(tableDef1, tableDef2);
    t.notOk(result, 'TableDef headings do not match');

    result = TableDef.compareTableDefObject(tableDef1,tableDef2);
    t.notOk(result, 'TableDef headings do not match');

    tableDef2.heading = 'Buildings';

    // Verify tableDef name property comparison
    tableDef1.name = 'Test';
    result = store.isTableDefEqual(tableDef1, tableDef2);
    t.notOk(result, 'TableDef name properties do not match');

    tableDef1.name = 'bl';

    // Verify tableDef autoNumber property comparison
    tableDef2.autoNumber = true;

    result = store.isTableDefEqual(tableDef1, tableDef2);
    t.notOk(result, 'TableDef autoNumber properties do not match');

    // reset
    tableDef2.autoNumber = false;

    // make a back up copy of the tabledef
    var tableDef3 = Ext.clone(tableDef2);

    // Verify the TableDef array properties
    // Remove a fielddef row from TableDef2
    //var removedFieldDef = tableDef2.fieldDefs.splice(0,1);

    result = store.isTableDefEqual(tableDef1, tableDef2);
    t.notOk(result, 'TableDef fieldDef length properties do not match');

    // restore the tableDef
    tableDef2 = Ext.clone(tableDef3);

    // Compare just to make sure the state is restored
    result = store.isTableDefEqual(tableDef1, tableDef2);
    t.ok(result, 'TableDefs are equal');

    tableDef1.fieldDefs.splice(0,1);
    result = store.isTableDefEqual(tableDef1, tableDef2);
    t.notOk(result, 'TableDef fieldDef length properties do not match');

    tableDef1 = Ext.clone(tableDef3);

    // Compare foreign key property lengths
    tableDef2.foreignKeys.splice(0,1);
    result = store.isTableDefEqual(tableDef1, tableDef2);
    t.notOk(result, 'TableDef foreignKey length properties do not match');

    // restore the tableDef
    tableDef2 = Ext.clone(tableDef3);

    // Verify the fieldDef properties
    tableDef1.fieldDefs[0].allowNull = false;
    result = store.isTableDefEqual(tableDef1, tableDef2);
    t.notOk(result, 'FieldDef allowNull properties do not match');
    tableDef1.fieldDefs[0].allowNull = true;

    tableDef2.fieldDefs[1].archibusType = 'Test';
    result = store.isTableDefEqual(tableDef1, tableDef2);
    t.notOk(result, 'FieldDef archibusType properties do not match');
    tableDef2.fieldDefs[1].archibusType = 'CALCULATED';

    tableDef2.fieldDefs[1].name = 'Test';
    result = store.isTableDefEqual(tableDef1, tableDef2);
    t.notOk(result, 'FieldDef name properties do not match');
    tableDef2.fieldDefs[1].name = "area_nocup_dp";

    tableDef1.fieldDefs[1].canEdit = false;
    result = store.isTableDefEqual(tableDef1, tableDef2);
    t.notOk(result, 'FieldDef canEdit properties do not match');
    tableDef1.fieldDefs[1].canEdit = true;

    tableDef1.fieldDefs[1].defaultValue = '1.00';
    result = store.isTableDefEqual(tableDef1, tableDef2);
    t.notOk(result, 'FieldDef defaultValue properties do not match');
    tableDef1.fieldDefs[1].defaultValue = 0;

    tableDef1.fieldDefs[0].dataType = 'INT';
    result = store.isTableDefEqual(tableDef1, tableDef2);
    t.notOk(result, 'FieldDef dataType properties do not match');
    tableDef1.fieldDefs[0].dataType = 'STRING';

    // Verify that the tableDefs still match
    result = store.isTableDefEqual(tableDef1, tableDef2);
    t.ok(result, 'TableDefs match');

    // Test the foreign key comparison
    tableDef2.foreignKeys[0].foreignColumns[0] = 'test';
    result = store.isTableDefEqual(tableDef1, tableDef2);
    t.notOk(result, 'TableDef foreignKey properties do not match');
    tableDef2.foreignKeys[0].foreignColumns[0] = 'state_id';

    // Verify that the tableDefs still match
    result = store.isTableDefEqual(tableDef1, tableDef2);
    t.ok(result, 'TableDefs match');

    tableDef2.foreignKeys[1].primaryTableName = 'test';
    result = store.isTableDefEqual(tableDef1, tableDef2);
    t.notOk(result, 'TableDef foreignKey primaryTableName properties do not match');

        t.done();

    });

});