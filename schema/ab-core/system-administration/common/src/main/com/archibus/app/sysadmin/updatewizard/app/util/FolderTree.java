package com.archibus.app.sysadmin.updatewizard.app.util;

import java.io.File;
import java.text.MessageFormat;

import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.utility.*;
import com.enterprisedt.util.debug.Logger;

/**
 * Builds the folder tree.
 *
 * @author Catalin Purice
 *         
 */
public class FolderTree {

    /**
     * Type List.
     */
    private static final String[] TYPE_LIST = { "dir", "jar" };

    /**
     * Constant.
     */
    private static final String ELEMENT_NAME = "elementName";

    /**
     * Constant.
     */
    private static final String ELEMENT_TYPE = "elementType";

    /**
     * Constant.
     */
    private static final String ELEMENT_PATH = "elementPath";

    /**
     * Constant.
     */
    private static final String CHILDREN = "children";

    /**
     * Element.
     */
    private File element;

    /**
     * Type.
     */
    private String type;

    /**
     * Children.
     */
    private JSONArray children = new JSONArray();

    /**
     * Get type.
     *
     * @return this.type
     */
    private String getType() {
        return this.type;
    }

    /**
     * Get type.
     *
     * @return this.type
     */
    private String getPath() {
        return this.element.getPath().toString();
    }

    /**
     * Get Element name.
     *
     * @return element name
     */
    private String getElementName() {
        return this.element.getName().toString();
    }

    /**
     * Set element.
     *
     * @param element element
     */
    private void setElement(final File element) {
        this.element = element;
    }

    /**
     * Set type.
     *
     * @param type type
     */
    private void setType(final String type) {
        this.type = type;
    }

    /**
     * Builds JSON Array.
     *
     * @param appUpdWizTreeElem folderTree
     * @param allFolders all folders
     */
    private void buildJSONArray(final FolderTree appUpdWizTreeElem, final JSONArray allFolders) {

        final JSONObject jsonObj = new JSONObject();
        jsonObj.put(ELEMENT_NAME, appUpdWizTreeElem.getElementName());
        jsonObj.put(ELEMENT_TYPE, appUpdWizTreeElem.getType());
        jsonObj.put(ELEMENT_PATH, appUpdWizTreeElem.getPath());
        jsonObj.put(CHILDREN, appUpdWizTreeElem.children);

        allFolders.put(jsonObj);
    }

    /**
     * Get folder and jar file.
     *
     * @param path path
     * @param allFolders all folders
     * @throws ExceptionBase if server cannot read files
     */
    private void getFoldersAndJarFiles(final String path, final JSONArray allFolders)
            throws ExceptionBase {
            
        String webPath = path;
        if (StringUtil.isNullOrEmpty(webPath)) {
            webPath = ContextStore.get().getWebAppPath().toString();
        }
        final File folder = new File(webPath);
        if (!folder.canRead() && !folder.setReadOnly()) {
            throw new ExceptionBase();
        }
        final File[] files = folder.listFiles();

        if (StringUtil.isNullOrEmpty(files)) {
            return;
        }
        
        for (final File folderElement : files) {

            final FolderTree appUpdWizTreeElem = new FolderTree();

            if (folderElement.isDirectory()
                    && !("schemacompiled".equals(folderElement.getName().toLowerCase()))) {
                appUpdWizTreeElem.setType(FolderTree.TYPE_LIST[0]);
                appUpdWizTreeElem.setElement(folderElement);

                final String folderPath = appUpdWizTreeElem.element.getPath();

                appUpdWizTreeElem.children = getChildren(folderPath);

                buildJSONArray(appUpdWizTreeElem, allFolders);

            } else {

                final String fileName = folderElement.getName();
                final String ext =
                        fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length());
                        
                if (FolderTree.TYPE_LIST[1].equals(ext.toLowerCase())) {
                    appUpdWizTreeElem.setType(FolderTree.TYPE_LIST[1]);
                    appUpdWizTreeElem.setElement(folderElement);

                    buildJSONArray(appUpdWizTreeElem, allFolders);

                }
            }
        }
    }

    /**
     * Gets children for the folder.
     *
     * @param folder path
     * @return children folders
     */
    private JSONArray getChildren(final String folder) {
        final File[] fList = new File(folder).listFiles();
        final JSONArray childrenList = new JSONArray();

        if (StringUtil.notNullOrEmpty(fList)) {
            for (final File pathElement : fList) {
                
                final FolderTree elem = new FolderTree();
                final JSONObject child = new JSONObject();
                
                if (pathElement.isFile()) {
                    addFile(childrenList, pathElement, elem, child);
                } else {
                    addFolder(childrenList, pathElement, elem, child);
                }
            }
        }
        return childrenList;
    }
    
    /**
     *
     * Add Folder.
     * 
     * @param childrenList the file list
     * @param pathElement pathElement
     * @param elem element
     * @param child child
     */
    private void addFolder(final JSONArray childrenList, final File pathElement,
            final FolderTree elem, final JSONObject child) {
        elem.setElement(pathElement);
        elem.setType(FolderTree.TYPE_LIST[0]);
        child.put(ELEMENT_NAME, elem.getElementName());
        child.put(ELEMENT_TYPE, elem.getType());
        child.put(ELEMENT_PATH, elem.getPath());

        final JSONArray chld = getChildren(elem.getPath());
        child.put(CHILDREN, chld);

        childrenList.put(child);
    }
    
    /**
     *
     * Add File.
     * 
     * @param childrenList the file list
     * @param pathElement pathElement
     * @param elem element
     * @param child child
     */
    private void addFile(final JSONArray childrenList, final File pathElement,
            final FolderTree elem, final JSONObject child) {
        final String fileName = pathElement.getName();
        final String ext = fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length());

        if (FolderTree.TYPE_LIST[1].equals(ext.toLowerCase())) {
            elem.setType(FolderTree.TYPE_LIST[1]);
            elem.setElement(pathElement);
            child.put(ELEMENT_NAME, elem.getElementName());
            child.put(ELEMENT_TYPE, elem.getType());
            child.put(ELEMENT_PATH, elem.getPath());
            child.put(CHILDREN, null);

            childrenList.put(child);

        }
    }

    /**
     * Gets folders list.
     *
     * @return folder list
     */
    public String getFolderList() {
        final JSONArray allFolders = new JSONArray();
        try {
            getFoldersAndJarFiles("", allFolders);
        } catch (final ExceptionBase e) {
            Logger.getLogger(this.getClass()).error(MessageFormat
                .format("Package and Deploy Wizard: [{0}]", new Object[] { e.getMessage() }));
            throw new ExceptionBase(null, e.getMessage(), e);
        }
        return allFolders.toString();
    }
}
