This folder contains 1.0-style MDX view examples.

1.0-style MDX views use the Mondrian library that requires commons-math-1.0.jar.

The Energy Management activity requires commons-math-2.0 jar, so starting from V.19.1, 
Web Central ships with commons-math-2.0.jar in the WEB-INF\lib folder.

To run 1.0-style MDX examples or any 1.0-style MDX views:

1. Copy commons-math-1.0.jar from the schema/ab-products/solutions/compatibility/view-examples-mdx/
   folder to the WEB-INF\lib folder.
   
2. Remove commons-math-2.0.jar from the WEB-INF\lib folder.

3. Restart the application server.
