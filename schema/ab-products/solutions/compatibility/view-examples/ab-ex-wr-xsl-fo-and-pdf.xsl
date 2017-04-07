<?xml version="1.0" encoding="UTF-8"?>

<!-- This is an example of a stylesheet used to transform XML data to XSL-FO, which the program
then converts into a pdf report. You can use this as a model for your own style sheets.  You can
use any XSL features supported by Xalan or any XSL-FO features supported by Apache FOP.

However, you will typically will only need to change the contents between the page header, page
footer, and page body tasks.  Search for the "Edit this section: begin/end" comments to locate the
portions of this template that are easily changed.

Within the body of this file, each area of techniques is broken out on a separate page.
Search for "block break-before" or for one of these headings:

1. DATA RETRIEVAL EXAMPLES
2. PREFERENCE RETRIEVAL EXAMPLES
3. SVG GRAPHICS EXAMPLES
4. TEXT ATTRIBUTES EXAMPLES
5. BORDER EXAMPLES
6. BITMAP IMAGES AND GRAPHICS EXAMPLES
7. WEB LINKS EXAMPLES
8. TABLE AND LIST EXAMPLES


-->

<!-- The above line is an XML declaration which states that XSL-FO is a member of the XML family. -->

<xsl:stylesheet version="1.1" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format" exclude-result-prefixes="fo">
	<xsl:output method="xml" version="1.0" omit-xml-declaration="no" indent="no"/>

	<!-- The template element contains the rules to apply to the matching nodes.  The "/" XSL
	pattern matches the root of the XML response the server generated for this view and therefore
	its entire contents.  Thus this template applies the statments in the body below to the entire
	XML response, not just one tree of it. -->
	<xsl:template match="/">

		<!-- This XSL statement writes an XSL-FO processing instruction to the output for the benefit of
		the Apache FOP processor. -->
		<xsl:processing-instruction name="cocoon-format">type="text/xslfo"</xsl:processing-instruction>

		<!-- Below is the required root element that declares the enclosed tags as part of the XSL Formatting Objects namespace. -->
		<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">


			<!-- Layout Master Set -->

			<!-- The master-set contains one or more page layout templates layouts that can be used in the XSL-FO
			document.   You can use different templates for different pages, e.g. for the title, contents, and body.
			For ARCHIBUS reports, one page master usually suffices.
			-->
			<fo:layout-master-set>
				<fo:simple-page-master margin="1cm" master-name="main-page" page-height="297mm" page-width="210mm">
 					<fo:region-before extent="1cm"/>
					<fo:region-after extent="1cm"/>
					<fo:region-body margin-top="2cm"  margin-bottom="1.5cm"/>
				</fo:simple-page-master>
			</fo:layout-master-set>


			<!-- Page Sequence
			Pages in the document are grouped into sequences.  The master-reference
			specifies what page layout to use for this sequence of pages.
			-->
			<fo:page-sequence master-reference="main-page">

				<!-- Page Header
				This is the content that will be "flowed" into the top region of each page.
				-->
				<fo:static-content flow-name="xsl-region-before">
					<!-- Edit this section: begin -->
					<!-- Define an underlined block text area as the header.  This example
					gets the last page by using a reference to the EndOfDocument block id
					defined below.  -->
					<fo:block font-size="12pt"
							font-weight="bold"
							border-bottom-color="black"
							border-bottom-style="solid"
							border-bottom-width="5pt">
							ARCHIBUS Sample Pdf Report Heading Page
							<fo:page-number/> of <fo:page-number-citation ref-id="EndOfDocument"/>
					</fo:block>
					<!-- Edit this section: end -->
				</fo:static-content>


				<!-- Page Footer
				This is the content that will be "flowed" into the bottom region of each page.
				-->
				<fo:static-content flow-name="xsl-region-after">
					<!-- Edit this section: begin -->
					<fo:block text-align="left"
							font-size="10pt"
							font-weight="bold"
							padding-top="3pt"
							border-top-style="solid"
							border-top-width="5pt"
							translatable="false">ARCHIBUS Sample Pdf Report Footer
					</fo:block>
					<!-- Edit this section: end -->
				</fo:static-content>


				<!-- Page Body
				This is the content that will be "flowed" into the center region of each page.
				The program will create page breaks within this content as needed.  If you
				need additional page breaks, use the break-before/after attributes, like so:
				<fo:block break-after="page" />
				<fo:block break-before="page" />
				-->
				<fo:flow flow-name="xsl-region-body">

					<!-- Edit this section: begin -->

