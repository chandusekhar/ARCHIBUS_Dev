package com.archibus.app.common.connectors.impl.archibus.outbound;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.archibus.translation.RuleManager;
import com.archibus.app.common.connectors.impl.archibus.translation.manager.FieldTranslatorManager;
import com.archibus.app.common.connectors.translation.common.outbound.impl.DataSourceFieldDefinition;
import com.archibus.app.common.connectors.translation.exception.TranslationException;

/**
 * A request field definition created from an afm_conn_flds record.
 *
 * @author cole
 *
 */
public class ArchibusRequestFieldDefinition extends DataSourceFieldDefinition {
    /**
     * The configuration for a connector field.
     */
    private final ConnectorFieldConfig connectorField;
    
    /**
     * A manager for connector rules.
     */
    private RuleManager ruleManager;
    
    /**
     * Create a request field definition created from an afm_conn_flds record.
     *
     * @param connectorField an afm_conn_fld associated with the connector that this definition
     *            represents.
     * @throws ConfigurationException if the connector rule cannot be instantiated.
     */
    public ArchibusRequestFieldDefinition(final ConnectorFieldConfig connectorField)
            throws ConfigurationException {
        /*
         * The ARCHIBUS field is the field id in this case and cannot be null.
         */
        super(connectorField.getForeignFieldPath(), connectorField.getArchibusField());
        this.connectorField = connectorField;
    }
    
    @Override
    public Object translateToForeign(final Object databaseValue) throws TranslationException {
        Object translatedValue = super.translateToForeign(databaseValue);
        if (this.ruleManager != null) {
            translatedValue =
                    this.ruleManager.resolveManager(FieldTranslatorManager.class).applyRule(
                        getDataSourceFieldName(), databaseValue);
        }
        return translatedValue;
    }
    
    /**
     * @return the configuration for the request field.
     */
    public ConnectorFieldConfig getConnectorField() {
        return this.connectorField;
    }
    
    /**
     * @param ruleManager a manager for connector rules.
     */
    public void setRuleManager(final RuleManager ruleManager) {
        this.ruleManager = ruleManager;
    }
}
