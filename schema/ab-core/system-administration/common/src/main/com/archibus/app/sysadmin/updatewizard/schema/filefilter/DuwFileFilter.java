package com.archibus.app.sysadmin.updatewizard.schema.filefilter;

import java.io.*;
import java.util.Locale;

/**
 *
 * Implementation of a DUW files finder.
 * <p>
 *
 * @author CatalinP
 * @since 23.1
 * 
 */
public class DuwFileFilter implements FilenameFilter {

    /**
     * Db type name (oracle,sybase,mssql).
     */
    private final String dbType;

    /**
     * Constructor.
     *
     * @param dbType file name
     */
    public DuwFileFilter(final String dbType) {
        this.dbType = dbType.toLowerCase(Locale.getDefault());
    }

    @Override
    public boolean accept(final File file, final String filename) {
        boolean fileOK = true;
        final String fname = filename.toLowerCase(Locale.getDefault());
        fileOK &= fname.startsWith("schemawiz");
        fileOK &= fname.contains(this.dbType);
        fileOK &= fname.endsWith(".duw");
        return fileOK;
    }

    /**
     * Returns the job title.
     *
     * @param file DUW file
     * @return job title
     * @throws IOException throws exception if file not found
     */
    public static String getJobTitle(final File file) throws IOException {
        final FileReader fileReader = new FileReader(file);
        final LineNumberReader lnreader = new LineNumberReader(fileReader);
        String jobTitle = file.getName();
        String line = lnreader.readLine();
        while (line != null && line.length() > 0) {
            if (line.replace(" ", "").trim().startsWith("--partialJobStatus=")) {
                jobTitle = line.substring(line.indexOf('=') + 1, line.length());
                break;
            }
            line = lnreader.readLine();
        }
        fileReader.close();
        lnreader.close();
        return jobTitle;
    }

}
