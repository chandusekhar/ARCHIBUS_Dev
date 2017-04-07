package com.archibus.datasource.cascade.priority;

import java.util.*;
import java.util.Map.Entry;

import com.archibus.datasource.cascade.loader.tabletree.CascadeTableDef;

/**
 * Provides methods that order the SQL commands for execution for Cascade Update.
 * 
 * @author Catalin Purice
 * 
 */
public class SqlExecPriorityUpdateImpl extends AbstractSqlExecPriority implements SqlExecPriority {
    
    /**
     * All INSERT statements. Order DOES matter. Parents first.
     */
    private final List<String> allInsertStmt = new ArrayList<String>();
    
    /**
     * All UPDATE statements. Order DOES NOT matter.
     */
    private final List<String> allUpdateStmt = new ArrayList<String>();
    
    /**
     * All DELETE statements. Order DOES matter. Children first.
     */
    private final List<String> allDeleteStmt = new ArrayList<String>();
    
    /**
     * Constructor.
     * 
     * @param rootTable cascade table
     */
    public SqlExecPriorityUpdateImpl(final CascadeTableDef rootTable) {
        super(rootTable);
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    void prioritizeSqlCommands(final Map<Integer, List<TablePriority>> orderedTables) {
        
        // build insert and commands list
        prioritizeInsertAndUpdateCommands(orderedTables);
        
        // build delete commands
        prioritizeDeleteCommands(orderedTables);
        
        this.sqlCommands.addAll(this.allInsertStmt);
        this.sqlCommands.addAll(this.allUpdateStmt);
        this.sqlCommands.addAll(this.allDeleteStmt);
    }
    
    /**
     * 
     * Prioritize the INSERT/UPDATE statements.
     * 
     * @param tables ordered tables
     */
    private void prioritizeInsertAndUpdateCommands(final Map<Integer, List<TablePriority>> tables) {
        final Set<Entry<Integer, List<TablePriority>>> set = tables.entrySet();
        for (int level = 0; level <= getMaxDeepLevel(); level++) {
            final Iterator<Entry<Integer, List<TablePriority>>> iter = set.iterator();
            while (iter.hasNext()) {
                final Entry<Integer, List<TablePriority>> elem = iter.next();
                if (level == elem.getKey()) {
                    final List<TablePriority> orderedTablesByLevel = elem.getValue();
                    for (int index = orderedTablesByLevel.size() - 1; index >= 0; index--) {
                        final TablePriority table = orderedTablesByLevel.get(index);
                        
                        this.allInsertStmt.addAll(table.getSqlCommands().getInsertCommands());
                        this.allUpdateStmt.addAll(table.getSqlCommands().getAfmDocCommands());
                        this.allUpdateStmt.addAll(table.getSqlCommands().getUpdateCommands());
                    }
                    break;
                }
            }
        }
        
    }
    
    /**
     * Prioritize the DELETE statements.
     * 
     * @param tables ordered tables.
     */
    private void prioritizeDeleteCommands(final Map<Integer, List<TablePriority>> tables) {
        final Set<Entry<Integer, List<TablePriority>>> set = tables.entrySet();
        for (int level = getMaxDeepLevel(); level >= 0; level--) {
            final Iterator<Entry<Integer, List<TablePriority>>> iter = set.iterator();
            while (iter.hasNext()) {
                final Entry<Integer, List<TablePriority>> elem = iter.next();
                if (level == elem.getKey()) {
                    for (final TablePriority tableByLevel : elem.getValue()) {
                        if (level == tableByLevel.getLevel()) {
                            this.allDeleteStmt.addAll(tableByLevel.getSqlCommands()
                                .getDeleteCommands());
                        }
                    }
                    break;
                }
            }
        }
    }
}