<fo:block font-size="12pt">Page through this file to review different XSL-FO to PDF generation options.</fo:block>


<!-- _ 1. DATA RETRIEVAL EXAMPLES ________________________________________ -->

<fo:block
	font-size="24pt"
     text-align="center"
	space-before="30pt"
     space-before.conditionality="retain"
	space-after="12pt"
	>
	1. Data Retrieval Examples
</fo:block>

<fo:block id="1-data-retrieval" />

<fo:block color="navy" font-size="12pt" space-before="12pt" space-after="12pt">
1.A. Formatting Data from the Server Response -- Basic Example
</fo:block>

<!-- Format the 1st record into a simple table. -->

<!-- Title -->
<fo:block
	font-weight="bold"
	font-size="18pt"
	color="navy"
	border-color="navy"
	border-style="solid"
	margin="4pt"
	space-after="10pt"
	>
	Work Request: <xsl:value-of select="/*/afmTableGroup[1]/dataSource/data/records/record[1]/@wr.wr_id" />
</fo:block>

<!-- Satisfaction Rating: You can use xsl:choose statements to show different images with the proper number of stars to reflect ratings.
A similar xml:choose example is below.
-->
<fo:block
	font-weight="bold"
	font-size="10pt"
	color="green"
	>
	Satisfaction Rating: '<xsl:value-of select="/*/afmTableGroup[1]/dataSource/data/records/record[1]/@wr.satisfaction" />' out of
	<fo:inline>
		<fo:external-graphic src="{//preferences/@projectFolder}/graphics/rating-five-star.gif" />
	</fo:inline>
</fo:block>

<!-- Other Data Fields: Simple Method -->

<fo:block
	font-weight="bold"
	font-size="8pt"
	color="white"
	border-color="yellow"
	background-color="#91B3CF"
	border-style="solid"
	margin="4pt"
	padding="4pt"
	space-after="10pt"
	>
	<!-- Wrap the table in a block so that the block formatting applies to all cells. -->
	<fo:table>
		<fo:table-column column-width="50mm"/>
		<fo:table-column column-width="5mm"/>
		<fo:table-column column-width="50mm"/>

		<fo:table-body>
			<fo:table-row>
				<!-- First Column: Select the Field Headings from the schema section of the response
				display each heading as its own text block. -->
				<fo:table-cell>
					<xsl:for-each select="/*/afmTableGroup[1]/dataSource/data/fields/field/">
							<fo:block text-align="end">
								<xsl:value-of select="@singleLineHeading"/>
							</fo:block>
					</xsl:for-each>
				<!-- Middle Column: use an empty cell as a spacer. -->
				</fo:table-cell>
				<fo:table-cell>
				</fo:table-cell>
				<!-- Last Column: select the data from the record section of the response.  Display
				each datum in its own text block. -->
				<fo:table-cell>
					<xsl:for-each select="/*/afmTableGroup[1]/dataSource/data/records/record[1]/@*">
							<fo:block>
									<xsl:value-of select="."/>
							</fo:block>
					</xsl:for-each>
				</fo:table-cell>
			</fo:table-row>
		</fo:table-body>
	</fo:table>
</fo:block>


<!-- 1.B: Complete Method

The method above needs some tweaking since if one value is missing, or if you change the font for
one vlaue, the titles and columns will no longer match.  You can use xsl:if statements to provide a
value for missing data fields, but the example below illustrates a more robust approach.  The
example loops through the fields for the table-group in the schema section, and looks up the data
for the corresponding field.  This pattern extends easily to handle multiple table-groups, multiple
records, data-type-specific formatting, etc.  You may wish to refer to the default
ab-printable-pdf-fo.xsl to see how this pattern is extended for the default ARCHIBUS style
sheet.  -->

