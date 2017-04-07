<?xml version="1.0"?>

<!-- Following line below is non standard to work in IE 5 -->
<!-- <xsl:stylesheet xmlns:xsl="http://www.w3.org/TR/WD-xsl"> -->

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">


<!-- The template element contains the rules to apply to the matching
nodes.  The "/" XSL pattern matches the root of the XML file and
therefore its entire contents This template applies the statments in
the HTML body to the entire XML file -->

<xsl:template match="/">

  <html>
  <body >

	<!-- Use the style sheet. -->
	<style>
	@import url( ab-ex-response.css );
	</style>

	<!-- ****** Main Title -->

	<table bgcolor="white" width="800">
		<tr class="AbExColorTitle" ><td>ARCHIBUS XSL Example </td></tr>
	</table>


<br />
<table width = "800" class="AbExColorText">

<tr>XSL is the Extensible Stylesheet Language for transforming XML
documents from one form to another.  You can convert between XML formats used
by different automated systems you.  Alternately, you can convert between XML
and human readable HTML, as in this example. <br /><br /> </tr>

<tr>XSL contains two component standards: It uses the XPath syntax for accessing
specific sections of XML documents; and it uses uses XSLT transformations for
defining the templates for performing the conversions.<br /><br /></tr>

<tr>This example illustrates the use of both XPath and XSLT to format typical XML response.   As
from the ARCHIBUS Web Central server as the test data.  These identical techniques can be
used to provide formatting overrides for ARCHIBUS view (.axvw) files. <br /><br /> </tr>

<tr>Click <A href="ab-ex-response.xml">here</A> to review the ab-ex-response.xml source file.<br /><br /></tr>

<tr>You may also wish to review the ab-ex-response.xsl file that holds the actual transforms to produce this page.
To test your own .xsl statements, alter the ab-ex-response.xsl, then refresh the view of
ab-ex-response.htm.<br /><br /></tr>

</table>


	<!-- ****** Finding elements and attributes -->

	<table bgcolor="white" width="800">
		<tr class="AbExColorTitle" ><td>Elements and Attributes</td><td> </td></tr>

		<!-- Select the View's title element.    -->

		<tr class="AbExColorData" >
			<td>View 'title' element value (Pattern '/*/title')</td>
			<td><xsl:value-of select="/*/title" /></td>
		</tr>

		<!-- Select the translatable attributes of the title.   -->

		<tr class="AbExColorData" >
			<td>View title's 'translatable' attribute value (Pattern '/*/title/@translatable')</td>
			<td><xsl:value-of select="/*/title/@translatable" /></td>
		</tr>
	</table>

<br />
<table width = "800" class="AbExColorText">

<tr>The "/*" pattern matches any root ancestor name.  Thus
the "/*/title" addresses the title beneath the afmXmlView root
node.<br /><br /></tr>

<tr>The @ symbol is used to address attributes.  <br /><br /></tr>

</table>

	<!-- ****** Nested elements

	You can use XPath names like folder names to walk down through
	the "tree" to access nested nodes and their attributes.

	-->

	<br />

	<table width="800">
		<tr class="AbExColorTitle" ><td>Addressing Nested Elements </td><td> </td></tr>

		<!-- The '@' symbol references a particular attribute. -->

		<!-- The absoluteAppPath gives the path relative to the web server.
		It is used by presentation layer code executed in the client-side
		browser to find files. -->

		<tr class="AbExColorData" >
			<td>/*/preferences/@absoluteAppPath</td>
			<td><xsl:value-of select="/*/preferences/@absoluteAppPath" /></td>
		</tr>

		<!-- The webAppPath gives the path on the server.  It is used by
		server-side code to find files.  It cannnot be accessed client-side. -->

		<tr class="AbExColorData" >
			<td>/*/preferences/@webAppPath</td>
			<td><xsl:value-of select="/*/preferences/@webAppPath" /></td>
		</tr>

		<!-- Use pathnames, like folder names, to access nested elements and attributes. -->

		<tr class="AbExColorData" >
			<td>/*/preferences/locale/dateFormat/@short</td>
			<td><xsl:value-of select="/*/preferences/locale/dateFormat/@short" /></td>
		</tr>

		<!-- If a level of the tree has multiple elements, you can select a particular
		element by number. -->

		<tr class="AbExColorData" >
			<td>/*/preferences/mail/addresses/address[1]/@name</td>
			<td><xsl:value-of select="/*/preferences/mail/addresses/address[1]/@name" /></td>
		</tr>


		<tr class="AbExColorData" >
			<td>/*/preferences/mail/addresses/address[1]/@value</td>
			<td><xsl:value-of select="/*/preferences/mail/addresses/address[1]/@value" /></td>
		</tr>


		<!-- You can also use functions. -->

		<tr class="AbExColorData" >
			<td>/*/preferences/mail/addresses/address[last()]/@name</td>
			<td><xsl:value-of select="/*/preferences/mail/addresses/address[last()]/@name" /></td>
		</tr>

		<!-- Most usefully, you can use specific tests to address a specific, desired element. -->

		<tr class="AbExColorData" >
			<td>/*/preferences/mail/addresses/address[@name='moveAdministratorEMail/@value']</td>
			<td><xsl:value-of select="/*/preferences/mail/addresses/address[@name='moveAdministratorEMail']/@value" /></td>
		</tr>

	</table>

