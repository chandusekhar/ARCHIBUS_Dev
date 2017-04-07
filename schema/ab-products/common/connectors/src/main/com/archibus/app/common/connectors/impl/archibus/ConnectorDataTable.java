package com.archibus.app.common.connectors.impl.archibus;

import org.json.JSONObject;

import com.archibus.app.common.connectors.domain.ConnectorConfig;
import com.archibus.app.common.connectors.translation.common.inbound.impl.ArchibusDataTable;

/**
 * An ARCHIBUS data table constructed from a connector configuration.
 *
 * @author cole
 * @since 22.1
 *
 */
public class ConnectorDataTable extends ArchibusDataTable {

    /**
     * A connector parameter that when set to false will not permit records to be updated (insert
     * only). Default: true.
     */
    private static final String SUPPORT_UPDATES_PARAM = "supportUpdates";

    /**
     * A connector parameter that when set to false will not permit records to be inserted (update
     * only). Default: true.
     */
    private static final String SUPPORT_INSERTS_PARAM = "supportInserts";

    /**
     * A connector parameter that when set to true will only update fields that chnage. This can be
     * expensive. Default: false.
     */
    private static final String COMPARE_FIELDS_PARAM = "compareFields";

    /**
     * @param connector the connector configuration used to configure the data table.
     */
    public ConnectorDataTable(final ConnectorConfig connector) {
        this(connector.getArchibusTable(), connector.getConnParams());
    }
    
    /**
     * @param dataTableName the data table name to use in lieu of connector configuration.
     * @param parameters the connector parameters used to configure the data table.
     */
    public ConnectorDataTable(final String dataTableName, final JSONObject parameters) {
        super(dataTableName, parameters.optBoolean(SUPPORT_INSERTS_PARAM, true), parameters
            .optBoolean(SUPPORT_UPDATES_PARAM, true), parameters.optBoolean(COMPARE_FIELDS_PARAM,
            false));
    }
}