<fo:block color="navy" font-size="12pt" space-before="12pt" space-after="12pt">
1.B Formatting Data from the Server Response -- Expanded Example
</fo:block>


<!-- For each record in the result set for the first table-group. -->
<xsl:for-each select="/*/afmTableGroup[1]/dataSource/data/records/record">
	<xsl:variable name="recordIndex" select="position()"/>

	<!-- Create a table for each record. -->
	<fo:block font-weight="bold" font-size="6pt" color="black" border-color="#91B3D0" background-color="#C6D7C5" border-style="solid" margin="4pt" padding="4pt" space-after="10pt" >
	<fo:table>
		<fo:table-column column-width="50mm"/>
		<fo:table-column column-width="5mm"/>
		<fo:table-column column-width="50mm"/>

		<fo:table-body>
			<!-- For each field in the schema for this first table-group. -->
			<xsl:for-each select="/*/afmTableGroup[1]/dataSource/data/fields/field">
				<!-- Assemble the field name in table.field (e.g. wr.wr_id) format -->
				<xsl:variable name="fullFieldName" select="concat(@table,'.',@name)"/>
				<!-- Remember this field's title. -->
				<xsl:variable name="singleLineHeading" select="@singleLineHeading"/>
				<!-- Loop through the records in the result until you find the data for this field. -->
				<xsl:for-each select="/*/afmTableGroup[1]/dataSource/data/records/record[position()=$recordIndex]/@*">
					<xsl:if test="name(.)=$fullFieldName">
						<fo:table-row> <!-- Create a row for each field -->
							<fo:table-cell>  <!-- Column 1: this field's title -->
								<fo:block text-align="end">
									<xsl:value-of select="$singleLineHeading"/>
								</fo:block>
							</fo:table-cell>
							<fo:table-cell>  <!-- Column 2: a blank cell for spacing. -->
							</fo:table-cell>
							<fo:table-cell>  <!-- Column 3: this field's data -->
							    <xsl:choose>
								 <xsl:when test="name(.)='wr.wr_id'"> <!-- Show just the request code in red. -->
									<fo:block font-weight="bold" color="red">
										<xsl:value-of select="."/>
									</fo:block>
								 </xsl:when>
								 <xsl:otherwise>	<!-- Show other values in black -->
									<fo:block>
										<xsl:value-of select="."/>
									</fo:block>
								 </xsl:otherwise>
							    </xsl:choose>

							</fo:table-cell>
						</fo:table-row>
					</xsl:if>
				</xsl:for-each> <!-- data field -->
			</xsl:for-each> <!-- schema field -->

		</fo:table-body>
	</fo:table>
	</fo:block>
</xsl:for-each> <!-- record -->


<!-- 1. C. Provide a link to the basic XSL example.  -->

<fo:block color="navy" font-size="12pt" space-before="12pt" space-after="12pt">
1.C Other XSL Techniques
</fo:block>

<fo:block font-size="10pt">You may also wish to refer to the XSL-to-HTML example for tips and templates for retrieving context
parameters, schema and data from the ARCHIBUS server messages. The same XSL techniques work for the XSL-FO and Pdf rendering.
	<fo:basic-link
		external-destination="url('{//preferences/@relativeSchemaPath}/ab-products/solutions/view-examples/ab-ex-response.htm')"
		space-before="12pt"
		text-decoration="underline"
		color="blue"
		>
		ab-ex-response.htm
	</fo:basic-link >
</fo:block>


<!-- _ 2. PREFERENCE RETRIEVAL EXAMPLES ________________________________________ -->

<!-- Retrieve preferences from the context -->

<fo:block
	font-size="24pt"
     text-align="center"
	space-before="30pt"
     space-before.conditionality="retain"
	space-after="12pt"
	break-before="page"
	>
	2. Preference Retrieval Examples
</fo:block>


