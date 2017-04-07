package com.archibus.app.sysadmin.updatewizard.project.transfer.in;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.context.ContextStore;
import com.archibus.schema.*;

/**
 * 
 * Provides methods that calculates processing order.
 * <p>
 * 
 * @author Catalin Purice
 * @since 21.3
 * 
 */
public class TablesImportPriority implements ITablesImportPriority {
    
    /**
     * Represents a number user to prioritize the tables. If some tables have undetected circular
     * FKs then we might want not be able to order them and after a certain number of iteration we
     * want to break the loop.
     */
    private static final int MAX_ITERATIONS_MULTIPLIER = 10;

    /**
     * Dependency Tree.
     */
    private final List<TableTree> tablesTrees;
    
    /**
     * List of tables selected by the user.
     */
    private final Set<String> tablesToTransferIn;
    
    /**
     * List of tables by import order.
     */
    private final List<String> tablesByImportOrder;
    
    /**
     * Current branch.
     */
    private final List<String> currentBranch;
    
    /**
     * Tells if the references will be dropped or not.
     */
    private final boolean isDropReferences;
    
    /**
     * Circular references in format Table name,field name.
     */
    private final List<Map<String, String>> circularRefFound = new ArrayList<Map<String, String>>();
    
    /**
     * Constructor.
     * 
     * @param tablesToTransferIn tables to be transfered in
     * @param isDropReferences tells if the references will be dropped or not
     */
    public TablesImportPriority(final List<String> tablesToTransferIn,
            final boolean isDropReferences) {
        super();
        this.isDropReferences = isDropReferences;
        this.tablesToTransferIn = new HashSet<String>(tablesToTransferIn);
        this.tablesByImportOrder = new ArrayList<String>();
        this.currentBranch = new ArrayList<String>();
        this.tablesTrees = new ArrayList<TableTree>();
    }
    
    /**
     * 
     * @param childTable table name
     * @param parentTable parent table
     */
    private void addCircularReference(final String childTable, final String parentTable) {
        final TableDef.ThreadSafe childTableDef =
                ContextStore.get().getProject().loadTableDef(childTable);
        String childFieldName = "";
        for (final ForeignKey.Immutable foreignKey : childTableDef.getForeignKeys()) {
            if (parentTable.equalsIgnoreCase(foreignKey.getReferenceTable())) {
                childFieldName = foreignKey.getName();
                if (!isCircRefAlreadyExists(childTable, childFieldName)) {
                    final Map<String, String> circularReference = new HashMap<String, String>();
                    circularReference.put(ProjectUpdateWizardUtilities.TABLE_NAME, childTable);
                    circularReference.put(ProjectUpdateWizardUtilities.FIELD_NAME, childFieldName);
                    this.circularRefFound.add(circularReference);
                }
            }
        }
    }
    
    /**
     * Returns true if the reference has been already added or false otherwise.
     * 
     * @param tableName table name
     * @param fieldName field name
     * @return true if the reference has been already added
     */
    private boolean isCircRefAlreadyExists(final String tableName, final String fieldName) {
        boolean alreadyExists = false;
        for (final Map<String, String> circRef : this.circularRefFound) {
            if (tableName.equals(circRef.get(ProjectUpdateWizardUtilities.TABLE_NAME))
                    && fieldName.equals(circRef.get(ProjectUpdateWizardUtilities.FIELD_NAME))) {
                alreadyExists = true;
                break;
            }
        }
        return alreadyExists;
    }
    
    /**
     * 
     * @param loopTableName table name
     * @return circular reference as a String in the format table1-->table2-->table1
     */
    private String getCircularRefBranch(final String loopTableName) {
        final StringBuffer branch = new StringBuffer();
        for (final String node : this.currentBranch) {
            branch.append(node);
            branch.append("-->");
        }
        return branch.append(loopTableName).toString();
    }
    
