function [] = plotm(mission)

%==========Figure Creation===============
%figure();
hold on
% grid on
xlabel('x [m]')
ylabel('y [m]')
box

%==========Trajectory Plot===============

for i = 1:size(mission,1)
    xs = mission(i,1);
    ys = mission(i,2);
    xc = mission(i,3);
    yc = mission(i,4);
    xe = mission(i,5);
    ye = mission(i,6);
    Vl = mission(i,7);
    if mission(i,8)
        k = -1;
    else
        k = 1;
    end
    if Vl
    if (xc == -1)&&(yc == -1)
        plot([xs xe],[ys ye],'b:')
        plot([xs xe],[ys ye],'bo')
    else 
        R = sqrt((ys-yc)^2+(xs-xc)^2);
        ths = atan2(ys-yc,xs-xc);
        the = atan2(ye-yc,xe-xc);
        delta = k*(the - ths);
                if delta < 0
                    delta = delta + 2*pi;
                end
        theta = ths:k*.01:ths+k*delta;
        xplot = xc + R*cos(theta);
        yplot = yc + R*sin(theta);
        plot(xplot,yplot,'b:')
        plot([xs xe],[ys ye],'bo')        
    end
    else
        break
    end
end
%axis equal
%axis manual