<fo:block color="navy" font-size="12pt" space-before="12pt" space-after="12pt">
Retrieving Preferences from the Context
All Child Attributes of the 'preferences' Element starting with "ab"
</fo:block>

<fo:block font-size="10pt">
  <fo:list-block border-bottom="1pt" padding-after="6pt">

	<xsl:for-each select="/*/preferences/@*[starts-with(name(),'ab')]">

		<fo:list-item>
			 <fo:list-item-label end-indent="3in" >
			   <fo:block text-align="start"><xsl:value-of select="name()"/></fo:block>
			 </fo:list-item-label>
			 <fo:list-item-body  start-indent="3in"  >
			   <fo:block text-align="start"><xsl:value-of select="."/></fo:block>
			 </fo:list-item-body>
		</fo:list-item>

	</xsl:for-each>

  </fo:list-block>
</fo:block>




<!-- _ 3. SVG GRAPHICS EXAMPLES ________________________________________ -->

<!-- See http://www.w3schools.com/svg for a brief introduction to SVG tags -->

<fo:block
	font-size="24pt"
     text-align="center"
	space-before="30pt"
     space-before.conditionality="retain"
	space-after="12pt"
	break-before="page"
	>
	3. SVG Graphics Examples
</fo:block>


<fo:block color="navy" font-size="12pt" space-before="12pt" space-after="12pt">
  These examples draws elements using the built-in SVG processor.
</fo:block>

<!-- Blue rectangle -->

<fo:block space-after="12pt">
Blue rectangle with explicit coordinates:
  <!-- Define the viewport within the XSL-FO document to which the SVG content is to be mapped.  -->
  <fo:instream-foreign-object
		content-height="20px" content-width="30px">
		<!-- Start the embedded SVG document.  Define the coordinate area for the svg tags.-->
		<svg:svg
			xmlns:svg="http://www.w3.org/2000/svg"
			height="20"
			width="30"
			viewBox="0 0 20 30"
			>
			<!-- Draw a blue rectangle with a 1 px black border. -->
			<svg:rect width="30" height="20" style="fill:rgb(0,0,255);stroke-width:1; stroke:rgb(0,0,0)"/>

			<!-- Draw a line.  Upper left corner is 0,0; lower-right corner is 20,20 -->
			<svg:line x1="0" y1="0" x2="20" y2="20"
				style="stroke:rgb(99,99,99);stroke-width:2"/>


		</svg:svg>
  </fo:instream-foreign-object>
.
</fo:block>


<!-- Green rectangle -->

<fo:block>
Green rectangle with default coordinates:
  <fo:instream-foreign-object >
		<svg:svg
			xmlns:svg="http://www.w3.org/2000/svg"
			>
			<!-- Draw a green rectangle with a 1 px black border. -->
			<svg:rect width="30" height="20" style="fill:rgb(0,255,0);stroke-width:1; stroke:rgb(0,0,0)"/>

			<!-- Draw a line.  Upper left corner is 0,0; lower-right corner is 20,20 -->
			<svg:line x1="0" y1="0" x2="20" y2="20"
				style="stroke:rgb(99,99,99);stroke-width:2"/>

		</svg:svg>
  </fo:instream-foreign-object>
.
</fo:block>


<!-- Stop sign -->

<fo:block space-after="12pt">
Stop sign:
  <fo:instream-foreign-object
		content-height="50px" content-width="50px">

		<svg:svg
			xmlns:svg="http://www.w3.org/2000/svg"
			width="50"
			height="50"
			>
			<!-- Draw a 25px radius circle, filled in red, with no border. -->
			 <svg:circle cx="25" cy="25" r="25"  style="fill:red; stroke:none"/>

			<!-- On top of that circle, draw a 10x30px white rectangle with no border. -->
			 <svg:rect x="10" y="20" width="30" height="10" style="fill:white; stroke:none"/>
		</svg:svg>
  </fo:instream-foreign-object>
</fo:block>

<!-- Other Elements -->

