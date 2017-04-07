package com.archibus.app.common.connectors.dao.datasource;

import java.util.List;

import com.archibus.app.common.connectors.dao.IConnectorRuleDao;
import com.archibus.app.common.connectors.domain.ConnectorRuleConfig;
import com.archibus.datasource.ObjectDataSourceImpl;
import com.archibus.model.view.datasource.*;
import com.archibus.model.view.datasource.ClauseDef.Operation;

/**
 * A data access object for accessing connector rule configuration in a database and converting it
 * to a spring bean.
 *
 * @author cole
 *
 */
public class ConnectorRuleDataSource extends ObjectDataSourceImpl<ConnectorRuleConfig> implements
        IConnectorRuleDao {
    
    /**
     * The Spring bean for accessing connector rule configuration in memory.
     */
    private static final String RULE_BEAN_NAME = "connectorRule";
    
    /**
     * The table in a database that stores connector rule configurations.
     */
    private static final String RULE_TABLE_NAME = "afm_conn_rule_cat";
    
    /**
     * The primary key identifier for the afm_conn_rule_cat table.
     */
    private static final String RULE_ID_FIELD_NAME = "rule_id";
    
    /**
     * Field mapping between the connector rule configuration in the database and in memory.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { "class_name", "className" },
            { RULE_ID_FIELD_NAME, "ruleId" } };
    
    /**
     * Create a data access object for accessing connector rule configuration in a database and
     * converting it to a spring bean.
     */
    public ConnectorRuleDataSource() {
        super(RULE_BEAN_NAME, RULE_TABLE_NAME);
    }
    
    @Override
    protected String[][] getFieldsToProperties() {
        return DaoUtil.getFieldsToProperties(FIELDS_TO_PROPERTIES);
    }
    
    /**
     * {@inheritDoc}
     */
    public List<ConnectorRuleConfig> getConnectorFields(final String connectorId) {
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(new ClauseDef(ConnectorRuleDataSource.RULE_TABLE_NAME,
            ConnectorRuleDataSource.RULE_ID_FIELD_NAME, connectorId, Operation.EQUALS));
        return this.convertRecordsToObjects(this.getRecords(restriction));
    }
}
