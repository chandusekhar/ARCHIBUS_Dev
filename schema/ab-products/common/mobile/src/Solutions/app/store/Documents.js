//Store used for viewselector control demo
Ext.define("Solutions.store.Documents", {
    extend: "Common.store.sync.SyncStore",

    requires: "Solutions.model.Document",

    config: {
        storeId: "selectorExampleStore",
        model: "Solutions.model.Document"
    }
});