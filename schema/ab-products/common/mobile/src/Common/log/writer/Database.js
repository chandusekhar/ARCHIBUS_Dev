//<feature logger>
Ext.define('Common.log.writer.Database', {

    extend: 'Ext.log.writer.Writer',
    mixins: ['Common.promise.util.DatabaseOperation'],

    requires: [
        'Common.device.File',
        'Common.util.Queue',
        'Common.store.proxy.SqliteConnectionManager'
    ],

    queue: null,

    isWriting: false,

    config: {
        throwOnErrors: false,
        throwOnWarnings: false,
        maxRecords: 20000
    },

    constructor: function () {
        this.callParent(arguments);
        this.queue = Ext.create('Common.util.Queue');
    },

    doWrite: function (event) {
        var me = this,
            message = event.message,
            priority = event.priorityName,
            clonedEvent;

        if (priority === 'error' && this.getThrowOnErrors()) {
            throw new Error(message);
        }
        clonedEvent = Ext.clone(event);
        me.queue.add(clonedEvent);

        if (!me.isWriting) {
            me.writeToDatabase();
        }
    },

    writeToDatabase: function () {
        var me = this,
            model = Ext.ModelManager.getModel('Common.model.Message'),
            maxRecords = me.getMaxRecords(),
            event,
            resetFlag = function () {
                me.isWriting = false;
            };

        if(me.queue.isEmpty()) {
            me.getTableRecordCount(function (total) {
                if (total > maxRecords) {
                    me.trimTableRecords(resetFlag);
                } else {
                    resetFlag();
                }
            });
        } else {
            me.isWriting = true;
            event = me.queue.dequeue();
            me.createTableIfNotExists('Message', model)
                .then(function() {
                    me.insertRecord(event, function() {
                        me.writeToDatabase();
                    }, resetFlag);
                });
        }
    },

    insertRecord: function (event, onCompleted) {
        var db = Common.store.proxy.SqliteConnectionManager.getConnection(),
            sql = 'INSERT INTO Message(message_id,user_name,device_id,message_timestamp,priority,log_message,application,mob_is_changed,mob_locked_by,message_date,message_time) VALUES(?,?,?,?,?,?,?,?,?,?,?)',
            dateTimeValue = Ext.DateExtras.format(new Date(event.time), 'Y-m-d H:i:s.u'),
            priority = Ext.isNumber(event.priority) ? event.priority : 1,
            values = [
                Ext.data.identifier.Uuid.Global.generate(),
                ConfigFileManager.username,
                ConfigFileManager.deviceId,
                event.time,
                priority,
                event.message,
                Common.Application.appName,
                1,
                ConfigFileManager.username,
                dateTimeValue,
                dateTimeValue
            ];

        db.transaction(function (tx) {
            tx.executeSql(sql, values, onCompleted, function() {
                Ext.callback(onCompleted);
            });
        });
    },

    getTableRecordCount: function (onCompleted) {
        var me = this,
            db = Common.store.proxy.SqliteConnectionManager.getConnection(),
            sql = 'SELECT COUNT(*) AS TotalCount FROM Message';

        db.transaction(function (tx) {
            tx.executeSql(sql, null, function (tx, result) {
                var total = result.rows.item(0).TotalCount;
                Ext.callback(onCompleted, me, [total]);
            }, function () {
                // Error
                Ext.callback(onCompleted, me, [0]);
            });
        });
    },

    trimTableRecords: function (onCompleted) {
        var me = this,
            db = Common.store.proxy.SqliteConnectionManager.getConnection(),
            numberToTrim = me.getMaxRecords() / 2,
            sql = 'DELETE FROM Message WHERE message_id IN(select message_id FROM Message ORDER BY message_timestamp LIMIT ' + numberToTrim + ' );';

        db.transaction(function (tx) {
            tx.executeSql(sql, null, function () {
                Ext.callback(onCompleted, me);
            }, function () {
                Ext.callback(onCompleted, me);
            });
        });
    }

});
//<feature>