<br />
<table width = "800" class="AbExColorText">

<tr>You can use XPath statements like you would folder names to access elements and attributes within nested XML elements.<br /><br /></tr>

<tr>You can use array references to specify a specific element
if there is more than one element at a particular level of nesting.<br /><br /></tr>

<tr>You can also use equality tests to select out a particular
element at a particular level of nesting.<br /><br /></tr>


</table>



	<!-- ****** Finding multiple elements

	-->

	<br />
	<table bgcolor="white" width="800">

		<tr class="AbExColorTitle" ><td>All Elements Named 'title' (Pattern '//title') </td> <td> </td> </tr>

		<xsl:for-each select="//title">
			<tr class="AbExColorData" >
				<td><xsl:value-of select="."/></td>
				<td><xsl:value-of select="name()"/></td>
			</tr>
		</xsl:for-each>
	</table>


<br />
<table width = "800" class="AbExColorText">

<tr>The "\\" path matches all levels of the input. <br /><br /></tr>

<tr>In this case "\\title" matches all elements within the input named title, and selects the titles of the view, the restriction, and the statistics. <br /><br /></tr>

<tr>The Xsl uses the "for-each" tag to loop through the multiple elements returned. <br /><br /></tr>

<tr>The Xsl also uses the "." or "self()" function to access the value of each node returned. <br /><br /></tr>

</table>


	<!-- ****** Finding multiple attributes

	The "@*" pattern matches _all_ attributes beneath the given element.

	 -->

	<br />
	<table bgcolor="white" width="800">

		<tr class="AbExColorTitle" ><td>All Child Attributes of the 'preferences' Element </td>
			<td>(Pattern '/*/preferences/@*')  </td> </tr>

		<xsl:for-each select="/*/preferences/@*">
			<tr class="AbExColorData" >
				<td><xsl:value-of select="name()"/></td>
				<td><xsl:value-of select="."/></td>
			</tr>
		</xsl:for-each>
	</table>

<br />
<table width = "800" class="AbExColorText">

<tr>The "@*" pattern matches all attributes as a specific level. <br /><br /></tr>

<tr>The Xsl uses the "for-each" tag to loop through the multiple elements returned. <br /><br /></tr>

<tr>The Xsl also uses the "name()" and the "." or "self()" function to access the values of each node returned. <br /><br /></tr>

</table>



	<!-- ****** Table-Group Information

	This view has only one table-group at the top level.  Some views
	have multiple table-groups at the same level;  many more
	have table-groups nested within other table-groups.

	-->

	<br />
	<table bgcolor="white" width="800">

		<tr class="AbExColorTitle" ><td>Table-Group Information </td>
			<td>(Pattern '/*/afmTableGroup[1]/@*')  </td> </tr>

		<!-- Show all attributes values for the table-group. -->

		<xsl:for-each select="/*/afmTableGroup[1]/@*">
			<tr class="AbExColorData" >
				<td>Name: <xsl:value-of select="name()"/></td>
				<td>Value: <xsl:value-of select="."/></td>
			</tr>
		</xsl:for-each>

		<tr></tr>
		<tr class="AbExColorData" >
			<td>Title (Pattern '/*/afmTableGroup[1]/title')</td>
			<td><xsl:value-of select="/*/afmTableGroup[1]/title"/></td>
		</tr>

	</table>

