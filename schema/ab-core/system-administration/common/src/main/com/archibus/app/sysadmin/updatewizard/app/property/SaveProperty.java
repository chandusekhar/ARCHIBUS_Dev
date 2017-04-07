package com.archibus.app.sysadmin.updatewizard.app.property;

import java.io.IOException;
import java.text.MessageFormat;
import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.app.sysadmin.updatewizard.app.util.*;
import com.archibus.utility.ExceptionBase;

/**
 * Saves paths selected from client side to application-update.properties file.
 * 
 * @author Catalin Purice
 * 
 */
public class SaveProperty extends SectionProperty {
    
    /**
     * Data paths to preserve.
     */
    private final List<String> dataPaths;
    
    /**
     * Extensions paths to preserve.
     */
    private final List<String> extPaths;
    
    /**
     * preserve types.
     */
    private final List<String> preserveTypePaths;
    
    /**
     * update types.
     */
    private final List<String> updTypePaths;
    
    /**
     * 
     * @param dataPaths @see {@link SaveProperty}
     * @param extPaths @see {@link SaveProperty}
     * @param updTypePaths @see {@link SaveProperty}
     * @param preserveTypePaths @see {@link SaveProperty}
     */
    public SaveProperty(final List<String> dataPaths, final List<String> extPaths,
            final List<String> updTypePaths, final List<String> preserveTypePaths) {
        super();
        this.dataPaths = dataPaths;
        this.extPaths = extPaths;
        this.updTypePaths = updTypePaths;
        this.preserveTypePaths = preserveTypePaths;
    }
    
    /**
     * Create .properties file.
     */
    private void createProperyFile() {
        try {
            AppUpdateWizardUtilities.copyTemplateFile();
        } catch (final IOException e) {
            throw new ExceptionBase(null, e.getMessage(), e);
        }
    }
    
    /**
     * Eliminates duplicates from path list.
     * 
     * @param pList path list
     * @return Distinct List<String>
     */
    private List<String> eliminateDuplicates(final List<String> pList) {
        final List<String> noDupList = new ArrayList<String>();
        for (final String elem : pList) {
            if (!noDupList.contains(elem)) {
                noDupList.add(elem);
            }
        }
        return noDupList;
    }
    
    /**
     * 
     * @param dataList list of data
     * @throws IOException exception
     */
    private void saveDataToPropertiesFile(final List<String> dataList) throws IOException {
        addEntryToFile(dataList, AppUpdateWizardConstants.DATA_PREFIX_EQ);
    }
    
    /**
     * @param extList list of extensions
     * @throws IOException exception
     */
    private void saveExtToPropertiesFile(final List<String> extList) throws IOException {
        addEntryToFile(extList, AppUpdateWizardConstants.EXTENSION_PREFIX_EQ);
    }
    
    /**
     * Saves paths to .property file.
     */
    public void saveToPropertiesFile() {
        
        createProperyFile();
        
        try {
            List<String> pathElements = null;
            
            initializePropertyFile();
            
            if (!this.dataPaths.isEmpty()) {
                pathElements = eliminateDuplicates(this.dataPaths);
                saveDataToPropertiesFile(pathElements);
            }
            
            if (!this.extPaths.isEmpty()) {
                pathElements = eliminateDuplicates(this.extPaths);
                saveExtToPropertiesFile(pathElements);
            }
            
            if (!this.updTypePaths.isEmpty()) {
                pathElements = eliminateDuplicates(this.updTypePaths);
                commentAppDeploy(pathElements, true);
            }
            
            if (!this.preserveTypePaths.isEmpty()) {
                pathElements = eliminateDuplicates(this.preserveTypePaths);
                commentAppDeploy(pathElements, false);
            }
            closeFile();
        } catch (final IOException e) {
            Logger.getLogger(this.getClass()).error(
                MessageFormat.format(AppUpdateWizardConstants.LOG_PREFIX_MESSAGE,
                    new Object[] { e.getMessage() }));
            throw new ExceptionBase(null, e.getMessage(), e);
        }
    }
    
}
