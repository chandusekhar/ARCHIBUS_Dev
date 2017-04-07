<?xml version="1.0" encoding="UTF-8"?>

<!-- This is an example of a stylesheet used to transform XML data to XSL-FO, which the program
then converts into a pdf report. You can use this as a model for your own style sheets.  You can
use any XSL features supported by Xalan or any XSL-FO features supported by Apache FOP.

However, you will typically will only need to change the contents between the page header, page
footer, and page body tasks.   These areas are marked with an "edit this section: begin/end"
comments below.
-->

<!-- The XML statement above states that the contents of this XSL-FO file is in XML format. -->

<xsl:stylesheet version="1.1" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format" exclude-result-prefixes="fo">
	<!-- The xsl:stylesheet tag above declares that its contents is an XSL formatting style-sheet.  XSL-FO is an extension
	of the standard XSL formatting intended to obtain paginated output rather than HTML output. -->

	<!-- The xsl:output tag declares that the output of the XSL transformation should also be XML.  The program then feeds
	this output to the Apache FOP processor to get Pdf content, which the program sends to the client browser. -->
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
								Hello World Report Header <fo:page-number/> of <fo:page-number-citation ref-id="EndOfDocument"/>
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
							translatable="false">
								Hello World Report Footer
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

				<fo:block font-size="12pt">Hello World XSL-FO Output on Page 1.</fo:block>

				<fo:block break-before="page" />

				<fo:block font-size="12pt">Hello World XSL-FO Output on Page 2.</fo:block>


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
