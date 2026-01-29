#!/bin/bash

set -e

noms="
Blue Moon
Robert Kaplow
It Was Just an Accident
Jafar Panahi; Script collaborators - Nader Saïvar, Shadmehr Rastin, Mehdi Mahmoudian
Marty Supreme
Ronald Bronstein & Josh Safdie
Sentimental Value
Eskil Vogt, Joachim Trier
Sinners
Ryan Coogler

"

echo "$noms" | awk 'NR % 2 != 0'

echo "---"


echo "$noms" | awk 'NR % 2 == 0'

