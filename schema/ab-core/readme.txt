
___________________________________
The webapps/archibus/ab-core Folder

This webapps/archibus/ab-core folder and its sub-folders contain files
internal to the operation of the ARCHIBUS product.  These files are
open for review, but are not intended to be modified in the typical
deployment and modifications to these files are not supported.

This ab-core folder is required for 17.2-and-later views that use the
View 2.0 view file format.

_______________
View Conversion

If your views and layouts are not already converted to View 2.0 format
you can run convertFrameset.bat and then convertView.bat to convert View 1.0
framesets and views into 17.2 layout-views and views.  To do so, 
You may have to modify the paths variables in the two bat files to match 
your directory structure.

Run convertFrameset first if you do not already have a layouts
directory full of converted framesets. There are more extensive
instructions in the two bat files.