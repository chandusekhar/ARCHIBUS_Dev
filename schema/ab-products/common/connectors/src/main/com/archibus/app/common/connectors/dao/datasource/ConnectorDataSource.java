package com.archibus.app.common.connectors.dao.datasource;

import java.util.*;

import com.archibus.app.common.connectors.dao.IConnectorDao;
import com.archibus.app.common.connectors.domain.*;
import com.archibus.app.common.connectors.domain.ConnectorTypes.ExecFlag;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;

/**
 * A data access object for accessing connector configuration in a database and converting it to a
 * spring bean.
 *
 * @author cole
 *
 */
public class ConnectorDataSource extends ObjectDataSourceImpl<ConnectorConfig> implements
        IConnectorDao {
    
    /**
     * The table in a database that stores connector configurations.
     */
    private static final String CONNECTOR_TABLE_NAME = "afm_connector";
    
    /**
     * The primary key identifier for the afm_connector table.
     */
    private static final String CONNECTOR_ID_FIELD_NAME = "connector_id";
    
    /**
     * The restriction for this connector, included as a constant to avoid duplicate string
     * literals.
     */
    private static final String CLAUSE_FIELD_NAME = "clause";
    
    /**
     * The description or XML template for this connector, included as a constant to avoid duplicate
     * string literals.
     */
    private static final String DESCRIPTION_FIELD_NAME = "description";

    /**
     * The field name for the connector's execution status.
     */
    private static final String EXECUTION_STATUS_FIELD_NAME = "exec_flag";
    
    /**
     * The Spring bean for accessing connector configuration in memory.
     */
    private static final String CONNECTOR_BEAN_NAME = "connector";
    
    /**
     * Field mapping between the connector configuration in the database and in memory.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = {
            { "assigned_connector", "assignedConnector" },
            { CLAUSE_FIELD_NAME, CLAUSE_FIELD_NAME }, { "conn_params", "connParamsDb" },
            { "conn_password", "connPassword" }, { "conn_string", "connStringDb" },
            { "conn_user", "connUser" }, { CONNECTOR_ID_FIELD_NAME, "connectorId" },
            { "delimeter", "delimeterDb" }, { DESCRIPTION_FIELD_NAME, DESCRIPTION_FIELD_NAME },
            { "destination_tbl", "destinationTbl" },
        { EXECUTION_STATUS_FIELD_NAME, "execFlagDb" }, { "ftp_folder", "ftpFolder" },
        { "ftp_password", "ftpPassword" }, { "ftp_port", "ftpPort" },
        { "ftp_secure", "ftpSecureDb" }, { "ftp_string", "ftpString" },
        { "ftp_user", "ftpUser" }, { "import", "importDb" },
            { "notify_email_address", "notifyEmailAddress" }, { "notify_user", "notifyUserDb" },
            { "post_process", "postProcess" }, { "pre_process", "preProcess" },
            { "skip_first_row", "skipFirstRow" }, { "source_tbl", "sourceTbl" },
            { "text_qualifier", "textQualifierDb" }, { "type", "typeDb" } };
    
    /**
     * Create a data access object for accessing connector configuration in a database and
     * converting it to a spring bean.
     */
    public ConnectorDataSource() {
        super(CONNECTOR_BEAN_NAME, CONNECTOR_TABLE_NAME);
    }
    
    @Override
    protected String[][] getFieldsToProperties() {
        return DaoUtil.getFieldsToProperties(FIELDS_TO_PROPERTIES);
    }

    /**
     * {@inheritDoc}
     */
    public ConnectorConfig createFromContext() {
        return convertRecordToObject(createRecordFromContext());
    }

    /**
     * {@inheritDoc}
     */
    public List<String> getByExecutionStatus(final ExecFlag executionStatus) {
        final DataSource connectorIdDs =
                DataSourceFactory.createDataSourceForFields(CONNECTOR_TABLE_NAME, new String[] {
                        CONNECTOR_ID_FIELD_NAME, EXECUTION_STATUS_FIELD_NAME });
        final List<DataRecord> connectorIdRecords =
                connectorIdDs.getRecords("exec_flag=" + ExecFlag.EXECUTE.ordinal());
        final List<String> connectorIds = new ArrayList<String>();
        for (final DataRecord dataRecord : connectorIdRecords) {
            connectorIds.add(dataRecord.getString(CONNECTOR_ID_FIELD_NAME));
        }
        return connectorIds;
    }
}
