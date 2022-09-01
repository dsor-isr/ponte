#!/bin/bash

files=( "caddy/caddy_mission_dubins.dxf" "morph/20150702_wo_soy_amor.dxf" "morph/20150909_long_v2.dxf" "morph/20150911_long_1cv_4loops_v3.dxf" )

for i in "${files[@]}"
do
	a="${i%.*}"
	a="${a#*/}"
	a="gen_missions/$a.txt"
	python dxf_parser.py $i > $a
done