<br />
<table width = "800" class="AbExColorText">

<tr>Each group-band within a report -- or every frame or edit form -- represents one table group. <br /><br /></tr>

<tr>An ARCHIBUS view can hold multiple table-groups; table-groups can also nest. <br /><br /></tr>

</table>


	<!-- ****** Table Information

	o A tablegroup has a datasource, typically a database, that supplies the data to present.

	o A database queries multiple tables and fields.

	o Some views (e.g. the command menu bars) don't query a
	  database for their data but supply it right in the view.

	-->

	<br />
	<table bgcolor="white" width="800">

		<tr class="AbExColorTitle" ><td>Table Information </td>
			<td>(Pattern '/*/afmTableGroup[1]/dataSource/database/tables/table')  </td> </tr>

		<xsl:for-each select="/*/afmTableGroup[1]/dataSource/database/tables/table">
			<tr class="AbExColorData" >
				<td>Name: <xsl:value-of select="@name"/></td>
				<td>Role: <xsl:value-of select="@role"/></td>
			</tr>
		</xsl:for-each>


	</table>

<br />
<table width = "800" class="AbExColorText">

<tr>Each table-group can use data from a main or "drive" table and a standards table. <br /><br /></tr>

<tr>The table names and their roles are provided in the XML output. <br /><br /></tr>

</table>



	<!-- ****** Field Information


	-->

	<br />
	<table bgcolor="white" width="800">

		<tr class="AbExColorTitle" >
			<td>Field Information </td>
			<td>(Pattern '/*/afmTableGroup[1]/dataSource/data/fields/field')  </td>
			<td> </td>
		</tr>

		<xsl:for-each select="/*/afmTableGroup[1]/dataSource/data/fields/field">
			<tr class="AbExColorData" >
				<td>Heading: <xsl:value-of select="@singleLineHeading"/></td>
				<td>Tbl: <xsl:value-of select="@table"/></td>
				<td>Fld: <xsl:value-of select="@name"/></td>
			</tr>
		</xsl:for-each>


	</table>


<br />
<table width = "800" class="AbExColorText">

<tr>The field information is part of the returned data. <br /><br /></tr>

<tr>The "for-each" xsl template can step through each field. <br /><br /></tr>