    /**
     * Drops foreign keys in ARCHBUS and Sql database.
     * 
     * @param childTable child table name
     * @param parentTable parent table name
     */
    private void removeCircularRefTable(final String childTable, final String parentTable) {
        final TableDef.ThreadSafe childTableDef =
                ContextStore.get().getProject().loadTableDef(childTable);
        String childFieldName = "";
        for (final ForeignKey.Immutable foreignKey : childTableDef.getForeignKeys()) {
            if (parentTable.equalsIgnoreCase(foreignKey.getReferenceTable())) {
                childFieldName = foreignKey.getName();
            }
        }
        final CircularReference cRef = new CircularReference(childTable, childFieldName);
        cRef.dropArchibusReference();
        cRef.dropSqlReference();
        ContextStore.get().getProject().clearCachedTableDefs();
    }
    
    /**
     * 
     * @param tableName table name
     * @return list of children tables
     */
    private List<String> getParentTables(final String tableName) {
        
        final TableDef.ThreadSafe tableDef =
                ContextStore.get().getProject().loadTableDef(tableName);
        
        final List<String> parentTables = new ArrayList<String>();
        
        for (final ForeignKey.Immutable foreignKey : tableDef.getForeignKeys()) {
            if (tableDef.getFieldDef(foreignKey.getName()).isValidateData()) {
                
                final String parentName = foreignKey.getReferenceTable();
                
                if (!parentTables.contains(parentName)
                        && this.tablesToTransferIn.contains(parentName)) {
                    parentTables.add(parentName);
                }
            }
        }
        return parentTables;
    }
    
    /**
     * Order tables by import dependency.
     * 
     */
    private void orderTablesByDependency() {

        int iterations = this.tablesToTransferIn.size() * MAX_ITERATIONS_MULTIPLIER;

        while (!this.tablesToTransferIn.isEmpty() && iterations > 0) {
            for (final TableTree tableTree : this.tablesTrees) {
                final List<TableTree> parents = tableTree.getParents();
                if (parents.isEmpty()) {
                    addTable(tableTree.getName());
                } else {
                    boolean allParentsOrdered = true;
                    for (final TableTree parent : parents) {
                        if (!this.tablesByImportOrder.contains(parent.getName())) {
                            allParentsOrdered = false;
                            break;
                        }
                    }
                    if (allParentsOrdered) {
                        addTable(tableTree.getName());
                    }
                }
            }
            iterations--;
        }
        
        /**
         * Add circular tables if any.
         */
        for (final Map<String, String> circRef : this.circularRefFound) {
            this.tablesByImportOrder.add(circRef.get("table_name"));
        }
    }
    
    /**
     * 
     * Adds table to ordered table list.
     * 
     * @param tableName table name to be added
     */
    private void addTable(final String tableName) {
        if (!this.tablesByImportOrder.contains(tableName)) {
            this.tablesByImportOrder.add(tableName);
            this.tablesToTransferIn.remove(tableName);
        }
        
    }
    
    /**
     * 
     * builds dependency tree.
     */
    private void buildDependencyTree() {
        for (final String tableName : this.tablesToTransferIn) {
            final TableTree root = new TableTree(tableName);
            readParents(root);
            this.tablesTrees.add(root);
        }
    }
    
    /**
     * 
     * Read parents of the table.
     * 
     * @param childTable table name
     */
    private void readParents(final TableTree childTable) {
        
        this.currentBranch.add(childTable.getName());
        
        final List<String> parentTables = getParentTables(childTable.getName());
        
        for (final String parentTable : parentTables) {
            childTable.addParents(parentTable);
            if (this.currentBranch.contains(parentTable)) {
                ProjectUpdateWizardLogger.logWarning(String.format(
                    "Found circular reference on branch:%s", getCircularRefBranch(parentTable)));
                if (this.isDropReferences) {
                    removeCircularRefTable(childTable.getName(), parentTable);
                }
                addCircularReference(childTable.getName(), parentTable);
                break;
            } else {
                readParents(childTable.getParent(parentTable));
            }
        }
        this.currentBranch.remove(childTable.getName());
    }
    
    /**
     * Builds the tree dependency and Order tables by import dependency.
     * 
     */
    public void calculatePriority() {
        buildDependencyTree();
        orderTablesByDependency();
    }
    
    /**
     * @return the tablesByImportOrder
     */
    public List<String> getTablesByImportOrder() {
        return this.tablesByImportOrder;
    }
    
    /**
     * @return the circularRefFound
     */
    public List<Map<String, String>> getCircularReferences() {
        return this.circularRefFound;
    }
    
}