<fo:block>
Other SVG Elements: lines, circles, rectangles, ellipses, polygons, polylines, paths, ...
  <fo:instream-foreign-object
		content-height="300px"
		content-width="300px">
		<svg:svg
			xmlns:svg="http://www.w3.org/2000/svg"
			height="300"
			width="300"
			>

			<!-- Diagonal across the entire content area. -->
			<svg:line x1="0" y1="0" x2="300" y2="300"
				style="stroke:navy;stroke-width:2"/>

			<!-- Overlapping entities -->
			 <svg:circle cx="10" cy="20" r="10"  style="fill:blue; stroke-width:1; stroke:rgb(0,0,0)"/>
			 <svg:circle cx="20" cy="30" r="10"  style="fill:yellow; stroke-width:1; stroke:rgb(0,0,0)"/>
			 <svg:circle cx="30" cy="40" r="10"  style="fill:green; stroke-width:1; stroke:rgb(0,0,0)"/>

			 <!-- Notice that since Pdf doesn't support transparency, opacity settings do not apply. -->
			<svg:rect x="40" y="50" width="70" height="25"
				style="fill:blue;stroke:pink;stroke-width:5;
				fill-opacity:0.1;stroke-opacity:0.1"/>

			<!-- Ellipses: slate, yellow, green -->
			<svg:ellipse cx="80" cy="80" rx="30" ry="10"
					style="fill:rgb(85,127,162);
					stroke:yellow;stroke-width:2"/>
			<svg:ellipse cx="90" cy="90" rx="30" ry="10"
					style="fill:rgb(255, 246, 207);
					stroke:red;stroke-width:2"/>
			<svg:ellipse cx="100" cy="100" rx="30" ry="10"
					style="fill:rgb(226, 243, 225);
					stroke:navy;stroke-width:2"/>

			<!-- Red polyline -->
			<svg:polyline points="110,110 110,120 20,120 20,140 40,140 40,160"
				style="fill:yellow;stroke:navy;stroke-width:4"/>

			<!-- Blue polygon (a triangle) with a darker blue border. -->
			<svg:polygon
				points="220,100 300,210 170,250"
				style="fill:#C3DDF4;stroke:#91B3CF;stroke-width:1"/>

			<!-- Black triangular arbitrary path.  You define paths with commands for traversing one point to another:
			M = moveto
			L = lineto
			H = horizontal lineto
			V = vertical lineto
			C = curveto
			S = smooth curveto
			Q = quadratic Belzier curve
			T = smooth quadratic Belzier curveto
			A = elliptical Arc
			Z = closepath
			Capital letters specify an absolute positioned, lower cases specifies a relative.
			-->
			<svg:path d="M150 250 L150 150 L50 50 Z" />

		</svg:svg>
  </fo:instream-foreign-object>

</fo:block>




<!-- _ 4. TEXT ATTRIBUTES EXAMPLES ________________________________________ -->

<fo:block
	font-size="24pt"
     text-align="center"
	space-before="30pt"
     space-before.conditionality="retain"
	space-after="12pt"
	break-before="page"
	>
	4. Text Formatting Examples
</fo:block>

<!-- Attribute inheritance -->
<fo:block>
Text Block of 24 Point text.
       <fo:block>
         Nested block with inherited font attributes.
       </fo:block>
       <fo:block font-style="italic">
         Nested block with overridden font attributes.
       </fo:block>
</fo:block>

<!-- Inline tag usages -->
<fo:block>
Use the &lt;inline&gt; tag to override font attributes within a text block:
         <fo:inline color="blue">colored</fo:inline>,
         <fo:inline font-weight="bold">bold</fo:inline>,
         <fo:inline font-style="italic">italic</fo:inline>,
         <fo:inline font-size="75%">small</fo:inline>,
         <fo:inline font-size="133%">large</fo:inline>,
         <fo:inline text-decoration="underline">underlined</fo:inline>, and
         <fo:inline letter-spacing="3pt"> expanded</fo:inline>.
</fo:block>

<!-- Justified text, white on slate -->
<fo:block
	line-height="1.5"
	text-align="justify"
	color="white"
	background-color="#91B3CF"
	>
