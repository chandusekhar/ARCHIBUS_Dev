package com.archibus.eventhandler.tools;

import java.io.File;

import org.json.JSONArray;
import org.json.JSONObject;

public class FileSearch {
	private File[] dirArray;
	private JSONArray duplicateArray;
	private String[] ignoreDirArray;

	private int axvwCount;
	private int duplicateCount;
	private String separator;
	private char separatorChar;

	public FileSearch(String searchDirectory, String directoriesToIgnore) {
		dirArray = new File[1];
		axvwCount = 0;
		duplicateArray = new JSONArray();
		duplicateCount = 0;
		ignoreDirArray = new String[0];
		separator = File.separator;
		separatorChar = File.separatorChar;

		/* Regardless of whether the directory name contains 
		 * forward slashes or backslashes, java creates a File object 
		 * with the correct separator for the current OS
		 */
		visitAllFiles(new File(searchDirectory));
		createIgnoreDirArray(directoriesToIgnore);
		findDuplicates();
	}

	public void visitAllFiles(File dir) {
		if (dir.isDirectory()) {
			String[] children = dir.list();
			for (int i = 0; i < children.length; i++) {
				visitAllFiles(new File(dir, children[i]));
			}
		} else {
			if (dir.getName().endsWith(".axvw")) {
				dirArray[axvwCount] = dir;
				axvwCount++;
				if (axvwCount == dirArray.length)
					expandFileArray();
			}
		}
	}
	
	public void createIgnoreDirArray(String dirsToIgnore) {
		if (dirsToIgnore.length() != 0) {
			ignoreDirArray = dirsToIgnore.split(";");
			for (int p = 0; p < ignoreDirArray.length; p++) {
				ignoreDirArray[p] = ignoreDirArray[p].trim();
				/*
				 * check that all slashes in the directory name 
				 * are either forward or backward, 
				 * depending upon the OS
				 */
				ignoreDirArray[p] = ignoreDirArray[p].replace('\\', separatorChar);
				ignoreDirArray[p] = ignoreDirArray[p].replace('/', separatorChar);
				/*
				 * for uniformity, flank each directory name 
				 * with a slash
				 */
				if (!ignoreDirArray[p].startsWith(separator)
						&& !(ignoreDirArray[p].indexOf(":") > -1))
					ignoreDirArray[p] = separator + ignoreDirArray[p];
				if (!ignoreDirArray[p].endsWith(separator))
					ignoreDirArray[p] += separator;
			}
		}
	}

	public void findDuplicates() {
		String currentName;

		outerLoop:
		for (int i = 0; i < axvwCount; i++) {
			for (int k = 0; k < ignoreDirArray.length; k++) {
				if (dirArray[i].getPath().indexOf(ignoreDirArray[k]) > -1)
					continue outerLoop;				
			}
			currentName = dirArray[i].getName();

			innerLoop:
			for (int j = i + 1; j < axvwCount; j++) {
				for (int n = 0; n < ignoreDirArray.length; n++) {
					if (dirArray[j].getPath().indexOf(ignoreDirArray[n]) > -1)
						continue innerLoop;
				}
				if (currentName.equals(dirArray[j].getName())) {
					JSONObject json = new JSONObject();
					json.put("file1", dirArray[i].getPath());
					json.put("file2", dirArray[j].getPath());
					duplicateArray.put(json);
					duplicateCount++;
				}
			}
		}
	}

	private void expandFileArray() {
		File[] newArray = new File[dirArray.length * 2];
		for (int i = 0; i < dirArray.length; i++) {
			newArray[i] = dirArray[i];
		}
		dirArray = newArray;
	}

	public int getDuplicateCount() {
		return duplicateCount;
	}
	
	public int getAxvwCount() {
		return axvwCount;
	}

	public JSONArray getDuplicateArray() {
		return duplicateArray;
	}
}
