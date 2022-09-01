map_r = [round(map(:,1)/0.5)*0.5, round(map(:,2)/0.5)*0.5, map(:,3)];

[B,I,J]=unique(map_r(:,1:2),'rows');

map_f = map_r(I,:);
map_f(map_f(:,3)>0,:)=[];

map_ff = [];
for i=1:size(map_f,1)
    
    for j=1:size(map_f,1)
        if(i~=j && hypot(map_f(j,1)-map_f(i,1),map_f(j,2)-map_f(i,2))<1.0)
            break;
        end
    end
    if(j~=size(map_f,1))
        map_ff(end+1,:) = map_f(i,:);
    end
end
dlmwrite('scenario_utm_discard.xyz', map_ff, 'precision', '%10.1f');

