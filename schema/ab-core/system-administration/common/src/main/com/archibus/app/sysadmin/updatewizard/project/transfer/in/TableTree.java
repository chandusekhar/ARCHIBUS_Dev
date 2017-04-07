package com.archibus.app.sysadmin.updatewizard.project.transfer.in;

import java.util.*;

/**
 * 
 * Provides methods that builds tables dependency tree.
 * <p>
 * 
 * @author Catalin Purice
 * @since 21.3
 * 
 */
public class TableTree {
    /**
     * Table name.
     */
    private String name;
    
    /**
     * current child table.
     */
    private TableTree child;
    
    /**
     * List of referenced tables.
     */
    private final List<TableTree> parents;
    
    /**
     * 
     * Constructor.
     * 
     * @param name table name
     */
    public TableTree(final String name) {
        this.name = name;
        this.parents = new ArrayList<TableTree>();
    }
    
    /**
     * 
     * Adds parent table.
     * 
     * @param parent parent table name
     */
    public void addParents(final String parent) {
        final TableTree parentNode = new TableTree(parent);
        parentNode.child = this;
        this.parents.add(parentNode);
    }
    
    /**
     * Getter for the data property.
     * 
     * @see data
     * @return the data property.
     */
    public String getName() {
        return this.name;
    }
    
    /**
     * Setter for the data property.
     * 
     * @see data
     * @param data the data to set
     */
    
    public void setData(final String data) {
        this.name = data;
    }
    
    /**
     * Getter for the parent property.
     * 
     * @see parent
     * @return the parent property.
     */
    public TableTree getChild() {
        return this.child;
    }
    
    /**
     * Setter for the parent property.
     * 
     * @see parent
     * @param parent the parent to set
     */
    
    public void setParent(final TableTree parent) {
        this.child = parent;
    }
    
    /**
     * Getter for the children property.
     * 
     * @see children
     * @return the children property.
     */
    public List<TableTree> getParents() {
        return this.parents;
    }
    
    /**
     * returns parent tree.
     * 
     * @param parentName name of theparent
     * @return TableTree.
     */
    public TableTree getParent(final String parentName) {
        TableTree parentTree = null;
        for (final TableTree parent : this.parents) {
            if (parent.getName().equals(parentName)) {
                parentTree = parent;
                break;
            }
        }
        return parentTree;
    }
}
