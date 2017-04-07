package com.archibus.datasource.cascade.priority;

import java.util.*;
import java.util.Map.Entry;

import com.archibus.datasource.cascade.loader.tabletree.CascadeTableDef;

/**
 * 
 * Provides methods that order the SQL commands for execution for Cascade Delete.
 * <p>
 * 
 * @author Catalin Purice
 * 
 */
public class SqlExecPriorityDeleteImpl extends AbstractSqlExecPriority implements SqlExecPriority {
    
    /**
     * All UPDATE statements. Order DOES NOT matter.
     */
    private final List<String> allUpdateSetNullStmt = new ArrayList<String>();
    
    /**
     * All DELETE statements. Order DOES matter. Children first.
     */
    private final List<String> allDeleteStmt = new ArrayList<String>();
    
    /**
     * Constructor.
     * 
     * @param rootTable cascade table
     */
    public SqlExecPriorityDeleteImpl(final CascadeTableDef rootTable) {
        super(rootTable);
    }
    
    /**
     * 
     * Process Level.
     * 
     * @param level level ID
     * @param iter iterator
     */
    private void processLevel(final int level,
            final Iterator<Entry<Integer, List<TablePriority>>> iter) {
        while (iter.hasNext()) {
            final Entry<Integer, List<TablePriority>> elem = iter.next();
            if (level == elem.getKey()) {
                for (final TablePriority table : elem.getValue()) {
                    if (level == table.getLevel()) {
                        this.allDeleteStmt.addAll(table.getSqlCommands().getAfmDocCommands());
                        this.allDeleteStmt.addAll(table.getSqlCommands().getDeleteCommands());
                        this.allUpdateSetNullStmt
                        .addAll(table.getSqlCommands().getUpdateCommands());
                    }
                }
                break;
            }
        }
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public void prioritizeSqlCommands(final Map<Integer, List<TablePriority>> tables) {
        final Set<Entry<Integer, List<TablePriority>>> set = tables.entrySet();
        for (int level = getMaxDeepLevel(); level >= 0; level--) {
            final Iterator<Entry<Integer, List<TablePriority>>> iter = set.iterator();
            processLevel(level, iter);
        }
        this.sqlCommands.addAll(this.allUpdateSetNullStmt);
        this.sqlCommands.addAll(this.allDeleteStmt);
    }
}
