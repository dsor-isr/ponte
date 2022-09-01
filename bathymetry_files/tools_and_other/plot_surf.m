x = data_3d(:,1);
y = data_3d(:,2);
z = data_3d(:,3);

xlin = linspace(min(x),max(x),33);
ylin = linspace(min(y),max(y),33);
[X,Y] = meshgrid(xlin,ylin);
f = scatteredInterpolant(x,y,z);
Z = f(X,Y);
figure
mesh(X,Y,Z) %interpolated
axis tight; hold on
%plot3(x,y,z,'.','MarkerSize',15) %nonuniform
surf(X,Y,Z)

cropped_r = [round(cropped(:,1)), round(cropped(:,2)), cropped(:,3)];
[B,I,J]= unique(cropped_r(:,1:2),'rows');
map_f = cropped_r(I,:);


%%

save bathymetry.mat
data_3d_cropped=data_3d;
data_3d_cropped(aa,:)=[];
plot3(data_3d_cropped(:,1),data_3d_cropped(:,2),data_3d_cropped(:,3),'.')
dlmwrite('scenario_utm_crop.xyz',cropped, 'precision', '%10.1f');
cropped_r = [round(cropped(:,1)), round(cropped(:,2)), cropped(:,3)];
[B,I,J]= unique(cropped_r(:,1:2),'rows');
map_f = cropped_r(I,:);
plot3(map_f(:,1),map_f(:,2),map_f(:,3),'.')
dlmwrite('scenario_utm_crop.xyz',map_f, 'precision', '%10.1f');