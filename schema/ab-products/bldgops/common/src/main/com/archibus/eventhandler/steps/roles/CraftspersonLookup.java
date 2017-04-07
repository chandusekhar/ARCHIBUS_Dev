package com.archibus.eventhandler.steps.roles;

import java.util.*;

import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * Role lookup class to find the craftspersons of a request.
 *
 */
public class CraftspersonLookup extends EventHandlerBase implements HelpdeskRoleLookup {

    /**
     *
     * Lookup the craftspersons of a request building.<br />
     *
     * @param context Workflow rule execution context
     * @return List of craftsperson
     */
    @Override
    public List<String> getList(final EventHandlerContext context) {
        final String tableName = context.getString("tableName");
        final String fieldName = context.getString("fieldName");
        final String pkField = tableName + "." + fieldName;
        final int pkValue = context.getInt(pkField);

        final List<String> cfs = new ArrayList<String>();
        final String blId =
                notNull(selectDbValue(context, tableName, "bl_id", fieldName + "=" + pkValue));

        if (blId != null) {
            final List<Object> records = selectDbRecords(context, "cf", new String[] { "cf_id" },
                "email IN (select em.email from em where em.bl_id = " + literal(context, blId)
                        + ")");
            for (final Object element : records) {
                final Object[] record = (Object[]) element;
                final String cfId = notNull(record[0]);
                cfs.add(cfId);
            }
        }

        return cfs;
    }
}
