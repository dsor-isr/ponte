#!/usr/bin/env python

########################################################################
##  dxf_parser.py Version 0.9
##  Script to parse dxf to Medusa mission format
##  Copyright (c) 2015 Miguel Ribeiro, DSOR/ISR/IST.
##  All rights reserved.
##  NOT FOR SALE. The software is provided "as is" without any warranty.
########################################################################

import math
import numpy
import sys
import os

g_veloc = 0.3

def CenterFor2Points(pi, pe, ang):
    aperture = math.atan(ang)*4
    d = math.sqrt(sum((pi-pe)**2))
    r = abs(d/(2*math.sin(aperture/2)))
    m = (pi + pe) /2
    k = None
    if aperture<0:
        k=-1
        if abs(aperture)<math.pi:
            sign_center = 1
        else:
            sign_center = -1
    else:
        k=1
        if abs(aperture)>math.pi:
            sign_center = 1
        else:
            sign_center = -1
    xc = m[0] - sign_center*math.sqrt(r**2-(d/2)**2)*(pi[1]-pe[1])/d
    yc = m[1] - sign_center*math.sqrt(r**2-(d/2)**2)*(pe[0]-pi[0])/d
    return [xc, yc, k, r]

# NED = True
NED = False

def parseDXFpts(fn):
    f = open(fn)
 
    # skip to entities section
    s = f.next()
    while s.strip() != 'ENTITIES':
        s = f.next()
 
    inVertex = False
 
    ptList = []
    cirList = []
    inArcPrev = False
    for line in f:
        line = line.strip()
        # In ENTITIES section, iteration can cease when ENDSEC is reached
        if line == 'ENDSEC':
            break
 
        elif inVertex == True:
            inArc = False
            dd = dict.fromkeys(['10','20','30','42'], 0.0)
            inHeader = True
            while line != '0' or inHeader:
                if inHeader and line =='0':
                    inHeader = False
                if not inHeader:
                    if line in dd:
                        dd[line] = f.next().strip()
                    # print "line: "+str(line)
                    if line == '42':
                        inArc = True
                line = f.next().strip()
            #print 'inArc:' + str(inArc) + " | "+ str([[dd['10'], dd['20'], dd['30']], [dd['42']]])

            ptList.append([ dd['10'], dd['20'], dd['30'], dd['42'] ])
            if len(ptList) > 1:
                xi = float(ptList[-2][0])
                yi = float(ptList[-2][1])
                xe = float(ptList[-1][0])
                ye = float(ptList[-1][1])
                if not inArcPrev:
                    if NED:
                        print "LINE {:.3f} {:.3f} {:.3f} {:.3f} {:.3f} -1".format(yi, xi, ye, xe, g_veloc)
                    else:
                        print "LINE {:.3f} {:.3f} {:.3f} {:.3f} {:.3f} -1".format(xi, yi, xe, ye, g_veloc)
                else:
                    seg = ptList[-2]
                    [xc, yc, k, r] = CenterFor2Points(numpy.array([xi, yi]), numpy.array([xe, ye]), float(seg[3]))
                    if NED:
                        k=-k
                        print "ARC {:.3f} {:.3f} {:.3f} {:.3f} {:.3f} {:.3f} {:.3f} {:.0f} {:.3f} -1".format(yi, xi, yc, xc, ye, xe, g_veloc, k, r)
                    else:
                    	print "ARC {:.3f} {:.3f} {:.3f} {:.3f} {:.3f} {:.3f} {:.3f} {:.0f} {:.3f} -1".format(xi, yi, xc, yc, xe, ye, g_veloc, k, r)
            inVertex = False
            inArcPrev = inArc
        else:
            if line == 'VERTEX':
                inVertex = True
 
    f.close()

    return ptList, cirList
 
if __name__ == '__main__':
 
    # fn = r'C:\SDS2_7.0\macro\New Versions\Ref\grids2.dxf'
    if len(sys.argv)<2:
        print "[ERROR] not enough arguments\n\t%s filename"%(sys.argv[0])
        sys.exit(-1)
    filename=sys.argv[1]
    if not os.path.exists(filename):
        print "[ERROR] cannot open: %s"%(sys.argv[1])
        sys.exit(-1)
    if not filename.endswith(".dxf"):
        print "[ERROR] not a .dxf file: %s"%(sys.argv[1])
        sys.exit(-1)
    print "#dxf_parser py starting to parse file"
    # append this
    print '''#Version
5
# Origin point
43.93314 15.44417
# Translation point
0.0 0.0
'''
    parseDXFpts(filename)