</table>



	<!-- ****** Data -->


	<br />

	<table bgcolor="white" width="800">
		<tr class="AbExColorTitle" >
			<td>Data </td>
		</tr>
	</table>

	<table bgcolor="white" width="800">


		<tr class="AbExColorTitleSoft" >
			<td>Field Headings:</td><td>Each of /*/afmTableGroup[1]/dataSource/data/fields/field</td>
		</tr>
		<tr class="AbExColorTitleSoft" >
			<td>Field Names:</td><td>Each of /*/afmTableGroup[1]/dataSource/data/records/record[1]/@*</td>
		</tr>

		<tr class="AbExColorTitleSoft" >
			<td>Data Values:</td><td>Each of /*/afmTableGroup[1]/dataSource/data/records/record</td>
		</tr>

	</table>

	<br />

	<table bgcolor="white" width="800">

		<!-- Display the Field Heading -->

		<tr class="AbExColorHeader1" >
			<xsl:for-each select="/*/afmTableGroup[1]/dataSource/data/fields/field">
				<td><xsl:value-of select="@singleLineHeading"/></td>
			</xsl:for-each>
		</tr>

		<!-- Display the Field Names.  These are the attributes of every record,
		but we need only to display the first one. -->

		<tr class="AbExColorHeader2" >
			<xsl:for-each select="/*/afmTableGroup[1]/dataSource/data/records/record[1]/@*">
				<td><xsl:value-of select="name()"/></td>
			</xsl:for-each>
		</tr>


		<!-- Display the Field Data -->

		<xsl:for-each select="/*/afmTableGroup[1]/dataSource/data/records/record"> <!-- for each record -->

			<tr class="AbExColorData" >
				<xsl:for-each select="@*"> <!-- for each field -->
					<td><xsl:value-of select="."/></td>
				</xsl:for-each>
			</tr>

		</xsl:for-each>
	</table>

	<!-- ****** Statistics -->


	<table bgcolor="white" width="800">

		<tr class="AbExColorHeader2" >
			<td>Statistics</td>
		</tr>

		<tr class="AbExColorHeader1" >
			<xsl:for-each select="/*/afmTableGroup[1]/dataSource/statistics/statistic">
				<td><xsl:value-of select="title"/></td>
				<td><xsl:value-of select="@value"/></td>
			</xsl:for-each>
		</tr>

	</table>

	<br />


	<table bgcolor="white" width="800">

		<tr class="AbExColorTitleSoft" >
			<td>Statistics:</td><td>Each of /*/afmTableGroup[1]/dataSource/statistics/statistic</td>
		</tr>
	</table>



<br />
<table width = "800" class="AbExColorText">

<tr>The xml output also contains the data in the view: in this case room data sorted by descending area. <br /><br /></tr>

<tr>You can use xsl loops to select the field titles and other information, or the data itself. <br /><br /></tr>

<tr>If your view contains statistics, the result of the statistics calculations are also in the output and you can
query these results and format them as you will. <br /><br /></tr>

<tr> <br /><br /></tr>

</table>

<!-- ****** Conditional example -->


	<table bgcolor="white" width="800">
		<tr class="AbExColorTitle" >
			<td>Conditionals </td>
		</tr>
	</table>

	<table bgcolor="white" width="800">

		<!-- for each record -->
		<xsl:for-each select="/*/afmTableGroup[1]/dataSource/data/records/record">

		<!-- Typically, you would specify any sort in the A/FM view so the database server
		would process the request quickly, but you can also treat the XML result set like
		a sortable table. -->
		<xsl:sort select="@rm.rm_id" />

			<!-- Comparison Test: only show rooms with area > 150 sqft. -->
			<xsl:if test="@rm.area &gt; 150.00">

				<tr class="AbExColorHeader2">
					<td><xsl:value-of select="@rm.rm_id"/></td>
					<td><xsl:value-of select="@rm.area"/></td>
					<xsl:choose>
					   <xsl:when test="contains( @rmstd.description, 'Executive' )">
						<td class="AbExColorDataHighlight"><xsl:value-of select="@rmstd.description"/></td>
					   </xsl:when>
					   <xsl:otherwise>
						<td><xsl:value-of select="@rmstd.description"/></td>
					   </xsl:otherwise>
					</xsl:choose>
				</tr>


			</xsl:if>

		</xsl:for-each>
	</table>

<br />
<table width = "800" class="AbExColorText">

<tr>You can use conditional tests like "if" tests and a multiple condition "choose" test.<br /><br /></tr>

<tr>In this example, rooms with an area less than 150.00 have been filtered out (and so room 102 doesn't show)<br /><br /></tr>

<tr>Also in this example, room descriptions containing the word 'Executive' have been highlighted.<br /><br /></tr>

</table>


<!-- ****** Variable example -->

	<!-- You can use a variable for whitespace so it is preserved through the XML transform -->
	<xsl:variable name="whiteSpace">
		<xsl:text> </xsl:text>
	</xsl:variable>

	<!-- You can select values, nodes, or parts of the XML tree into variables. -->
	<xsl:variable name="appPath" select="/*/preferences/@absoluteAppPath" />

	<br />

	<table bgcolor="white" width="800">
		<tr class="AbExColorTitle" >
			<td>Variable </td>
			<td>Whitespace </td>
			<td>Value </td>
		</tr>

		<!-- You can test variables. -->
		<xsl:if test="$appPath !=''">
			<tr class="AbExColorDataHighlight" >
				<td>Application Path</td>
				<td><xsl:value-of select="$whiteSpace"/></td>
				<td><xsl:value-of select="$appPath"/></td>
			</tr>
		</xsl:if>

	</table>

<br />
<table width = "800" class="AbExColorText">

<tr>You can use variables within your .xsl files to simplify code and reduce repetition.<br /><br /></tr>

<tr>You can use variables in conditional tests and in creating output. <br /><br /></tr>

<tr> <br /><br /></tr>

</table>


  </body>
  </html>


</xsl:template>
</xsl:stylesheet>


