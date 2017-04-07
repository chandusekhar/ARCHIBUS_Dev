package com.archibus.app.common.connectors.impl.archibus.translation.record;

import java.util.*;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.archibus.translation.Identity;

/**
 * Sets the field to a value specified by the connector field parameter when a field with the
 * identity rule hasn't changed. The initial record is considered a change.
 * 
 * @author cole
 * 
 */
public class SkipIfNotUnique implements IRecordTranslator {
    
    /**
     * The field to be replaced.
     */
    private String fieldKey;
    
    /**
     * The identity fields to compare.
     */
    private Set<String> identityKeys;
    
    /**
     * The default value.
     */
    private String defaultValue;
    
    /**
     * The previous values of identity fields.
     */
    private Map<String, Object> previousIdentities;
    
    /**
     * Instantiate this rule.
     * 
     * @param connectorField the field this rule applies to.
     * @throws ConfigurationException if there is a problem instantiating any rule on this connector
     *             (in search of the identity rule).
     */
    public void init(final ConnectorFieldConfig connectorField) throws ConfigurationException {
        this.fieldKey = connectorField.getFieldId();
        this.identityKeys = new HashSet<String>();
        for (final ConnectorFieldConfig potentialIdentityField : connectorField.getConnector()
            .getConnectorFields()) {
            if (Identity.class.equals(potentialIdentityField.getRule().getRuleClass())) {
                this.identityKeys.add(potentialIdentityField.getFieldId());
            }
        }
        this.defaultValue = connectorField.getParameter();
    }
    
    /**
     * @return true, as there needs to be a value to replace.
     */
    public boolean requiresExistingValue() {
        return true;
    }
    
    /**
     * If the fields with the IDENTITY rule have the same values, set the value of the field with
     * this rule to the value in the connector field parameter, otherwise return the value.
     * 
     * @param record the record to be modified (may already be modified by other rules).
     * @param originalRecord the record prior to translation by other record level rules.
     */
    public void applyRule(final Map<String, Object> record, final Map<String, Object> originalRecord) {
        Object fieldValue = originalRecord.get(this.fieldKey);
        final Map<String, Object> identities = new HashMap<String, Object>();
        boolean identitiesMatch = true;
        if (this.previousIdentities == null) {
            this.previousIdentities = new HashMap<String, Object>();
        } else {
            for (final String idKey : this.identityKeys) {
                final Object idValue = originalRecord.get(idKey);
                final Object previousIdValue = this.previousIdentities.get(idKey);
                if (!((idValue == null && previousIdValue == null) || (idValue != null && idValue
                    .equals(previousIdValue)))) {
                    identitiesMatch = false;
                }
                identities.put(idKey, idValue);
            }
        }
        if (identitiesMatch) {
            fieldValue = this.defaultValue;
        } else {
            this.previousIdentities = identities;
        }
        record.put(this.fieldKey, fieldValue);
    }
}
