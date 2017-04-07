package com.archibus.app.common.connectors.impl.archibus.inbound;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.archibus.DataSourceUtil;
import com.archibus.app.common.connectors.impl.archibus.translation.RuleManager;
import com.archibus.app.common.connectors.translation.common.inbound.IResponseTxFieldDef;
import com.archibus.app.common.connectors.translation.exception.TranslationException;
import com.archibus.datasource.DataSourceFieldDefLoader;
import com.archibus.db.ViewField.Immutable;

/**
 * A method for extracting field data from a source that provides a list of field values.
 *
 * @author cole
 * @param <ForeignTransactionType> the type of transaction that contains this field.
 */
public abstract class AbstractArchibusResponseFieldDefinition<ForeignTransactionType> implements
        IResponseTxFieldDef<ForeignTransactionType> {
    
    /**
     * The afm_conn_flds record describing this field's mapping.
     */
    private final ConnectorFieldConfig connectorField;
    
    /**
     * The afm_flds record describing this field.
     */
    private final Immutable fieldDef;
    
    /**
     * Connector rule manager, for initializing and introspecting rules.
     */
    private RuleManager ruleManager;
    
    /**
     * Create a method for extracting field data from a source that provides a list of field values
     * based on afm_conn_flds and afm_flds records.
     *
     * @param connectorField the field associated with the afm_connector record that describes this
     *            field.
     * @param fieldDefLoader loader for ARCHIBUS field definitions.
     * @throws ConfigurationException if an associated connector rule can't be instantiated or a
     *             field configuration is invalid.
     */
    public AbstractArchibusResponseFieldDefinition(final ConnectorFieldConfig connectorField,
            final DataSourceFieldDefLoader fieldDefLoader) throws ConfigurationException {
        this.fieldDef = DataSourceUtil.getFieldDef(connectorField, fieldDefLoader);
        this.connectorField = connectorField;
    }
    
    /**
     * @return the afm_flds field definition for this field or null if it's not in afm_flds.
     */
    @Override
    public Immutable getFieldDef() {
        return this.fieldDef;
    }
    
    /**
     * Whether the given value for this field on a transaction indicates the field's value is to be
     * updated.
     *
     * @param extractedValue the value of the field extracted from the transaction.
     * @return true if the value isn't null or the connector isn't ignoring null values.
     */
    @Override
    public boolean shouldUpdate(final Object extractedValue) {
        return !(this.connectorField.getIgnoreNulls() && extractedValue == null);
    }
    
    /**
     * @return whether the field should be extracted.
     */
    public boolean shouldExtract() {
        boolean shouldExtract = true;
        if (this.ruleManager != null) {
            shouldExtract = this.ruleManager.shouldExtract(this.connectorField.getFieldId());
        }
        return shouldExtract;
    }
    
    /**
     * @return the path to the field value in the foreign transaction record.
     */
    public String getForeignFieldPath() {
        return this.connectorField.getForeignFieldPath();
    }
    
    /**
     * @return the configuration for the response field.
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
    
    /**
     * Change the value extracted from the source into a value that can be stored in the ARCHIBUS
     * database.
     *
     * @param extractedForeignValue the value of the field extracted from the source.
     * @return the extractedForeignValue, as strings are valid database objects.
     * @throws TranslationException when a field rule is present, and the value isn't valid for the
     *             rule.
     */
    @Override
    public Object translateToDatabase(final Object extractedForeignValue)
            throws TranslationException {
        return extractedForeignValue;
    }
}