This is an example of double-justified text with a 1.5x line-height.
Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Quisque sodales. Maecenas aliquam, nulla ut tristique ullamcorper, purus neque sodales dolor, at accumsan risus orci nec sem. Fusce congue, arcu a placerat aliquam, leo est lacinia lacus, in ornare massa dui sit amet lectus.
</fo:block>

<!-- Indented text, white on green -->
<fo:block
	text-align="justify"
	text-indent="1in"
     text-align-last="end"
	last-line-end-indent="1in"
	color="white"
	background-color="#C6D7C5"
	>
  This is an example of double-justified text with an indented first line.
  The last line of the text is aligned to the right, and indented
  by 1 inch from the right.
Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Quisque sodales. Maecenas aliquam, nulla ut tristique ullamcorper, purus neque sodales dolor, at accumsan risus orci nec sem. Fusce congue, arcu a placerat aliquam, leo est lacinia lacus, in ornare massa dui sit amet lectus.
</fo:block>

<!-- Indented text, block on lt. yellow -->
<fo:block
	text-align="start"
     text-align-last="end"
     start-indent="1in"
	end-indent="1in"
	background-color="#FFF6CF"
	>
This is an example of left-aligned text, indented 1" from each end.  The last line is indented 1" from the left.
Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Quisque sodales. Maecenas aliquam, nulla ut tristique ullamcorper, purus neque sodales dolor, at accumsan risus orci nec sem. Fusce congue, arcu a placerat aliquam, leo est lacinia lacus, in ornare massa dui sit amet lectus.
</fo:block>

<!-- controlling spaces -->

<fo:block
	font-style="italic"
	text-align="end"
	space-before="12pt"
	space-after="9pt"
	>Right Justified Text
</fo:block>

<fo:block
	font-style="italic"
	text-align="start"
	space-before="12pt"
	space-after="9pt"
	>Left Justified Text
</fo:block>

<fo:block start-indent="1.5in" space-after="9pt">
    <fo:block>&#8220;Indented (and quoted) text.&#8221;</fo:block>
    <fo:block>A nested block that inherits indenting.</fo:block>
    <fo:block>Another nested block that inherits indenting.</fo:block>
    <fo:block>And yet another nested block.</fo:block>
</fo:block>

<!-- _ 5. BORDER EXAMPLES ________________________________________ -->

<fo:block
	font-size="24pt"
     text-align="center"
	space-before="30pt"
     space-before.conditionality="retain"
	space-after="12pt"
	break-before="page"
	>
	5. Border Examples
</fo:block>


<fo:block
	border-top-color="black"
	border-top-width="thick"
	text-align="center"
	border-top-style="solid"
	space-after="12pt"
	>
  Thick black border at the top
</fo:block>


<fo:block
	border-color="navy"
	border-style="groove"
	border-width="medium"
	text-align="left"
	space-after="12pt"
	>
  Medium navy groove around the whole block
</fo:block>

<!--  Attribute can be specified in any order, separated by spaces. -->

<fo:block
	text-align="right"
	border-top-color="#C6D7C5"
	border-top-width="1pt"
	border-bottom-color="#C6D7C5"
	border-bottom-width="2pt"
	space-after="12pt"
	>
  1pt green border at the top and 2pt border at the bottom
</fo:block>

<!-- A single border attribute can accumulate properties that are applied to all the four sides.  -->

<fo:block
	border="2pt solid navy"
	text-align="center"
	background-color="#FFF6CF"
	padding-before="18pt"
	padding-bottom="18pt"
	padding-start="6pt"
	padding-end="6pt"
	space-after="12pt"
	>
	<fo:block border="solid maroon">
		The outer block has a 18 pt padding from top and bottom, and 6pt padding left and right.
	</fo:block>
</fo:block>

<!-- Padding -->

<fo:block
	border="5pt solid navy"
     text-align="center"
     padding="2cm"
     start-indent="0.5in"
	end-indent="0.5in"
	space-after="12pt"
	>
	<fo:block border="solid maroon">
		The outer block uses a short-hand format for specifying a 2 cm padding from all sides.
	</fo:block>
