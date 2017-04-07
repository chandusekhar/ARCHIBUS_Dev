package com.archibus.app.solution.common.view.taghandler.viewexamples;

import java.util.*;

import javax.servlet.http.HttpServletRequest;

import com.archibus.context.Context;
import com.archibus.utility.StringUtil;
import com.archibus.view.taghandler.*;
import com.archibus.view.taghandler.render.panel.PanelRendererBase;

/**
 * Example of custom form panel that display multiple rows with fields.
 * 
 * @author Sergey Kuramshin
 */
public class MultiFormSimpleTag extends PanelSimpleTag {
    
    @Override
    protected PanelRendererBase getPanelRenderer() {
        return new MultiFormRenderer();
    }
    
    // default title for select value action
    // @translatable
    private final String SELECT_VALUE_TOOLTIP = "Select Value";
    
    // counts label rows when generateLabelRowHtml() method is called
    int labelRowCounter = 0;
    
    // how many rows to display
    int rows = 1;
    
    /**
     * Called after all form fields have been bound to the data source.
     */
    @Override
    protected void afterBindFieldsToDataSource() {
        final List<FieldSimpleTag> originalFields = new ArrayList<FieldSimpleTag>();
        originalFields.addAll(this.fields);
        
        for (final FieldSimpleTag originalField : originalFields) {
            originalField.setDynamicAttribute("", "rownum", 0);
        }
        
        // make (N-1) copies of fields defined in AXVW
        // keep original fields unchanged
        for (int i = 1; i < this.rows; i++) {
            for (final FieldSimpleTag originalField : originalFields) {
                final FieldSimpleTag newField = (FieldSimpleTag) originalField.clone();
                
                // modify the field IDs
                final String originalId = newField.getId();
                final String newId = originalId + "_row" + i;
                newField.setId(newId);
                
                // hide labels in new rows
                newField.setShowLabel(false);
                newField.setShowPlaceholder(false);
                
                newField.setDynamicAttribute("", "rownum", i);
                
                this.fields.add(newField);
            }
        }
    }
    
    /**
     * This method is called before the form fields are processed, and before any HTML is created.
     */
    @Override
    protected void beforeDoTag() {
        super.beforeDoTag();
        
        // type="form" ensures that doTag() will produce the form HTMl and JS code
        setType("form");
        setLabelsPosition("top");
        
        // get the number of rows from the URL query parameter
        final HttpServletRequest request = getRequest();
        final String rowsParameter = request.getParameter("rows");
        if (rowsParameter != null) {
            this.rows = Integer.parseInt(rowsParameter);
        }
    }
    
    /**
     * Generates default field actions. Overridden to set row-specific field IDs.
     * 
     * @param context
     * @param field
     */
    @Override
    protected void generateDefaultFieldActions(final Context context, final FieldSimpleTag field) {
        if (field.hasActions()) {
            return;
        }
        
        // generate default actions
        final List<ActionSimpleTag> defaultActions =
                FieldActionsSupport.generateDefaultActions(context, this, field);
        
        final int rownum = (Integer) field.getDynamicAttribute("rownum");
        
        // add actions to the field
        for (final ActionSimpleTag action : defaultActions) {
            
            // modify selectValue commands
            for (final CommandSimpleTag command : action.getCommands()) {
                if (command.getType().equals("selectValue")) {
                    final String strFieldNames = (String) command.getDynamicAttribute("fieldNames");
                    
                    final List<String> fieldNames = StringUtil.tokenizeString(strFieldNames, ",");
                    final List<String> newFieldNames = new ArrayList<String>(fieldNames.size());
                    for (String fieldName : fieldNames) {
                        
                        // remove the old (invalid) postfix
                        final int oldPostfixIndex = fieldName.indexOf("_row");
                        if (oldPostfixIndex > 0) {
                            fieldName = fieldName.substring(0, oldPostfixIndex);
                        }
                        
                        // create new postfix
                        if (rownum > 0) {
                            fieldName = fieldName + "_row" + rownum;
                        }
                        
                        newFieldNames.add(fieldName);
                    }
                    
                    // set modified fieldNames attribute
                    final String strNewFieldNames =
                            FieldActionsSupport.convertFieldListToCsv(newFieldNames);
                    command.setDynamicAttribute("", "fieldNames", strNewFieldNames);
                }
            }
            
            field.addAction(action);
        }
    }
    
    /**
     * Overridden to process custom select value action custom action must be callFunction with
     * functionName of type function('row', arg1, arg2 ...) 'row' argument will be replaced with
     * current row number
     */
    @Override
    protected void generateDefaultFieldActions() {
        final Context context = getContext();
        final Map<String, String> customActions = new HashMap<String, String>();
        
        for (final FieldSimpleTag field : this.fields) {
            if (!field.isHiddenField()) {
                final String baseKey = field.getTable() + "." + field.getName();
                
                /*
                 * if field has action and is one of the original fields replace row argument and
                 * save function name to map
                 */
                if (field.hasActions()) {
                    if ((Integer) field.getDynamicAttribute("rownum") == 0) {
                        final List<ActionSimpleTag> actions = field.getActions();
                        for (final ActionSimpleTag action : actions) {
                            for (final CommandSimpleTag command : action.getCommands()) {
                                if (command.getType().equals("callFunction")
                                        && command.getDynamicAttribute("functionName").toString()
                                            .indexOf("'row'") != -1) {
                                    final String functionName =
                                            command.getDynamicAttribute("functionName").toString();
                                    customActions.put(baseKey, functionName);
                                    command.setDynamicAttribute(
                                        "",
                                        "functionName",
                                        functionName.replace("'row'",
                                            field.getDynamicAttribute("rownum").toString()));
                                    action.setId(field.getId() + "_selectValue");
                                }
                            }
                        }
                    }
                }
                /*
                 * if is a copied field and original field has actions add action to this field
                 */
                if ((Integer) field.getDynamicAttribute("rownum") > 0) {
                    if (customActions.containsKey(baseKey)) {
                        final String functionName = customActions.get(baseKey).toString();
                        addCustomAction(field, functionName);
                    }
                }
                
                generateDefaultFieldActions(context, field);
            }
        }
    }
    
    /*
     * add a custom action to field
     */
    private void addCustomAction(final FieldSimpleTag field, final String functionName) {
        final ActionSimpleTag action = new ActionSimpleTag();
        action.setId(field.getId() + "_selectValue");
        action.setTitle("...");
        action.setTooltip(this.SELECT_VALUE_TOOLTIP);
        action.setType("");
        final CommandSimpleTag command = new CommandSimpleTag();
        command.setType("callFunction");
        command.setDynamicAttribute("", "functionName",
            functionName.replace("'row'", field.getDynamicAttribute("rownum").toString()));
        action.addCommand(command);
        field.addAction(action);
    }
}