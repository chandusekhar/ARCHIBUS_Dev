package com.archibus.app.common.util;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.schema.*;
import com.archibus.schema.ArchibusFieldDefBase.Immutable;
import com.archibus.utility.ExceptionBase;

/**
 * Provides static methods to check whether a table or a field is defined in the schema.
 * <p>
 *
 * @author Sergey
 * @since 21.3
 */
public final class SchemaUtils {

    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private SchemaUtils() {
    }

    /**
     * Checks whether specified table exists in schema.
     *
     * @param tableName The table name.
     * @return true if specified table exists in schema.
     */
    public static boolean tableExistsInSchema(final String tableName) {
        boolean exists = true;
        try {
            ContextStore.get().getProject().loadTableDef(tableName);
        } catch (final ExceptionBase eb) {
            exists = false;
        }

        return exists;
    }

    /**
     * Checks whether specified field exists in schema.
     *
     * @param tableName The table name.
     * @param fieldName The field name.
     * @return true if specified field exists in schema
     */
    public static boolean fieldExistsInSchema(final String tableName, final String fieldName) {
        boolean exists = true;
        try {
            final TableDef.Immutable tableDef =
                    ContextStore.get().getProject().loadTableDef(tableName);
            if (tableDef.findFieldDef(fieldName) == null) {
                exists = false;
            }

        } catch (final ExceptionBase eb) {
            exists = false;
        }

        return exists;
    }

    /**
     * Returns list with all field names (short name) for specified table.
     *
     * @param tableName table name
     * @return List<String>
     */
    public static List<String> getFieldsForTable(final String tableName) {
        List<String> fields = new ArrayList<String>();
        try {
            final TableDef.Immutable tableDef =
                    ContextStore.get().getProject().loadTableDef(tableName);

            final Iterator<Immutable> itFields = tableDef.getFieldsList().iterator();
            while (itFields.hasNext()) {
                final Immutable field = itFields.next();
                fields.add(field.getName());
            }
        } catch (final ExceptionBase eb) {
            fields = new ArrayList<String>();
        }
        return fields;
    }

    /**
     * Returns field definition.
     *
     * @param tableName table name
     * @param fieldName field name
     * @return {@link ArchibusFieldDefBase}
     */
    public static Immutable getFieldDef(final String tableName, final String fieldName) {
        final TableDef.Immutable tableDef = ContextStore.get().getProject().loadTableDef(tableName);
        return tableDef.findFieldDef(fieldName);
    }
}
