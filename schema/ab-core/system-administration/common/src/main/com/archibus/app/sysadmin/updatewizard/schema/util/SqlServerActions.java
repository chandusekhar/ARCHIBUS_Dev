package com.archibus.app.sysadmin.updatewizard.schema.util;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.util.ProjectUpdateWizardConstants;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.schema.ArchibusFieldDefBase;
import com.archibus.utility.StringUtil;

/**
 * Describes different methods specific to Sql Server database.
 * 
 * @author Catalin Purice
 */
@SuppressWarnings("PMD.AvoidUsingSql")
public final class SqlServerActions {
    
    /**
     * Constant.
     */
    private static final String PK_CONS = "PK";
    
    /**
     * Constant.
     */
    private static final String DF_CONS = "DF";
    
    /**
     * private constructor.
     */
    private SqlServerActions() {
        
    }
    
    /**
     * 
     * @param fieldDefn ARCHIBUS field definition
     * @return the statement
     */
    public static String changeDefaultValue(final ArchibusFieldDefBase.Immutable fieldDefn) {
        Object dfltValue = SchemaUpdateWizardUtilities.getDefaultValue(fieldDefn);
        if (StringUtil.isNullOrEmpty(dfltValue)) {
            dfltValue = "NULL";
        } else {
            dfltValue =
                    SchemaUpdateWizardUtilities.formatDefaultValue(String.valueOf(dfltValue),
                        fieldDefn);
        }
        final String contraintName =
                String.format("DF_%s_%s_default", fieldDefn.getTableName(), fieldDefn.getName());
        return String.format("ALTER TABLE %s ADD CONSTRAINT %s DEFAULT %s FOR %s",
            fieldDefn.getTableName(), contraintName, dfltValue, fieldDefn.getName());
    }
    
    /**
     * 
     * @param type constraint type
     * @param tableName table name
     * @param fieldName field name
     * @return List of constraint names
     */
    private static List<String> dropConstraintIfExists(final String type, final String tableName,
            final String fieldName) {
        
        String tables = "";
        String fields = "";
        String sqlRestriction = "";
        // for PK Constraints
        if (PK_CONS.equals(type)) {
            tables =
                    "sysobjects c_obj, sysobjects t_obj, syscolumns  col, master.dbo.spt_values v, sysindexes i";
            fields = "i.name AS name";
            sqlRestriction =
                    String.format(
                        "c_obj.uid = user_id() AND c_obj.xtype in ('UQ' ,'PK') AND t_obj.id = c_obj.parent_obj  "
                                + "AND t_obj.xtype = 'U' AND t_obj.id  = col.id "
                                + "AND col.name = index_col(t_obj.name,i.indid,v.number) "
                                + "AND t_obj.id = i.id AND c_obj.name = i.name AND "
                                + "t_obj.name = '%s' AND v.number > 0 "
                                + "AND v.number <= i.keycnt AND v.type = 'P'",
                        tableName.toLowerCase(Locale.getDefault()));
        } else {
            // for default value and FK constraint
            fields = "dobj.name as name";
            
            sqlRestriction += String.format("col.object_id = object_id(N'%s')", tableName);
            
            // for default value constraint
            if (DF_CONS.equals(type)) {
                tables =
                        "sys.columns col left outer join sys.objects dobj "
                                + "on dobj.object_id = col.default_object_id";
                sqlRestriction += "and dobj.type = 'D' and dobj.name is not null";
            } else if (type.length() > 0) {
                sqlRestriction += String.format(" AND c_obj.name LIKE '%s%%'", type);
            }
            
            if (fieldName.length() > 0) {
                sqlRestriction += String.format(" AND col.name='%s'", fieldName);
            }
        }
        
        final List<String> allConstraints = getQueryResult(tables, fields, sqlRestriction);
        final List<String> dropConstStmts = new ArrayList<String>();
        
        for (final String constraintName : allConstraints) {
            final String dropStatement =
                    SchemaUpdateWizardConstants.ALTER_TABLE + tableName
                            + SchemaUpdateWizardConstants.DROP_CONSTRAINT + constraintName;
            dropConstStmts.add(dropStatement);
        }
        return dropConstStmts;
    }
    
    /**
     * 
     * @param tableName table name
     * @param fieldName field name
     * @return list of primary keys constraints
     */
    public static List<String> dropPkConstraintIfExists(final String tableName,
            final String fieldName) {
        return dropConstraintIfExists(PK_CONS, tableName, fieldName);
    }
    