</fo:block>

<!-- Background color -->

<fo:block
	color="#FFEB9C"
	background-color="#A51818"
	padding="12pt"
	text-align="center"
	space-after="12pt"
	>
	Yellow on red
</fo:block>

<!-- Leader Lines -->

<fo:block>
  <fo:leader leader-pattern="rule"/>Text with "rule" leader.
</fo:block>

<fo:block>
  <fo:leader leader-pattern="rule" leader-length="100pt"/>Text with 100pt "rule" leader.
</fo:block>

<fo:block>
  <fo:leader leader-pattern="dots" leader-length="200pt"/>Text with 200pt "dots" pattern leader.
</fo:block>

<fo:block text-align="center">
  <fo:leader leader-length="2in"
             leader-pattern="rule"
             alignment-baseline="middle"
             rule-thickness="0.5pt" color="black"/>
  <fo:inline color="#E00000">&#x274B;</fo:inline>
  <fo:leader leader-length="2in"
             leader-pattern="rule"
             alignment-baseline="middle"
             rule-thickness="0.5pt" color="black"/>
</fo:block>



<!-- _ 6. BITMAP IMAGES AND GRAPHICS EXAMPLES ________________________________________ -->

<fo:block
	font-size="24pt"
     text-align="center"
	space-before="30pt"
     space-before.conditionality="retain"
	space-after="12pt"
	break-before="page"
	>
	6. Bitmap Images and Graphics
</fo:block>


<fo:block
	border="0.5pt solid navy"
	background-image="{//preferences/@projectFolder}/graphics/archibus-logo.bmp"
	background-repeat="no-repeat"
	margin="0.25in"
	padding="0.75in"
	text-align="center"
	>
  A single background image placed 18pt to the right
  and 6pt below the upper left corner of this block.
</fo:block>

<!-- The keep with next keeps the page break from splitting the caption from the content -->

<fo:block
	font-weight="bold"
     keep-with-next.within-column="always"
	space-before="0.5in"
	>
Embedded graphics:
</fo:block>

<fo:block>
	<fo:external-graphic
		src="{//preferences/@projectFolder}/graphics/em-abernathy-allison.jpg"
		/>
</fo:block>

<fo:block>
	<fo:external-graphic
		src="{//preferences/@projectFolder}/graphics/rmxdp-hq17.jpg"
		/>
</fo:block>



<!-- 7. _ WEB LINKS EXAMPLES ________________________________________ -->

<fo:block break-before="page" />

<fo:block
	font-size="24pt"
     text-align="center"
	space-before="30pt"
     space-before.conditionality="retain"
	space-after="12pt"
	>
	7. WEB LINKS EXAMPLES
</fo:block>

<fo:block text-align="center"
	space-before="12pt"
	text-decoration="underline"
	color="#0000ff"
	>
	 <fo:basic-link internal-destination="1-data-retrieval" >
		Hyperlink to the Data Retrieval Section on Page #<fo:page-number-citation ref-id="1-data-retrieval"/>
	 </fo:basic-link>
</fo:block>

<fo:block
	text-align="center"
	space-before="12pt"
	>
	<fo:basic-link
		external-destination="url('http://www.archibus.com/')"
		text-decoration="underline"
		color="blue"
		>
	URL Link to ARCHIBUS Inc Home Page
	</fo:basic-link>
</fo:block>




<!-- _ 8. TABLE AND LIST EXAMPLES ________________________________________ -->

<fo:block
	font-size="24pt"
     text-align="center"
	space-before="30pt"
     space-before.conditionality="retain"
	space-after="12pt"
	break-before="page"
	>
	8. Table and List Examples
</fo:block>

