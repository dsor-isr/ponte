clear;
clc;
load bathymetry2
%%
close all;
resolution=.5;
con_comp_thr=.6;
comp_nodes_thr=20;

figure;
plot(data_3d(:,1),data_3d(:,2),'.');
grid on;
axis equal;
title('original data');

% downsample and eliminate repeated points
data_3d(:,1)=round(data_3d(:,1)/resolution)*resolution;
data_3d(:,2)=round(data_3d(:,2)/resolution)*resolution;
[C,ia,ib]=unique(data_3d(:,[1 2]),'rows','stable');
new_data=data_3d(ia,:);
n=size(new_data,1);

figure;
plot(new_data(:,1),new_data(:,2),'.');
grid on;
axis equal;
title('downsampled data');

% % create adjacency matrix
row=[];
col=[];
for i=1:n
%     i/n
    dists=sum((ones(n,1)*new_data(i,[1 2]) -  new_data(:,[1 2])).^2,2);
    cols=find(dists<con_comp_thr^2);
    cols=cols(cols<i);
    rows=ones(size(cols))*i;
    row=[row; rows];
    col=[col; cols];
end

% create adj matrix and get connected components
adj_matrix_size=max(max(row),max(col));
adj_matrix=sparse(row,col,ones(size(row)),adj_matrix_size,adj_matrix_size);
% distances=squareform(pdist(new_data(:,[1 2])));
[S,C]=graphconncomp(adj_matrix,'Directed','false');
% [S,C]=graphconncomp(sparse(distances>con_comp_thr),'Directed','false');

% loop through components, use only those with >= than x elements
final_data=[];
for i=1:S
    if(sum(C==i)>=comp_nodes_thr)
        final_data=[final_data; new_data(C==i,:)];
    end
end

figure;
plot(final_data(:,1),final_data(:,2),'.');
grid on;
axis equal;
title('clean data');
%%
dlmwrite('scenario_utm_crop3.xyz',final_data, 'precision', '%10.1f');