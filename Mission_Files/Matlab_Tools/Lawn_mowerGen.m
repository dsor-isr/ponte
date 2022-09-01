%------------------------------------
ang=4; %Degrees
% % SESIMBRA
% xrefpoint = 490383.04;
% yrefpoint = 4254761.68;

% EXPO
xrefpoint = 491952.326;
yrefpoint = 4290847.696-40;

xini=-35*cosd(ang);
yini=35*sind(ang);
l = 35; %lenght of the line
dl = 5; % distance between legs
nl =8; % number of legs
vl =0.6; %nominal velocity

% formation_coord = [7.5000, 0;
%                    -3.7500, 6.4950;
%                    -3.7500, -6.4950;
%                     0, 0];   

A = [0     1     1     1;
     1     0     1     1;
     1     1     0     1;
     1     1     1     0];

D = [3     0     0     0;
     0     3     0     0;
     0     0     3     0;
     0     0     0     3];

%------------------------------------


mission = zeros(nl*2,9);
x=0;y=0;
k=1;
for i=1:2:nl*2
    mission(i,1)=x; mission(i,2)=y; mission(i,3)=-1; mission(i,4)=-1; 
    y=y+k*l; mission(i,5)=x; mission(i,6)=y; mission(i,7)=vl; mission(i,8)=0; mission(i,9)=0;
    mission(i+1,1)=x; mission(i+1,2)=y; mission(i+1,3)=x+(dl/2); mission(i+1,4)=y; 
    x=x+dl; mission(i+1,5)=x; mission(i+1,6)=y; mission(i+1,7)=vl; mission(i+1,8)=k&(k~=-1); mission(i+1,9)=dl/2;
    k=-k;
end
mission(end,:)=[];
% plotm(mission); axis equal; grid;
rotm = [cosd(ang) -sind(ang); sind(ang) cosd(ang)];
%rotation
mission(:,1:2)=mission(:,1:2)*rotm; 
mission(2:2:end,3:4)=mission(2:2:end,3:4)*rotm; 
mission(:,5:6)=mission(:,5:6)*rotm;
%translation
mission(:,1)=mission(:,1)+xini; mission(:,2)=mission(:,2)+yini;
mission(2:2:end,3)=mission(2:2:end,3)+xini; mission(2:2:end,4)=mission(2:2:end,4)+yini;
mission(:,5)=mission(:,5)+xini; mission(:,6)=mission(:,6)+yini;
figure(); plotm(mission);

clear l dl nl vl xini yini ang i k rotm x y