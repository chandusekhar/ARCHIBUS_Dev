package com.archibus.app.common.connectors.translation.file.inbound;

import java.io.*;
import java.util.*;

import com.archibus.app.common.connectors.translation.common.outbound.IRequestTemplate;
import com.archibus.app.common.connectors.translation.exception.TranslationException;

/**
 * A template for a request for files matching specified criteria.
 *
 * @author cole
 *
 */
public class FileReadRequestTemplate implements IRequestTemplate<String> {

    /**
     * The name of a parameter that refers to a java.io.File.
     */
    private final String pathnameParameterName;

    /**
     * The criteria for processing a file or searching a sub-directory with a particular name.
     */
    private final FilenameFilter filter;

    /**
     * Whether to search sub-directories for matching files. The default is no. Technically this
     * could be achieved with the filter, but less efficiently.
     */
    private final boolean recurseMatchingSubdirectories;

    /**
     * Whether FTP is used.
     */
    private final boolean usesFtp;

    /**
     * Create an adaptor that generates requests for a file or all files in a folder, but not in
     * nested folders.
     *
     * @param fileParameterName the name of the template parameter that contains the java.io.File
     *            for the file or folder from which to retrieve content.
     * @param usesFtp whether FTP is used.
     */
    public FileReadRequestTemplate(final String fileParameterName, final boolean usesFtp) {
        this(fileParameterName, null, false, usesFtp);
    }

    /**
     * Create an adaptor that generates requests for a file or all files in a folder, but not in
     * nested folders.
     *
     * @param fileParameterName the name of the template parameter that contains the java.io.File
     *            for the file or folder from which to retrieve content.
     */
    public FileReadRequestTemplate(final String fileParameterName) {
        this(fileParameterName, null, false, false);
    }

    /**
     * Create an adaptor that processes all files in a given folder matching the filter criteria.
     *
     * @param fileParameterName the name of the template parameter that contains the java.io.File
     *            for the file or folder from which to retrieve content.
     * @param filter the criteria for generating a request for a file or searching a sub-directory
     *            with a particular name.
     * @param recurseMatchingSubdirectories whether to search sub-directories for matching files.
     *            The default is no. Technically this could be achieved with the filter, but less
     *            efficiently.
     * @param usesFtp whether FTP is used.
     */
    public FileReadRequestTemplate(final String fileParameterName, final FilenameFilter filter,
            final boolean recurseMatchingSubdirectories, final boolean usesFtp) {
        this.filter = filter;
        this.recurseMatchingSubdirectories = recurseMatchingSubdirectories;
        this.pathnameParameterName = fileParameterName;
        this.usesFtp = usesFtp;
    }

    /**
     * Generate a request for the specified file.
     *
     * @param fileParameters parameters containing a FILE_PARAM with the file to be read.
     * @return a request for the file provided (the file itself).
     */
    @Override
    public String generateRequest(final Map<String, Object> fileParameters) {
        return (String) fileParameters.get(this.pathnameParameterName);
    }

    /**
     * Generate a request for the content of a particular file or files from a particular folder.
     *
     * @param templateParameters parameters that contain a fileParameterName mapped to a file name
     *            for a file or folder from which to retrieve content.
     * @return a collection of matching absolute paths to files.
     * @throws TranslationException when security prohibits access to Queue a directory's content
     *             (cause = SecurityException)
     */
    @Override
    public Queue<Map<String, Object>> generateRequestParameters(
            final Map<String, Object> templateParameters) throws TranslationException {
        Queue<Map<String, Object>> requestInstances;
        if (this.usesFtp) {
            requestInstances = new LinkedList<Map<String, Object>>();
            requestInstances.add(Collections.singletonMap(this.pathnameParameterName,
                templateParameters.get(this.pathnameParameterName)));
        } else {
            final File fileSystemNode =
                    new File((String) templateParameters.get(this.pathnameParameterName));
            if (fileSystemNode.isDirectory()) {
                try {
                    requestInstances = getMatchingFiles(fileSystemNode);
                } catch (final SecurityException e) {
                    /*
                     * Matching directories should be accessible. Being unable to access any of them
                     * is a violation of an assumption. Behavior after this point is undefined, so
                     * the process must abort.
                     */
                    throw new TranslationException(
                        "Unable to Queue contents of directory " + fileSystemNode.getAbsolutePath(),
                        e);
                }
            } else {
                requestInstances = new LinkedList<Map<String, Object>>();
                requestInstances.add(Collections.singletonMap(this.pathnameParameterName,
                    (Object) fileSystemNode.getAbsolutePath()));
            }
        }
        return requestInstances;
    }

    /**
     * Retrieve the Queue of files matching this adaptor's criteria from the given directory.
     *
     * @param directory the directory to search.
     * @return the Queue of matching file names.
     * @throws TranslationException if the directory passed is null.
     */
    private Queue<Map<String, Object>> getMatchingFiles(final File directory)
            throws TranslationException {
        if (directory == null) {
            throw new TranslationException("Searching null directory for files.", null);
        }
        final Queue<File> directories = new LinkedList<File>();
        directories.add(directory);
        final Queue<Map<String, Object>> files = new LinkedList<Map<String, Object>>();
        while (!directories.isEmpty()) {
            final String[] subNodes = directories.poll().list(this.filter);
            if (subNodes != null) {
                for (final String subNodeName : subNodes) {
                    final File subNode = new File(subNodeName);
                    if (subNode.isDirectory() && this.recurseMatchingSubdirectories) {
                        directories.add(subNode);
                    } else if (!subNode.isDirectory()) {
                        files.add(Collections.singletonMap(this.pathnameParameterName,
                            (Object) subNode.getAbsolutePath()));
                    }
                }
            }
        }
        return files;
    }
}
