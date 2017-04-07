<?xml version="1.0" encoding="UTF-8"?>
<!-- The XML line above declares that this XSL file is a flavor of XML file.
The xsl:stylesheet tag below identifies its contents as being an XSL style-sheet.
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<!-- The xsl:template tag declares its contents to be a formatting template.
	The match attribute determines what part of the XML input to the XSL style-sheet
	the template should be applied to.  In the case of ARCHIBUS, the input
	to the xsl formatting template is the XML response to the query that the
	view made when it was loaded or refreshed.  "/" matches the root element
	of the response or all parts of the reponse.  -->
	<xsl:template match="/">
		<html>
		<title>
			Title of Hello World XSL HTML Output
		</title>
		<head>
		</head>
		<body>
			<font face="Arial">

			<p><b>Body of Hello World XSL HTML Output</b></p>

			<p>The body can contain HTML elements like tables:</p>

			<table cellspacing="0" cellpadding="3" border="1">
				<tr>
					<td>A : 1</td>
					<td>A : 2</td>
				</tr>
				<tr>
					<td>B : 1</td>
					<td>B : 2</td>
				</tr>
			</table>

			<p>Or the body can retrieve properties out of the response from the server for this view, such as the absolute application path:
			<xsl:value-of select="/*/preferences/@absoluteAppPath" />.</p>


			<p>You can find more examples of how to pull information from ARCHIBUS responses in the <a href="#Attribute%//@relativeFileDirectory%/ab-ex-response.htm">ab-ex-response.htm</a></p> example.

			</font>
		</body>
		</html>
	</xsl:template>

</xsl:stylesheet>


