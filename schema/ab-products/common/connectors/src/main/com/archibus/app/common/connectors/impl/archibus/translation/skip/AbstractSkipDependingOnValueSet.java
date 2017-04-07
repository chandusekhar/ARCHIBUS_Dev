package com.archibus.app.common.connectors.impl.archibus.translation.skip;

import java.util.*;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.utility.StringUtil;

/**
 * Skip depending on a condition depending on field values being compared to values in a set.
 *
 * @author cole
 * @since 20.1
 *
 */
public abstract class AbstractSkipDependingOnValueSet implements ISkipRecordCondition {
    /**
     * The identifier for the source field for which values are checked.
     */
    private String fieldKey;

    /**
     * A list of values indicating that a field should be skipped.
     */
    private Set<String> valueSet;

    /**
     * Instantiate this rule, completely resetting it's state.
     *
     * @param connectorField the field this rule applies to.
     */
    public void init(final ConnectorFieldConfig connectorField) {
        this.fieldKey = connectorField.getFieldId();
        if (StringUtil.isNullOrEmpty(connectorField.getParameter())) {
            this.valueSet = Collections.emptySet();
        } else {
            this.valueSet =
                    new HashSet<String>(Arrays.asList(connectorField.getParameter().split("\\|")));
        }
    }
    
    /**
     * @return the identifier for the source field for which values are checked.
     */
    protected String getFieldKey() {
        return this.fieldKey;
    }

    /**
     * @return values that should be compared.
     */
    protected Set<String> getValueSet() {
        return this.valueSet;
    }
    
    /*
     * JUSTIFICATION: returning true *is* the implementation.
     */
    /**
     * @return true, as a value must be present to be compared to the set.
     */
    @SuppressWarnings("PMD.EmptyMethodInAbstractClassShouldBeAbstract")
    public boolean requiresExistingValue() {
        return true;
    }

    /**
     * {@inheritDoc}
     */
    public String getReason(final Map<String, Object> record) {
        final Object fieldValue = record.get(this.fieldKey);
        return "Value of " + this.fieldKey + " is " + fieldValue;
    }
}
