package com.archibus.app.sysadmin.updatewizard.project.transfer.mergeschema;

import java.util.List;

import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.*;

/**
 * 
 * Provides methods that add/updates/deletes translatable data dictionary fields.
 * <p>
 * 
 * @author Catalin Purice
 * @since 21.3
 * 
 */
public class TranslatableFieldCommand extends FieldCommand implements ICommand {
    
    /**
     * Constructor.
     * 
     * @param fieldRecord change record
     */
    public TranslatableFieldCommand(final DictionaryRecord fieldRecord) {
        super(fieldRecord);
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public void update() {
        
        final DataSource fieldDs = DataSourceBuilder.afmFldsLang().clearRestrictions();
        fieldDs.addRestriction(Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS_LANG,
            ProjectUpdateWizardConstants.TABLE_NAME, this.getFieldRecord().getTableName()));
        fieldDs.addRestriction(Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS,
            ProjectUpdateWizardConstants.FIELD_NAME, this.getFieldRecord().getFieldName()));
        
        final DataRecord changedRecord = fieldDs.getRecord();
        
        if (StringUtil.notNullOrEmpty(changedRecord)) {
            final String propertyToUpdate = this.getFieldRecord().getPropertyToUpdate();
            final Object propertyValue =
                    this.getFieldRecord().getChangedRecord()
                        .getValue("afm_flds_trans." + propertyToUpdate);
            changedRecord
                .setValue("afm_flds_lang." + propertyToUpdate + LangUtilities.getFieldSuffix(),
                    propertyValue);
            
            final StringBuffer statement = StatementBuilder.buildUpdateStatement(changedRecord);
            this.statements.add(statement.toString());
        }
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public void remove() {
        final DataRecord langRecord = createLangRecordForField();
        final StringBuffer langStatement = StatementBuilder.buildDeleteStatement(langRecord);
        this.statements.add(langStatement.toString());
        super.remove();
    }
    
    /**
     * 
     * Create afm_flds_lang record.
     * 
     * @return afm_flds_lang record
     * @throws ExceptionBase Exception
     */
    private DataRecord createLangRecordForField() throws ExceptionBase {
        
        final DataSource afmFldsLangDs =
                ProjectUpdateWizardUtilities
                    .createDataSourceForTable(ProjectUpdateWizardConstants.AFM_FLDS_LANG);
        
        final DataRecord fldsLangRecord = afmFldsLangDs.createNewRecord();
        fldsLangRecord.setValue(ProjectUpdateWizardConstants.AFM_FLDS_LANG + ".table_name", this
            .getFieldRecord().getChangedRecord().getString("afm_flds_trans.table_name"));
        fldsLangRecord.setValue(ProjectUpdateWizardConstants.AFM_FLDS_LANG + ".field_name", this
            .getFieldRecord().getChangedRecord().getString("afm_flds_trans.field_name"));
        return fldsLangRecord;
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public List<String> getStatements() {
        return this.statements;
    }
    
}
