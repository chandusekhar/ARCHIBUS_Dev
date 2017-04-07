Ext.define('MaterialInventory.store.prompt.Tier2Values', {
    extend: 'Common.store.sync.SqliteStore',

    requires: [
        'MaterialInventory.model.prompt.Tier2Value'
    ],

    config: {
        storeId: 'tier2Values',
        model: 'MaterialInventory.model.prompt.Tier2Value',
        autoLoad: false,
        enableAutoLoad: false,
        remoteFilter: true,
        usesTransactionTable: true,
        proxy: {
            type: 'SqliteView',
            viewDefinition: "SELECT msds_id, (CASE WHEN EXISTS(SELECT 1 FROM MaterialData mdata LEFT JOIN MaterialConstituent mconstituent ON mconstituent.msds_id = mdata.msds_id LEFT JOIN MaterialChemical mchemical ON mchemical.chemical_id = mconstituent.chemical_id WHERE md.msds_id=mdata.msds_id AND mchemical.tier2 = 'Extremely Hazardous')" +
            "THEN 'Extremely Hazardous'" +
            "WHEN EXISTS(SELECT 1 FROM MaterialData mdata LEFT JOIN MaterialConstituent mconstituent ON mconstituent.msds_id = mdata.msds_id LEFT JOIN MaterialChemical mchemical ON mchemical.chemical_id = mconstituent.chemical_id WHERE md.msds_id=mdata.msds_id AND mchemical.tier2 = 'Hazardous')" +
            "THEN 'Hazardous'" +
            "WHEN EXISTS(SELECT 1 FROM MaterialData mdata LEFT JOIN MaterialConstituent mconstituent ON mconstituent.msds_id = mdata.msds_id LEFT JOIN MaterialChemical mchemical ON mchemical.chemical_id = mconstituent.chemical_id WHERE md.msds_id=mdata.msds_id AND (mconstituent.msds_id IS NULL OR mchemical.tier2 = 'Unknown'))" +
            "THEN 'Unknown'" +
            "WHEN EXISTS(SELECT 1 FROM MaterialData mdata LEFT JOIN MaterialConstituent mconstituent ON mconstituent.msds_id = mdata.msds_id LEFT JOIN MaterialChemical mchemical ON mchemical.chemical_id = mconstituent.chemical_id WHERE md.msds_id=mdata.msds_id AND mchemical.tier2 = 'Not Listed')" +
            "THEN 'Not Listed'" +
            "ELSE 'Unknown' END ) AS tier2 FROM MaterialData md",
            viewName: 'Tier2Value',
            baseTables: ['MaterialData', 'MaterialChemical', 'MaterialConstituent']
        }
    }
});