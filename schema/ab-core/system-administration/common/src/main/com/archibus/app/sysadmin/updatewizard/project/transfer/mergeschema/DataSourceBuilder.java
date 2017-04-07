package com.archibus.app.sysadmin.updatewizard.project.transfer.mergeschema;

import java.util.List;

import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;

/**
 * 
 * Provides methods that returns specific DataSource object.
 * <p>
 * 
 * Used by MergeSchema.
 * 
 * @author Catalin Purice
 * @since 21.3
 * 
 */
public final class DataSourceBuilder {
    
    /**
     * constant.
     * <p>
     * Suppress PMD warning "AvoidUsingSql" in this static variable.
     * <p>
     * Justification: This is not an SQL command.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private static final String IN_CLAUSE_VALUES_FOR_APPLY = "APPLY CHANGE,DELETE FIELD";
    
    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private DataSourceBuilder() {
        super();
    }
    
    /**
     * @return afm_flds_trans dataSource.
     */
    public static DataSource afmFldsTrans() {
        return ProjectUpdateWizardUtilities.createDataSourceForTable(
            ProjectUpdateWizardConstants.AFM_FLDS_TRANS).addRestriction(
            Restrictions.isNotNull(ProjectUpdateWizardConstants.AFM_FLDS_TRANS, "data_dict_diffs"));
    }
    
    /**
     * @param actionType action type
     * @return DataRecords records.
     *         <p>
     *         Suppress PMD warning "AvoidUsingSql" in this method.
     *         <p>
     *         Justification: Case #1: Statements with SELECT WHERE EXISTS ... pattern.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public static List<DataRecord> loadChanges(final ActionType actionType) {
        
        final String query =
                "SELECT * FROM afm_flds_trans a1 WHERE autonumbered_id NOT IN "
                        + "(SELECT autonumbered_id FROM afm_flds_trans a1 WHERE change_type='NEW' "
                        + "AND EXISTS(SELECT 1 FROM afm_flds_trans a2 "
                        + "WHERE a2.table_name = a1.table_name AND a2.change_type='TBL_IS_NEW')) ";
        
        final DataSource dataS = DataSourceBuilder.afmFldsTrans().addQuery(query);
        
        if (actionType == ActionType.REC_ACTION) {
            dataS.addRestriction(Restrictions.in(ProjectUpdateWizardConstants.AFM_FLDS_TRANS,
                "rec_action", IN_CLAUSE_VALUES_FOR_APPLY));
        } else {
            dataS.addRestriction(Restrictions.in(ProjectUpdateWizardConstants.AFM_FLDS_TRANS,
                "chosen_action", IN_CLAUSE_VALUES_FOR_APPLY));
        }
        
        dataS
        .addSort(
                "(CASE WHEN afm_flds_trans",
                "change_type='TBL_IS_NEW' THEN 1 WHEN afm_flds_trans.change_type='NEW' THEN 2 WHEN afm_flds_trans.change_type='REF_TABLE' THEN 3 ELSE 4 END)");

        return dataS.getRecords();
    }
    
    /**
     * @return afm_flds dataSource.
     */
    public static DataSource afmFlds() {
        return ProjectUpdateWizardUtilities
            .createDataSourceForTable(ProjectUpdateWizardConstants.AFM_FLDS);
    }
    
    /**
     * @return afm_tbls dataSource.
     */
    public static DataSource afmTbls() {
        return ProjectUpdateWizardUtilities
            .createDataSourceForTable(ProjectUpdateWizardConstants.AFM_TBLS);
    }
    
    /**
     * @return afm_flds_lang dataSource.
     */
    public static DataSource afmFldsLang() {
        
        return DataSourceFactory.createDataSource()
            .addTable(ProjectUpdateWizardConstants.AFM_FLDS_LANG)
            .addField(ProjectUpdateWizardUtilities.TABLE_NAME)
            .addField(ProjectUpdateWizardUtilities.FIELD_NAME)
            .addField("enum_list" + LangUtilities.getFieldSuffix())
            .addField("ml_heading" + LangUtilities.getFieldSuffix());
        
    }
    
}
