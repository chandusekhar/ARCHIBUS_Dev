package com.archibus.datasource.cascade.priority;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.cascade.loader.tabletree.CascadeTableDef;
import com.archibus.schema.ForeignKey.Immutable;
import com.archibus.utility.StringUtil;

/**
 * 
 * Provides methods that orders the SQL commands before execution.
 * <p>
 * 
 * @author Catalin Purice
 * 
 */
public abstract class AbstractSqlExecPriority {
    /**
     * SQL commands.
     */
    protected final List<String> sqlCommands = new ArrayList<String>();
    
    /**
     * Priority Index. Decide order of execution.
     */
    private int priorityIndex;
    
    /**
     * max level of dependency.
     */
    private int maxDeepLevel;
    
    /**
     * Table name.
     */
    private final CascadeTableDef rootTable;
    
    /**
     * Cascade tables as list.
     */
    private final List<TablePriority> cascadeTableList = new ArrayList<TablePriority>();
    
    /**
     * Constructor.
     * 
     * @param rootTable cascade root table
     */
    public AbstractSqlExecPriority(final CascadeTableDef rootTable) {
        this.rootTable = rootTable;
    }
    
    /**
     * Getter for the sqlCommands property.
     * 
     * @see sqlCommands
     * @return the sqlCommands property.
     */
    public List<String> getSqlCommands() {
        return this.sqlCommands;
    }
    
    /**
     * 
     * Transform a CascadeTableDef into list of tables.
     * 
     */
    public void initializePriorityLevels() {
        this.rootTable.setLevel(0);
        this.cascadeTableList.add(new TablePriority(this.rootTable.getName(), this.rootTable
            .getLevel(), this.priorityIndex, this.rootTable
            .hasPrimaryKeyReference(), this.rootTable.getSqlCommands()));
        addChildren(this.rootTable);
    }
    
    /**
     * 
     * Adds table to list of tables.
     * 
     * @param cascadeTable cascade table
     */
    private void addChildren(final CascadeTableDef cascadeTable) {
        for (final CascadeTableDef cTable : cascadeTable.getChildren()) {
            final int level = cascadeTable.getLevel() + 1;
            cTable.setLevel(level);
            if (level > this.maxDeepLevel) {
                this.maxDeepLevel = level;
            }
            this.cascadeTableList.add(new TablePriority(cTable.getName(), cTable.getLevel(),
                ++this.priorityIndex, cTable.hasPrimaryKeyReference(), cTable.getSqlCommands()));
            addChildren(cTable);
        }
    }
    
    /**
     * 
     * Get tables that have primary key defined as foreign key.
     * 
     * @param tables all cascadable tables
     * @return primary key referenced tables
     */
    private List<TablePriority> getPrimaryKeyTables(final List<TablePriority> tables) {
        final List<TablePriority> pkTables = new ArrayList<TablePriority>();
        for (final TablePriority cascadeTable : tables) {
            if (cascadeTable.hasPrimaryKeyReference()) {
                pkTables.add(cascadeTable);
            }
        }
        return pkTables;
    }
    
    /**
     * 
     * Get tables by level.
     * 
     * @param level level id
     * @return list of tables
     */
    private List<TablePriority> getTablesByLevel(final int level) {
        final List<TablePriority> cascadeTables = new ArrayList<TablePriority>();
        for (final TablePriority cascadeTable : this.cascadeTableList) {
            if (level == cascadeTable.getLevel()) {
                cascadeTables.add(cascadeTable);
            }
        }
        return cascadeTables;
    }
    
    /**
     * 
     * Returns true if the priority must be changed.
     * 
     * @param child child table
     * @param parent parent table
     * @param isInsert if the operation is insert/delete
     * @return true if the priority must be changed and false otherwise
     */
    private boolean switchPriority(final TablePriority child, final TablePriority parent,
            final boolean isInsert) {
        boolean isSwitch = false;
        if (isInsert) {
            if (parent.getExecutionIndex() > child.getExecutionIndex()) {
                isSwitch = true;
            }
        } else {
            if (parent.getExecutionIndex() < child.getExecutionIndex()) {
                isSwitch = true;
            }
        }
        return isSwitch;
    }
    
    /**
     * 
     * Returns all SQL commands in dependency order.
     * 
     * @param cascadeTablesAsList list of tables
     **/
    private void orderByPriorityIndex(final List<TablePriority> cascadeTablesAsList) {
        
        // bubble sort
        boolean swap = false;
        do {
            swap = false;
            for (int i = 1; i < cascadeTablesAsList.size(); i++) {
                if (cascadeTablesAsList.get(i - 1).getExecutionIndex() < cascadeTablesAsList.get(i)
                        .getExecutionIndex()) {
                    final TablePriority temp = cascadeTablesAsList.get(i);
                    cascadeTablesAsList.set(i, cascadeTablesAsList.get(i - 1));
                    cascadeTablesAsList.set(i - 1, temp);
                    swap = true;
                }
            }
        } while (swap);
    }
    
