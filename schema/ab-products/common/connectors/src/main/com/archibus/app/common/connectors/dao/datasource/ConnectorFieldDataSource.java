package com.archibus.app.common.connectors.dao.datasource;

import java.util.List;

import com.archibus.app.common.connectors.dao.IConnectorFieldDao;
import com.archibus.app.common.connectors.domain.*;
import com.archibus.datasource.ObjectDataSourceImpl;
import com.archibus.model.view.datasource.*;
import com.archibus.model.view.datasource.ClauseDef.Operation;

/**
 * A data access object for accessing connector field mapping configuration in a database and
 * converting it to a spring bean.
 *
 * @author cole
 *
 */
public class ConnectorFieldDataSource extends ObjectDataSourceImpl<ConnectorFieldConfig> implements
        IConnectorFieldDao {

    /**
     * The Spring bean for accessing connector field mapping configuration in memory.
     */
    private static final String CONNECTOR_FIELD_BEAN_NAME = "connectorField";

    /**
     * The table in a database that stores connector field mapping configurations.
     */
    private static final String CONNECTOR_FIELD_TABLE_NAME = "afm_conn_flds";

    /**
     * The primary key identifier for the afm_conn_flds table.
     */
    private static final String CONNECTOR_ID_FIELD_NAME = "connector_id";

    /**
     * The position for order.
     */
    private static final String POSITION_FIELD_NAME = "position";

    /**
     * The configuration for the connector rule.
     */
    private static final String PARAMETER_FIELD_NAME = "parameter";

    /**
     * The length of a fixed width field.
     */
    private static final String RESULT_FIELD_NAME = "result";

    /**
     * Field mapping between the connector field mapping configuration in the database and in
     * memory.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { "cache", "cacheDb" },
        { CONNECTOR_ID_FIELD_NAME, "connectorId" }, { "destination_fld", "destinationFld" },
        { "field_id", "fieldId" }, { "ignore_nulls", "ignoreNullsDb" },
            { "is_schema_field", "isSchemaFieldDb" },
        { PARAMETER_FIELD_NAME, PARAMETER_FIELD_NAME },
        { POSITION_FIELD_NAME, POSITION_FIELD_NAME }, { RESULT_FIELD_NAME, RESULT_FIELD_NAME },
        { "rule_id", "ruleId" }, { "validate_tbl", "validateTbl" } };

    /**
     * Create a data access object for accessing connector field mapping configuration in a database
     * and converting it to a spring bean.
     */
    public ConnectorFieldDataSource() {
        super(CONNECTOR_FIELD_BEAN_NAME, CONNECTOR_FIELD_TABLE_NAME);
        this.getSortFields().add(
            new SortField(CONNECTOR_FIELD_TABLE_NAME, POSITION_FIELD_NAME, true));
    }

    @Override
    protected String[][] getFieldsToProperties() {
        return DaoUtil.getFieldsToProperties(FIELDS_TO_PROPERTIES);
    }

    /**
     * {@inheritDoc}
     */
    public List<ConnectorFieldConfig> getConnectorFields(final ConnectorConfig connector) {
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(new ClauseDef(ConnectorFieldDataSource.CONNECTOR_FIELD_TABLE_NAME,
            ConnectorFieldDataSource.CONNECTOR_ID_FIELD_NAME, connector.getConnectorId(),
            Operation.EQUALS));
        final List<ConnectorFieldConfig> connectorFields =
                this.convertRecordsToObjects(this.getRecords(restriction));
        for (final ConnectorFieldConfig connectorField : connectorFields) {
            connectorField.setConnector(connector);
        }
        return connectorFields;
    }
}
