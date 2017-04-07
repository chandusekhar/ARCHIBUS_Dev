<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<xsl:template match="/">
		<html>
		<title>mdxtable generator test</title>
		<head>	
		    <style type="text/css">
		    	body                 {font-family:Verdana; margin:8px;}
	    		table                {font-size:12px; border-collapse:collapse;}
				td                   {border:none; padding:2px;}
	    		td.column-dimension  {background:#eee; font-weight:bold;}
	    		td.column            {background:#eee; font-weight:bold; border-bottom:solid #888; padding-right:8px;}
	    		td.row-dimension     {background:#ccf; font-weight:bold; border-bottom:solid #888; padding-right:8px;}
	    		td.row-total         {background:#ccf; font-weight:bold; border-bottom:1px solid #ccc;}
	    		td.row               {background:#eef; font-weight:bold; border-bottom:1px solid #ccc;}
	    		td.measure-dimension {background:#ccf;                   border-bottom:solid #888;}
	    		td.measure-total     {background:#ccf;                   border-bottom:1px solid #ccc;}
	    		td.measure           {background:#eef;                   border-bottom:1px solid #ccc;}
	    		td.cell-total-total  {background:#fc5; text-align:right; border-bottom:1px solid #ccc;}
	    		td.cell-total        {background:#feb; text-align:right; border-bottom:1px solid #ccc;}
	    		td.cell              {color:navy;      text-align:right; border-bottom:1px solid #ccc;}
		    </style>
		</head>
		<body>	
            <xsl:apply-templates select="//afmTableGroup[dataSource/mdx]"/>
		</body>
		</html>
	</xsl:template>
    
    <!-- This template formats one-dimensional MDX table -->
    <xsl:template name="mdxTable1D" match="//afmTableGroup[dataSource/mdx/preferences/@dimensions = '1']">
        <h3><xsl:value-of select="title"/></h3>
        <xsl:variable name="data" select="dataSource/data"/>
        <table>
            <tr>
                <td class="row-dimension"><xsl:value-of select="$data/rowDimension/@name"/></td>
                <xsl:for-each select="$data/fields/field">
                    <td class="column">
                        <xsl:call-template name="outputText">
                            <xsl:with-param name="value" select="@singleLineHeading"/>
                        </xsl:call-template>
                    </td>
                </xsl:for-each>
            </tr>
            <xsl:for-each select="$data/rowDimension/member">
                <xsl:variable name="rowName" select="@name"/>
                <xsl:variable name="recordIndex" select="$data/recordIndices/recordIndex[@rowDimensionName=$rowName]/@recordIndex"/>
                <xsl:variable name="record" select="$data/records/record[position()=$recordIndex]"/>
                <tr>
                    <xsl:if test="position() = 1">
                        <td class="row-total">
                            <xsl:call-template name="outputText">
                                <xsl:with-param name="value" select="$rowName"/>
                            </xsl:call-template>
                        </td>
                        <xsl:for-each select="$data/fields/field">
                            <xsl:variable name="field" select="position()"/>
                            <td class="cell-total">
                                <xsl:value-of select="$record/attribute::*[position()=$field]"/>
                            </td>
                        </xsl:for-each>
                    </xsl:if>
                    <xsl:if test="position() != 1">
                        <td class="row">
                            <xsl:call-template name="outputText">
                                <xsl:with-param name="value" select="$rowName"/>
                            </xsl:call-template>
                        </td>
                        <xsl:for-each select="$data/fields/field">
                            <xsl:variable name="field" select="position()"/>
                            <td class="cell">
                                <xsl:value-of select="$record/attribute::*[position()=$field]"/>
                            </td>
                        </xsl:for-each>
                    </xsl:if>
                </tr>
            </xsl:for-each>
        </table>
    </xsl:template>

    <!-- This template formats two-dimensional MDX table -->
    <xsl:template name="mdxTable2D" match="//afmTableGroup[dataSource/mdx/preferences/@dimensions = '2']">
        <h3><xsl:value-of select="title"/></h3>
        <xsl:variable name="data" select="dataSource/data"/>
        <table>
            <tr>
                <td></td>
                <td></td>
                <td class="column-dimension"><xsl:value-of select="$data/columnDimension/@name"/></td>
                <xsl:for-each select="$data/columnDimension/member[position() != 1]" >
                    <td></td>
                </xsl:for-each>
            </tr>
            <tr>
                <td class="row-dimension"><xsl:value-of select="$data/rowDimension/@name"/></td>
                <td class="measure-dimension"></td>
                <xsl:for-each select="$data/columnDimension/member">
                    <td class="column">
                        <xsl:call-template name="outputText">
                            <xsl:with-param name="value" select="@name"/>
                        </xsl:call-template>
                    </td>
                </xsl:for-each>
            </tr>
            <xsl:for-each select="$data/rowDimension/member">
                <xsl:variable name="row" select="position()"/>
                <xsl:variable name="rowName" select="@name"/>
                
                <xsl:variable name="fieldCount" select="count($data/fields/field)"/>
                <xsl:for-each select="$data/fields/field">
                    <xsl:variable name="field" select="position()"/>
                    <tr>
                        <xsl:if test="$row = 1">
                            <xsl:if test="$field = 1">
                                <td class="row-total">
                                    <xsl:attribute name="rowspan">
                                        <xsl:value-of select="$fieldCount"/>
                                    </xsl:attribute>
                                    <xsl:call-template name="outputText">
                                        <xsl:with-param name="value" select="$rowName"/>
                                    </xsl:call-template>
                                </td>
                            </xsl:if>
                            <td class="measure-total">
                                <xsl:call-template name="outputText">
                                    <xsl:with-param name="value" select="@singleLineHeading"/>
                                </xsl:call-template>
                            </td>
                        </xsl:if>
                        <xsl:if test="$row != 1">
                            <xsl:if test="$field = 1">
                                <td class="row">
                                    <xsl:attribute name="rowspan">
                                        <xsl:value-of select="$fieldCount"/>
                                    </xsl:attribute>
                                    <xsl:call-template name="outputText">
                                        <xsl:with-param name="value" select="$rowName"/>
                                    </xsl:call-template>
                                </td>
                            </xsl:if>
                            <td class="measure">
                                <xsl:call-template name="outputText">
                                    <xsl:with-param name="value" select="@singleLineHeading"/>
                                </xsl:call-template>
                            </td>
                        </xsl:if>
    
                        <xsl:for-each select="$data/columnDimension/member">
                            <xsl:variable name="column" select="position()"/>
                            <xsl:variable name="columnName" select="@name"/>
                            
                            <xsl:variable name="recordIndex" 
                                select="$data/recordIndices/recordIndex[@rowDimensionName=$rowName and @columnDimensionName=$columnName]/@recordIndex"/>
                            <xsl:variable name="record" select="$data/records/record[position()=$recordIndex]"/>
                            <xsl:variable name="value" select="$record/attribute::*[position()=$field]"/>
                            
                            <xsl:choose>
                                <xsl:when test="$row=1 and $column=1">
                                    <td class="cell-total-total">
                                        <xsl:value-of select="$value"/>
                                    </td>
                                </xsl:when>
                                <xsl:when test="$row=1">
                                    <td class="cell-total">
                                        <xsl:value-of select="$value"/>
                                    </td>
                                </xsl:when>
                                <xsl:otherwise>
                                    <td class="cell">
                                        <xsl:value-of select="$value"/>
                                    </td>
                                </xsl:otherwise>
                            </xsl:choose>
                        </xsl:for-each>
                    </tr>
                </xsl:for-each>
            </xsl:for-each>
        </table>
    </xsl:template>
    
    <xsl:template name="outputText">
        <xsl:param name="value"/>
        <xsl:choose>
            <xsl:when test="string($value) != ''">
                <xsl:value-of select="$value"/> 
            </xsl:when>
            <xsl:otherwise>
                <xsl:text>&#160;</xsl:text>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
</xsl:stylesheet>