In this folder, there are three tree control examples that cover three basic tree control cases:

1. Simple tree - The fields of tree levels are from multiple data sources (one or more tables) and are related via single/multiple foreign keys.

ab-ex-simple-tree-dpxdv.axvw

Description: 

This tree defines the department by division tree view, and user can expand/collapse the tree nodes; the onClick actions are define for both tree levels. By clicking a Division node, a panel with division details info is shown on the right. By clicking a Department node, a panel with department details info is shown on the right. 


2. Bridged tree - The fields of tree levels are from multiple data sources and are related via a bridge table.

ab-ex-bridged-tree-emxrmxdv.axvw

Description:

This tree defines the employees by rooms by department by division tree view, and user can expand or collapse the tree nodes; the onClick actions are define for the leaf nodes only. By clicking a non-leaf node will issue a collapse/expand event. By clicking on the employee node (leaf node), a panel with employee details info is shown on the right. 

3. Tree view with console window - the tree view that can be restricted by the console window, where user can filter the content of the tree or clear.

ab-ex-tree-with-console-wrxem.axvw (main file)
ab-ex-tree-with-console-dialog-wrxem.axvw (support file for the afmActions)

Description:

This tree defines the work requests by employee names. There is a console window with the restriction to employee name, once user enter a valid employee id and click the "Filter" button, the tree view's top level is restricted. By clicking the "Clear" will remove the previous restriction and refresh the tree view. Clicking the employee name nodes will collapse and expand the tree; clicking the work request code for the employee will display the work request detail info and work request parts info on the right.


4. Simple Hierarchy Tree - Contains one datasource and one panel. The datasource contains a hierarchiacl trace field.
    
   ab-ex-simple-hierarchy-tree-csi.axvw

   DescriptioN;
	This tree contains hierarchical structure of csi table. The top level is "0|". By expanding the top level node, the children of "0|%|" are dynamically generated, etc.. Clicking only the node's label will display the csi record details.


   ab-ex-simple-hierarchy-tree-ac.axvw
   This view is similar to ab-ex-simple-hierarchy-tree-csi.axvw


5. Performance Tests:
   
   ab-ex-loading-test-large-rm-em.axvw

   This view loads the all employees on the top tree level and for each employee, loads all the rooms (over 200). The loading speed is fairly fast, < 1sec.
 