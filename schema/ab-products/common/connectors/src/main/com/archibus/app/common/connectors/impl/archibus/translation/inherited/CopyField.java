package com.archibus.app.common.connectors.impl.archibus.translation.inherited;

import java.util.Map;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;

/**
 * Copies a field from one record to another.
 *
 * @author cole
 * @since 22.1
 *
 */
public class CopyField implements IInheritedRecordTranslator {
    /**
     * Delimits between the source transaction definition id and source field name.
     */
    private static final String PARAMETER_DELIMITER_PATTERN = "\\|";

    /**
     * Identify's the source transaction definition.
     */
    private String transactionDefinitionId;

    /**
     * The field to copy from.
     */
    private String sourceFieldId;

    /**
     * The field to copy to (on which the rule is defined).
     */
    private String destinationFieldId;
    
    /** {@inheritDoc} */
    @Override
    public void init(final ConnectorFieldConfig connectorField) throws ConfigurationException {
        final String[] parameterParts =
                connectorField.getParameter().split(PARAMETER_DELIMITER_PATTERN);
        this.transactionDefinitionId = parameterParts[0];
        this.sourceFieldId = parameterParts[1];
        this.destinationFieldId = connectorField.getFieldId();
    }
    
    /** {@inheritDoc} */
    @Override
    public void applyRule(final Map<String, Object> record, final Map<String, Object> originalRecord) {
        record.put(this.destinationFieldId, originalRecord.get(this.sourceFieldId));
    }
    
    /** {@inheritDoc} */
    @Override
    public boolean requiresExistingValue() {
        return false;
    }
    
    /** {@inheritDoc} */
    @Override
    public String getTransactionDefinitionId() {
        return this.transactionDefinitionId;
    }
    
}
