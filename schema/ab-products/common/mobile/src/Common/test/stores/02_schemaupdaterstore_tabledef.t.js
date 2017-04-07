// Test TableDef comparison functions
/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* jshint newcap: false */
/* global StartTest */

StartTest(function (t) {

    t.requireOk('Common.store.sync.SchemaUpdaterStore', 'Common.util.TableDef',  function () {

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

    var tableDef2 = Ext.clone(tableDef1);

    var store = Ext.create('Common.store.sync.SchemaUpdaterStore', {tableName: 'testStore'});

    var result = TableDef.compareTableDefObject(tableDef1, tableDef2);

    t.ok(result, 'Objects match');

    var removedFieldDef = tableDef2.fieldDefs.splice(0,1);

    result = store.isTableDefEqual(tableDef1, tableDef2);
    t.notOk(result, 'TableDef fieldDef length properties do not match');

        t.done();

    });

});
