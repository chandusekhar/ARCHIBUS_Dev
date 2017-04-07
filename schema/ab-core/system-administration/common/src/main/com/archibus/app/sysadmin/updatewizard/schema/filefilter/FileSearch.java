package com.archibus.app.sysadmin.updatewizard.schema.filefilter;

import java.io.File;
import java.util.*;

import com.archibus.utility.StringUtil;

/**
 * Search for files in /archibus based on pattern.
 *
 * @author Catalin
 * @param <T> File search type
 *
 */
public class FileSearch<T> {

    /**
     * sql finded files.
     */
    private final List<File> findedFiles;

    /**
     * File filter.
     */
    private final T fileFilter;

    /**
     * Constructor.
     *
     * @param fileFilter file filter type
     */
    public FileSearch(final T fileFilter) {
        // super(dbType);
        this.fileFilter = fileFilter;
        this.findedFiles = new ArrayList<File>();
    }

    /**
     * search for files and initialize the member files.
     *
     * @param dir folder
     * @return this
     */
    public FileSearch<T> search(final File dir) {
        final File[] sqlFiles = dir.listFiles((java.io.FilenameFilter) this.fileFilter);
        
        if (StringUtil.notNullOrEmpty(sqlFiles) && sqlFiles.length > 0) {
            addFiles(sqlFiles);
        }
        final File[] files = dir.listFiles();
        if (StringUtil.notNullOrEmpty(sqlFiles)) {
            for (final File file : files) {
                if (file.isDirectory()) {
                    search(file);
                }
            }
        }
        return this;
    }

    /**
     * Adds files.
     *
     * @param filesFound founded files
     */
    private void addFiles(final File[] filesFound) {
        for (final File file : filesFound) {
            this.findedFiles.add(file);
        }
    }

    /**
     * @return the findedFiles
     */
    public List<File> getFindedFiles() {
        return this.findedFiles;
    }

}
