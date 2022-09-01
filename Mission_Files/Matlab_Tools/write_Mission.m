function write_Mission(name, mission,xrefpoint, yrefpoint)
fid = fopen(name, 'w');
fprintf(fid,'#Version Number\n2\n#Xrefpoint, Yrefpoint, Zone\n%.3f %.3f 29S\n#LINE xInit yInit xEnd yEnd velocity <user data>\n#ARC xInit yInit xCenter yCenter xEnd yEnd velocity adirection radius <user data>\n',xrefpoint, yrefpoint);
for i=1:size(mission,1)
    if(mission(i,3)==-1.0 && mission(i,4)==-1.0)
        fprintf(fid,'LINE %.3f %.3f %.3f %.3f %.3f\n', mission(i,1),mission(i,2),mission(i,5),mission(i,6),mission(i,7));
    else
        if(mission(i,8)~=1) %Counter Clockwise
            mission(i,8)=-1;
        end
        fprintf(fid,'ARC %.3f %.3f %.3f %.3f %.3f %.3f %.3f %.3f %.3f\n', ...
            mission(i,1),mission(i,2), mission(i,3), mission(i,4), ...
            mission(i,5),mission(i,6),mission(i,7), mission(i,8), mission(i,9));
    end
end
fclose(fid);

