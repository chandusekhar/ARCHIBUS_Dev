package com.archibus.app.sysadmin.updatewizard.schema.sqlgenerator.altertable;

/**
 * Alter table interface.
 * <p>
 *
 * @author Catalin Purice
 * @since 22.1
 *
 */
public interface AlterTable {

    /**
     *
     * Alter the field.
     */
    void alterField();

    /**
     *
     * Returns the Allow null statement.
     *
     * @return String
     */
    String getAllowNullStatement();

    /**
     *
     * getAlterFieldStatementPrefix.
     *
     * @return alter table statement
     */
    String getAlterFieldStatementPrefix();

    /**
     *
     * get data type.
     *
     * @return alter table statement
     */
    String getDataTypeStatement();
}
