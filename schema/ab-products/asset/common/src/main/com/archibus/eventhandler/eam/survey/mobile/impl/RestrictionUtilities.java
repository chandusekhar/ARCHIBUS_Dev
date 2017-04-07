package com.archibus.eventhandler.eam.survey.mobile.impl;

import static com.archibus.app.common.mobile.util.FieldNameConstantsCommon.*;
import static com.archibus.app.common.mobile.util.TableNameConstants.EQ_AUDIT_TABLE;

import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;

/**
 * Utility class. Provides supporting methods for retrieving restrictions for eq and eq_audit table.
 * 
 * @author Ying Qin
 * @since 21.1
 * 
 */
final class RestrictionUtilities {
    /**
     * Hide default constructor for this utility class - should never be instantiated.
     */
    private RestrictionUtilities() {
    }
    
    /**
     * Composes a restriction based on values for the primary key fields (survey_id, eq_id) for
     * table eq_audit.
     * 
     * @param surveyId survey code to set the restriction on
     * @param equipmentId equipment code to set the restriction on
     * 
     * @return restriction string.
     */
    static ParsedRestrictionDef composeEquipmentAuditPrimaryKeysRestriction(final String surveyId,
            final String equipmentId) {
        final ParsedRestrictionDef primaryKeyRestriction = new ParsedRestrictionDef();
        primaryKeyRestriction.addClause(EQ_AUDIT_TABLE, SURVEY_ID, surveyId, Operation.EQUALS);
        primaryKeyRestriction.addClause(EQ_AUDIT_TABLE, EQ_ID, equipmentId, Operation.EQUALS);
        return primaryKeyRestriction;
    }
}