    /**
     * 
     * @param constraintName name of the constraint
     * @param tableName table name
     * @param fieldName field name
     * @return list of foreign keys constraints
     */
    public static List<String> dropFkConstraintIfExists(final String constraintName,
            final String tableName, final String fieldName) {
        return dropConstraintIfExists(constraintName, tableName, fieldName);
    }
    
    /**
     * 
     * @param tableName table name
     * @param fieldName field name
     * @return list of default constraint
     */
    public static String dropDefaultValueConstraintIfExists(final String tableName,
            final String fieldName) {
        final List<String> dropConstrStmt = dropConstraintIfExists(DF_CONS, tableName, fieldName);
        return dropConstrStmt.isEmpty() ? "" : dropConstrStmt.get(0);
    }
    
    /**
     * 
     * @param tables tables
     * @param fields fields
     * @param restriction sql restriction
     * @return list of object names
     *         <p>
     *         Suppress PMD warning "PMD.AvoidUsingSql".
     *         <p>
     *         Justification: Case #4: Changes to SQL schema.
     */
    private static List<String> getQueryResult(final String tables, final String fields,
            final String restriction) {
        
        final String sql = String.format("SELECT %s FROM %s WHERE %s", fields, tables, restriction);
        final DataSource getterDs =
                DataSourceFactory.createDataSource()
                    .addTable(ProjectUpdateWizardConstants.AFM_TBLS).addQuery(sql);
        getterDs.addVirtualField(ProjectUpdateWizardConstants.AFM_TBLS, "name",
            DataSource.DATA_TYPE_TEXT);
        final List<DataRecord> records = getterDs.getRecords();
        final List<String> results = new ArrayList<String>();
        for (final DataRecord record : records) {
            results.add(record.getString("afm_tbls.name"));
        }
        return results;
    }
    
    /**
     * return true if table has identity column.
     * 
     * @param tableName table name
     * @param fieldName field name
     * 
     * @return identity no
     *         <p>
     *         Suppress PMD warning "AvoidUsingSql" in this method.
     *         <p>
     *         Justification: Case #1: Statements with SELECT WHERE EXISTS ... pattern.
     */
    public static boolean isIdentityTable(final String tableName, final String fieldName) {
        final String identityStmt =
                "SELECT (CASE WHEN EXISTS(SELECT 1 FROM information_schema.columns "
                        + "WHERE columnproperty(object_id(table_name), column_name,'IsIdentity') = 1 "
                        + "AND table_name='%s' AND column_name LIKE '%s' ) THEN 1 ELSE 0 END) AS hasIdentity";
        
        final String query = String.format(identityStmt, tableName, fieldName);
        
        final DataSource identityDS =
                DataSourceFactory
                    .createDataSource()
                    .addTable(SchemaUpdateWizardConstants.AFM_TBLS)
                    .addQuery(query)
                    .addVirtualField(SchemaUpdateWizardConstants.AFM_TBLS, "hasIdentity",
                        DataSource.DATA_TYPE_INTEGER);
        final int answer = identityDS.getRecord().getInt("afm_tbls.hasIdentity");
        
        return answer == 1 ? true : false;
    }
    
    /**
     * Get the next identity no for autoincrement tables(sybase/sqlserver). This is used to build
     * DDL command.
     * 
     * @param tableName table name
     * @return current identity
     * 
     *         <p>
     *         Suppress PMD warning "PMD.AvoidUsingSql".
     *         <p>
     *         Justification: Case #4: Changes to SQL schema.
     */
    public static int getIdentity(final String tableName) {
        final String query = "SELECT get_identity('" + tableName + "') AS identity_no";
        final DataSource identityDS = DataSourceFactory.createDataSource();
        identityDS
            .addTable(ProjectUpdateWizardConstants.AFM_FLDS_TRANS)
            .addQuery(query)
            .addVirtualField(ProjectUpdateWizardConstants.AFM_FLDS_TRANS, "identity_no",
                DataSource.DATA_TYPE_INTEGER);
        final DataRecord record = identityDS.getRecord();
        return record.getInt("afm_flds_trans.identity_no");
    }
    
    /**
     * Sets identity on or off for SQLServer.
     * 
     * @param tableName table name
     * @param isOn true or false
     * @return the set identity command
     *         <p>
     *         Suppress PMD warning "AvoidUsingSql" in this method.
     *         <p>
     *         Justification: Case #4: Changes to SQL schema.
     */
    public static String setIdentity(final String tableName, final boolean isOn) {
        final StringBuffer buffer = new StringBuffer("SET IDENTITY_INSERT ");
        buffer.append(tableName);
        
        if (isOn) {
            buffer.append(" ON");
        } else {
            buffer.append(" OFF");
        }
        return buffer.toString();
    }
}