<!-- List -->

  <fo:list-block border-bottom="1pt" padding-after="6pt">

    <fo:list-item>
      <fo:list-item-label end-indent="1in" font-weight="bold">
        <fo:block text-align="start">List Title 1.</fo:block>
      </fo:list-item-label>
      <fo:list-item-body start-indent="1in">
        <fo:block text-align="start">List Item 1.</fo:block>
      </fo:list-item-body>
    </fo:list-item>

    <fo:list-item>
      <fo:list-item-label end-indent="1in" font-weight="bold">
        <fo:block text-align="start">List Title 2.</fo:block>
      </fo:list-item-label>
      <fo:list-item-body start-indent="1in">
        <fo:block text-align="start">List Item 2.</fo:block>
      </fo:list-item-body>
    </fo:list-item>

    <fo:list-item>
      <fo:list-item-label end-indent="1in" font-weight="bold">
        <fo:block text-align="start">List Title 3.</fo:block>
      </fo:list-item-label>
      <fo:list-item-body start-indent="1in">
        <fo:block text-align="end">List Item 3: Right Justified</fo:block>
      </fo:list-item-body>
    </fo:list-item>

  </fo:list-block>

<!-- Spacer -->
<fo:block space-before="0.75in" />


<!-- Simple Table -->

<fo:table>
	<fo:table-column column-width="50mm"/>
	<fo:table-column column-width="50mm"/>

	<fo:table-body>

		<fo:table-row>
			<fo:table-cell>
				<fo:block>Row A, Cell 1</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>Row A, Cell 2</fo:block>
			</fo:table-cell>
		</fo:table-row>

		<fo:table-row>
			<fo:table-cell>
				<fo:block>Row B, Cell 1</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>Row B, Cell 2</fo:block>
			</fo:table-cell>
		</fo:table-row>

	</fo:table-body>

</fo:table>


<!-- Spacer -->
<fo:block space-before="0.75in" />

<!-- Complex table formatting illustrating spanning rows and columns. -->

<!-- Unfortunately, properties like border-style, border-color, and padding-before aren't
inherited; you have to define them for each cell in the table.  Since you are typically using XSL
to generate the rows and columns, this is usually not an extra burden.  -->


<fo:table
	border="0.5pt solid black"
     text-align="center"
	border-spacing="3pt"
	>
	<fo:table-column column-width="1.5in"/>
	<fo:table-column column-width="1.0in" number-columns-repeated="2"/>

	<fo:table-header>
		<!-- First column is the column header with a green background. -->
		<fo:table-row>
			<fo:table-cell
				padding="6pt"
				border="1pt solid blue"
				background-color="#E2F3E1"
				number-columns-spanned="3"
				>
				<fo:block text-align="center" font-weight="bold">
				Header (spans 3 columns)
				</fo:block>
			</fo:table-cell>
	    </fo:table-row>
    </fo:table-header>

	<fo:table-body>
		<fo:table-row>
			<!-- First column is the row header with a yellow background. -->
			<fo:table-cell padding="6pt" border="1pt solid blue" background-color="#FFF6CF" number-rows-spanned="2">
				<fo:block text-align="end" font-weight="bold">
				Items (spans 2 rows):
				</fo:block>
			</fo:table-cell>
			<fo:table-cell padding="6pt" border="0.5pt solid black">
				<fo:block> A : 1 </fo:block>
			</fo:table-cell>
			<fo:table-cell padding="6pt" border="0.5pt solid black">
				<fo:block> A : 2 </fo:block>
			</fo:table-cell>
		</fo:table-row>

		<fo:table-row>
			<fo:table-cell padding="6pt" border="0.5pt solid black">
				<fo:block> B : 1 </fo:block>
			</fo:table-cell>
			<fo:table-cell padding="6pt" border="0.5pt solid black">
				<fo:block> B : 2 </fo:block>
			</fo:table-cell>
		</fo:table-row>
	</fo:table-body>

</fo:table>


				<!-- EndOfDocument tag.  This is used by the page-number-citation
				tag above [See	<fo:page-number-citation ref-id="EndOfDocument"/>]
				in the page header to get the "Page n of m" style page numbering.
				-->
				<fo:block id="EndOfDocument" text-align="center"/>

				<!-- Edit this section: end -->
				</fo:flow>


			</fo:page-sequence>

		</fo:root>
	</xsl:template>


</xsl:stylesheet>
