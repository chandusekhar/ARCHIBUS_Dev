package com.archibus.app.sysadmin.updatewizard.project.transfer.mergeschema;

import java.util.List;

import com.archibus.app.sysadmin.updatewizard.project.util.LangUtilities;

/**
 * 
 * Provides Business Logic for merge data dictionary update.
 * <p>
 * 
 * @author Catalin Purice
 * @since 21.3
 * 
 */
public class Executor implements IExecutor {
    /**
     * Table record.
     */
    private final DictionaryRecord record;
    
    /**
     * Command.
     */
    private ICommand command;
    
    /**
     * Constructor.
     * 
     * @param record record
     */
    public Executor(final DictionaryRecord record) {
        super();
        this.record = record;
    }
    
    /**
     * {@inheritDoc}
     */
    public void execute() {
        switch (this.record.getChangeType()) {
            case TBL_IS_NEW:
                this.command = new TableCommand(this.record);
                this.command.add();
                break;
            case NEW:
                this.command = new FieldCommand(this.record);
                this.command.add();
                break;
            case TBL_IN_PROJ_ONLY:
                this.command = new TableCommand(this.record);
                this.command.remove();
                break;
            case PROJECT_ONLY:
                this.command = new TranslatableFieldCommand(this.record);
                this.command.remove();
                break;
            case REVIEW_GROUP:
            case EDIT_GROUP:
                processReferencedFields(this.record.getChangeType().name().toLowerCase());
                break;
            case SL_HEADING:
            case ML_HEADING:
            case ENUM_LIST:
                processTranslatableFields();
                break;
            default:
                this.command = new FieldCommand(this.record);
                this.command.update();
        }
    }
    
    /**
     * Process translatable fields.
     */
    private void processTranslatableFields() {
        if (LangUtilities.isLangEn()) {
            this.command = new FieldCommand(this.record);
        } else {
            this.command = new TranslatableFieldCommand(this.record);
        }
        this.command.update();
    }
    
    /**
     * 
     * Process referenced fields.
     * 
     * @param refFieldName referenced field name.
     */
    private void processReferencedFields(final String refFieldName) {
        this.command = new FieldCommand(this.record);
        ((FieldCommand) this.command).validateAndAddIfMissing(refFieldName);
        this.command.update();
    }
    
    /**
     * {@inheritDoc}
     */
    public List<String> getStatements() {
        return this.command.getStatements();
    }
    
    /**
     * {@inheritDoc}
     */
    public List<String> getRefStatements() {
        return this.command.getRefStatements();
    }
    
    /**
     * {@inheritDoc}
     */
    public List<String> getPostponedStatements() {
        return this.command.getPostponedStatements();
    }
}