    /**
     * 
     * Sets dependency.
     * 
     * @param child child table
     * @param orderedTables list of tables
     * @param isInsert if the operation is insert/delete
     * @return boolean if the index has been swapped
     */
    protected boolean setProcessingIndex(final TablePriority child,
            final List<TablePriority> orderedTables, final boolean isInsert) {
        
        boolean swap = false;
        
        final Iterator<TablePriority> iter = orderedTables.iterator();
        
        while (iter.hasNext()) {
            
            final TablePriority table = iter.next();
            
            final Immutable fkey =
                    ContextStore.get().getProject().loadTableDef(child.getName())
                    .findForeignKeyByReferenceTable(table.getName());
            
            if (StringUtil.notNullOrEmpty(fkey)
                    && table.getName().equalsIgnoreCase(fkey.getReferenceTable())
                    && switchPriority(child, table, isInsert)) {
                swapExecutionIndex(table, child, orderedTables);
                swap = true;
            }
        }
        return swap;
    }
    
    /**
     * 
     * Swap execution index.
     * 
     * @param parent parent table
     * @param child child table
     * @param orderedTables ordered table list
     */
    private void swapExecutionIndex(final TablePriority parent, final TablePriority child,
            final List<TablePriority> orderedTables) {
        // identify tables in initial array
        final TablePriority parentTable = orderedTables.get(orderedTables.indexOf(parent));
        final TablePriority childTable = orderedTables.get(orderedTables.indexOf(child));
        // swap
        final int temp = parentTable.getExecutionIndex();
        parentTable.setExecutionIndex(childTable.getExecutionIndex());
        childTable.setExecutionIndex(temp);
    }
    
    /**
     * 
     * Prioritize children tables on the same dependency level and returns the cascade tables
     * ordered.
     * 
     * @param cascadeTables cascade table tree
     * @param isInsert boolean
     */
    protected void prioritizeTables(final List<TablePriority> cascadeTables,
            final boolean isInsert) {
        
        boolean swap = false;
        do {
            swap = false;
            for (final TablePriority child : cascadeTables) {
                if (child.hasPrimaryKeyReference()) {
                    swap = setProcessingIndex(child, cascadeTables, isInsert);
                }
                if (swap) {
                    break;
                }
            }
        } while (swap);
    }
    
    /**
     * 
     * Get Document SQL Commands.
     * 
     * @return List<String> of statements
     */
    public List<String> getDocumentSqlCommands() {
        initializePriorityLevels();
        final List<String> afmDocStmts = new ArrayList<String>();
        for (final TablePriority table : this.cascadeTableList) {
            afmDocStmts.addAll(table.getSqlCommands().getAfmDocCommands());
        }
        return afmDocStmts;
    }
    
    /**
     * Getter for the maxDeepLevel property.
     * 
     * @see maxDeepLevel
     * @return the maxDeepLevel property.
     */
    protected int getMaxDeepLevel() {
        return this.maxDeepLevel;
    }
    
    /**
     * {@inheritDoc}
     */
    public void prioritize() {
        
        initializePriorityLevels();
        
        // prioritize tables for delete.
        final Map<Integer, List<TablePriority>> orderedTablesByLevel =
                new HashMap<Integer, List<TablePriority>>();
        orderedTablesByLevel.put(0, Arrays.asList(this.cascadeTableList.get(0)));
        
        for (int level = 1; level <= getMaxDeepLevel(); level++) {
            final List<TablePriority> allLevelTables = getTablesByLevel(level);
            final List<TablePriority> pkLevelTables = getPrimaryKeyTables(allLevelTables);
            
            allLevelTables.removeAll(pkLevelTables);
            
            prioritizeTables(pkLevelTables, this instanceof SqlExecPriorityUpdateImpl);
            prioritizeTables(allLevelTables, this instanceof SqlExecPriorityUpdateImpl);
            
            pkLevelTables.addAll(allLevelTables);
            orderByPriorityIndex(pkLevelTables);
            
            orderedTablesByLevel.put(level, pkLevelTables);
        }
        
        prioritizeSqlCommands(orderedTablesByLevel);
    }
    
    /**
     * Prioritize SQL commands list for cascade delete.
     * 
     * @param map list of tables ordered by dependency
     */
    abstract void prioritizeSqlCommands(final Map<Integer, List<TablePriority>> map);
    
}
