<?xml version="1.0"?>
<!-- xslt called by Java to handle XML data: report and edit form-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<xsl:template name="copyright">
		<xsl:variable name="copyright" select="'Copyright 2002, ARCHIBUS, Inc.'"/>
		<div>
			<table><tr>
				<td class="copyright">
					<xsl:value-of select="$copyright"/>
				</td>
			</tr></table>
		</div>
	</xsl:template>
</xsl:stylesheet>


