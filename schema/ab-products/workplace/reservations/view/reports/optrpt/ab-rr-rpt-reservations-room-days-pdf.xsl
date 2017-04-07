<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.1" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format" exclude-result-prefixes="fo">
    <xsl:output method="xml" version="1.0" omit-xml-declaration="no" indent="no"/>
    <xsl:template match="/">
        <xsl:variable name="pdfStyle">
            <xsl:choose>
                <xsl:when test="/*/preferences/pdfButton/@style">
                    <xsl:value-of select="//preferences/pdfButton/@style"/>
                </xsl:when>
                <xsl:otherwise>portrait</xsl:otherwise>
            </xsl:choose>
            
        </xsl:variable>
        <xsl:variable name="localeName" select="/*/preferences/@locale"/>
        <xsl:variable name="pdfFormat">
            <xsl:choose>
                <xsl:when test="$localeName='en_US' or $localeName='en_CA' or $localeName='es_MX'">US</xsl:when>
                <xsl:otherwise>A4</xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:processing-instruction name="cocoon-format">type="text/xslfo"</xsl:processing-instruction>
        <fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
            <fo:layout-master-set>
                <xsl:choose>
                    <xsl:when test="$pdfStyle='portrait'">
                        <xsl:if test="$pdfFormat='A4'">
                            <fo:simple-page-master margin="1cm" master-name="main-page" page-height="297mm" page-width="210mm">
                                <fo:region-before extent="5cm"/>
                                <fo:region-after extent="1cm"/>
                                <fo:region-body margin-top="2cm" margin-bottom="1.5cm"/>
                            </fo:simple-page-master>
                        </xsl:if>
                        <xsl:if test="$pdfFormat='US'">
                            <fo:simple-page-master margin="1cm" master-name="main-page" page-height="11in" page-width="8.5in">
                                <fo:region-before extent="5cm"/>
                                <fo:region-after extent="1cm"/>
                                <fo:region-body margin-top="2cm" margin-bottom="1.5cm"/>
                            </fo:simple-page-master>
                        </xsl:if>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:if test="$pdfFormat='A4'">
                            <fo:simple-page-master margin="1cm" master-name="main-page" page-height="210mm" page-width="297mm">
                                <fo:region-before extent="5cm"/>
                                <fo:region-after extent="1cm"/>
                                <fo:region-body margin-top="3cm" margin-bottom="1.5cm"/>
                            </fo:simple-page-master>
                        </xsl:if>
                        <xsl:if test="$pdfFormat='US'">
                            <fo:simple-page-master margin="1cm" master-name="main-page" page-height="8.5in" page-width="11in">
                                <fo:region-before extent="5cm"/>
                                <fo:region-after extent="1cm"/>
                                <fo:region-body margin-top="3cm" margin-bottom="1.5cm"/>
                            </fo:simple-page-master>
                        </xsl:if>
                    </xsl:otherwise>
                </xsl:choose>
            </fo:layout-master-set>
            
            <fo:page-sequence master-reference="main-page">            	
                <fo:flow flow-name="xsl-region-body">
                    <fo:block font-family="Arial, Verdana, Geneva, Helvetica, sans-serif" font-size="8pt">
                    	
                        <xsl:for-each select="/*/afmTableGroup">
                            <!-- space -->
                            <xsl:if test="position() &gt; 1">
                                <fo:block font-size="8pt" font-weight="bold" border-bottom-color="black" border-bottom-style="solid" border-bottom-width="3pt" space-after="0.3cm" space-before="0.3cm"/>
                            </xsl:if>
                            <fo:block>
                                <xsl:call-template name="AfmTableGroups">
                                    <xsl:with-param name="afmTableGroup" select="."/>
                                    <xsl:with-param name="level" select="'1'"/>
                                </xsl:call-template>
                            </fo:block>                           
                        </xsl:for-each>
                    </fo:block>
                    <fo:block id="EndOfDocument" text-align="center"/>
                </fo:flow>
            </fo:page-sequence>
        </fo:root>
    </xsl:template>
    
    <!-- AfmTableGroups -->
    <xsl:template name="AfmTableGroups">
        <xsl:param name="afmTableGroup"/>
        <xsl:param name="level"/>
        <xsl:variable name="format" select="$afmTableGroup/@format"/> 
		       
        <xsl:call-template name="ReportTableFormat">
            <xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
            <xsl:with-param name="level" select="$level"/>
        </xsl:call-template>
		        
    </xsl:template>
    
    <!-- ReportTableFormat keven -->
    <xsl:template name="ReportTableFormat">
        <xsl:param name="afmTableGroup"/>
        <xsl:param name="level"/>
        <xsl:variable name="showGrid">
            <xsl:choose>
                <xsl:when test="$afmTableGroup/@showGrid">
                    <xsl:value-of select="$afmTableGroup/@showGrid"/>
                </xsl:when>
                <xsl:otherwise>false</xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        
        <xsl:variable name="totalFields">
            <xsl:for-each select="$afmTableGroup/dataSource/data/fields/field[@hidden!='true']">
                <xsl:if test="position()=last()">
                    <xsl:value-of select="last()"/>
                </xsl:if>
            </xsl:for-each>
        </xsl:variable>
		<fo:block font-weight="bold" color="black" text-align="left" font-size="25pt" space-after="10pt" border-bottom-color="black" border-bottom-style="solid">  
              	<xsl:call-template name="ReportTitleFormat">
            		<xsl:with-param name="date_start" select="$afmTableGroup/dataSource/data/records/record[1]/@reserve_rm.date_start"/>
                	<xsl:with-param name="bl_id" select="$afmTableGroup/dataSource/data/records/record[1]/@reserve_rm.bl_id"/>
					<xsl:with-param name="fl_id" select="$afmTableGroup/dataSource/data/records/record[1]/@reserve_rm.fl_id"/>
					<xsl:with-param name="rm_id" select="$afmTableGroup/dataSource/data/records/record[1]/@reserve_rm.rm_id"/>                
            	</xsl:call-template>			     
        </fo:block>
 
		<fo:block space-before="5pt" space-after="10pt">
        	<xsl:call-template name="ReportTableHeaderFormat">
                <xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
                <xsl:with-param name="level" select="$level"/>
            </xsl:call-template>
		</fo:block>
        <!-- For each record in the result set for the first table-group. -->
		<xsl:variable name="record" select="$afmTableGroup/dataSource/data/records/record"/>
		<xsl:for-each select="$record">
			<xsl:variable name="recordIndex" select="position()"/>
    
			<xsl:variable name="date_start" select="$record[position()=$recordIndex]/@reserve_rm.date_start"/>	
            <xsl:variable name="cur_bl_id" select="$record[position()=$recordIndex]/@reserve_rm.bl_id"/>
            <xsl:variable name="cur_fl_id" select="$record[position()=$recordIndex]/@reserve_rm.fl_id"/>
            <xsl:variable name="cur_rm_id" select="$record[position()=$recordIndex]/@reserve_rm.rm_id"/>			
            <xsl:variable name="preIndex" select="position() - 1"/>
            <xsl:if test="$recordIndex &gt; 1">
            	<xsl:if test="($cur_bl_id != $record[position()=$preIndex]/@reserve_rm.bl_id)
            		or ($cur_fl_id != $record[position()=$preIndex]/@reserve_rm.fl_id)
            		or ($cur_rm_id != $record[position()=$preIndex]/@reserve_rm.rm_id)">
            			
            		<fo:block break-before="page" font-weight="bold" color="black" text-align="left" font-size="25pt" space-after="10pt" border-bottom-color="black" border-bottom-style="solid">
            			<xsl:call-template name="ReportTitleFormat">
            				<xsl:with-param name="date_start" select="$date_start"/>
                			<xsl:with-param name="bl_id" select="$cur_bl_id"/>
               				<xsl:with-param name="fl_id" select="$cur_fl_id"/>
							<xsl:with-param name="rm_id" select="$cur_rm_id"/>
            			</xsl:call-template>            
            		</fo:block>
					<fo:block space-after="10pt">
       					 <xsl:call-template name="ReportTableHeaderFormat">
               				 <xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
               				 <xsl:with-param name="level" select="$level"/>
           				 </xsl:call-template>
					</fo:block>
            	</xsl:if>
            </xsl:if>
            
			<!-- Create a table for each record.-->
			<fo:block font-weight="bold" color="black" space-after="10pt">
				<fo:table>					
					<fo:table-column column-width="proportional-column-width(1)"/>
					<fo:table-column column-width="proportional-column-width(1)"/>
					<fo:table-column column-width="proportional-column-width(2)"/>
					<fo:table-body>
						<fo:table-row text-align="left">					 
							<xsl:for-each select="$afmTableGroup/dataSource/data/records/record[position()=$recordIndex]/@*">
								<xsl:if test="name(.) = 'reserve_rm.time_start' or name(.) = 'reserve_rm.time_end' or name(.) = 'reserve.reservation_name'">
									<xsl:sort select="reserve_rm.time_start"/>
									<fo:table-cell>  
										<xsl:if test="$showGrid='true'">
                                			<xsl:attribute name="border-width">0.2mm</xsl:attribute>
                                			<xsl:attribute name="border-style">solid</xsl:attribute>
                        				</xsl:if>
										<fo:block>
											<xsl:attribute name="font-size">
                        						<xsl:if test="name(.) = 'reserve_rm.time_start' or name(.) = 'reserve_rm.time_end'">25pt</xsl:if>
                        						<xsl:if test="name(.) = 'reserve.reservation_name'">20pt</xsl:if>                        						
                    						</xsl:attribute>
											<xsl:value-of select="."/>									
										</fo:block>
									</fo:table-cell>
								</xsl:if>	  						
							</xsl:for-each> 	
						</fo:table-row>
					</fo:table-body>
				</fo:table>
			</fo:block>
		</xsl:for-each> 
    </xsl:template>
    
    <!-- ReportTableHeaderFormat keven -->
    <xsl:template name="ReportTableHeaderFormat">
        <xsl:param name="afmTableGroup"/>
        <xsl:param name="level"/>
        <xsl:variable name="showGrid">
            <xsl:choose>
                <xsl:when test="$afmTableGroup/@showGrid">
                    <xsl:value-of select="$afmTableGroup/@showGrid"/>
                </xsl:when>
                <xsl:otherwise>false</xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <fo:table table-layout="fixed" width="100%">        	
			<fo:table-column column-width="proportional-column-width(1)"/>
			<fo:table-column column-width="proportional-column-width(1)"/>
			<fo:table-column column-width="proportional-column-width(2)"/>
            <fo:table-body>
                <fo:table-row font-weight="bold" color="black" text-align="left" font-size="25pt">
                    <xsl:attribute name="background-color">
                        <xsl:if test="$level=1">#91B3D0</xsl:if>
                        <xsl:if test="$level=2">#E0E0E8</xsl:if>
                        <xsl:if test="$level=3">#BFEFF8</xsl:if>
                        <xsl:if test="$level!=1 and $level!=2 and $level!=3">#91B3D0</xsl:if>
                    </xsl:attribute>
                    <xsl:for-each select="$afmTableGroup/dataSource/data/fields/field[@hidden!='true']">
                    	<xsl:variable name="fullFieldName" select="concat(@table,'.',@name)"/>
						<xsl:if test="$fullFieldName ='reserve_rm.time_start' or $fullFieldName ='reserve_rm.time_end' or $fullFieldName ='reserve.reservation_name'">
                        	<fo:table-cell>
                            	<xsl:if test="$showGrid='true'">
                                	<xsl:attribute name="border-width">0.2mm</xsl:attribute>
                                	<xsl:attribute name="border-style">solid</xsl:attribute>
                            	</xsl:if>
                            	<fo:block start-indent="0.1cm" end-indent="0.1cm">
                                	<xsl:value-of select="@singleLineHeading"/>
                            	</fo:block>
                        	</fo:table-cell>
						</xsl:if>	
                    </xsl:for-each>
                </fo:table-row>
            </fo:table-body>
        </fo:table>
    </xsl:template>
    
    <!--ReportTitleFormat keven-->
    <xsl:template name="ReportTitleFormat">
    	<xsl:param name="date_start"/>
        <xsl:param name="bl_id"/>
		<xsl:param name="fl_id"/>
		<xsl:param name="rm_id"/> 
		<fo:block>	
		  <xsl:text translatable="true">Room Reservations</xsl:text>
		  <xsl:text> - </xsl:text>  		
          <xsl:value-of select="$date_start"/>      	
		</fo:block>       
        <fo:table>
        	<fo:table-column column-width="proportional-column-width(5)"/>
			<fo:table-column column-width="proportional-column-width(1)"/>
			<fo:table-column column-width="proportional-column-width(5)"/>
            <fo:table-body>            	    
            	<fo:table-row>
            		<fo:table-cell>
            			<fo:block translatable="true">Building Code:</fo:block>
            		</fo:table-cell>
            		<fo:table-cell>
            		</fo:table-cell>
            		<fo:table-cell>
            			<fo:block>
                        	<xsl:value-of select="$bl_id"/>
                    	</fo:block>
            		</fo:table-cell>					
            	</fo:table-row>
            	<fo:table-row>
            		<fo:table-cell>
            			<fo:block translatable="true">Floor Code:</fo:block>
            		</fo:table-cell>
            		<fo:table-cell>
            		</fo:table-cell>
            		<fo:table-cell>
            			<fo:block>
                        	<xsl:value-of select="$fl_id"/>
                   		</fo:block>
            		</fo:table-cell>					
            	</fo:table-row>		
                <fo:table-row>
            		<fo:table-cell>
            			<fo:block translatable="true">Room Code:</fo:block>
            		</fo:table-cell>
            		<fo:table-cell>
            		</fo:table-cell>
            		<fo:table-cell>
            			<fo:block>
                        	<xsl:value-of select="$rm_id"/>
                    	</fo:block>
            		</fo:table-cell>					
            	</fo:table-row>
            </fo:table-body>
        </fo:table>
    </xsl:template>
</xsl:stylesheet>
