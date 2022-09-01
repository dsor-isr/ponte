function mission_all = FORMATION(formation,traslate,mission_ref)

%all vehicles missions
num_vehicles=size(formation,1);
mission_all=zeros(num_vehicles*size(mission_ref,1),9);

for j=1:num_vehicles
    mission=zeros(size(mission_ref));
%     mission = [mission_ref(:,1:8), zeros(size(mission_ref,1),1)];
    x=formation(j,1);
    y=formation(j,2);
    
    for i=1:size(mission_ref,1)
        %Start Point
        xs = mission_ref(i,1);
        ys = mission_ref(i,2);
        %Center point
        xc = mission_ref(i,3);
        yc = mission_ref(i,4);
        %End point
        xe = mission_ref(i,5);
        ye = mission_ref(i,6);
        %Velocity
        Vl =mission_ref(i,7);
	R0 =mission_ref(i,9);
        if mission_ref(i,8)
            k = -1;
        else
            k = 1;
        end
        
        if Vl == 0
            break
        else
            %the traslate button put the vehicles in the same relative positions, but considering the origin
            %the actual mission point
            if traslate
                xs = xs + x;
                ys = ys + y;
                if (xc == -1) && (yc == -1)
                    xc = -1;
                    yc = -1;
                else
                    xc = xc + x;
                    yc = yc + y;
                end
                xe = xe + x;
                ye = ye + y;
            else
                %if it is a straight line
                if (xc == -1) && (yc == -1)
                    psi = atan2(ye-ys,xe-xs);
                    xs = xs + x*cos(psi) -y*sin(psi);
                    ys = ys + x*sin(psi) +y*cos(psi);
                    xe = xe + x*cos(psi) -y*sin(psi);
                    ye = ye + x*sin(psi) +y*cos(psi);
                    R0=0;
                else
                    psis = atan2(ys-yc,xs-xc) + k*pi/2;
                    psie = atan2(ye-yc,xe-xc) + k*pi/2;
                    xs = xs + x*cos(psis) -y*sin(psis);
                    ys = ys + x*sin(psis) +y*cos(psis);
                    xe = xe + x*cos(psie) -y*sin(psie);
                    ye = ye + x*sin(psie) +y*cos(psie);
                    %R0 = sqrt((xs-xc)^2+(ys-yc)^2);
                    %normalizing the velocity - the inner vehicle has lower
                    %velocity and the outter vehicle has higher velocity
                    Vl = Vl*(1 - k*y/R0);
                end
            end
            
            mission(i,:) = [xs ys xc yc xe ye Vl mission_ref(i,8) R0];
        end
    end
    mission_all((j-1)*size(mission_ref,1)+1:(j-1)*size(mission_ref,1)+size(mission_ref,1),:)=mission;
end
