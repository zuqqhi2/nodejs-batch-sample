#!/bin/bash
source ~/.bashrc
nvm use v6.9.1
cd .
node --optimize_for_size --max_old_space_size=8192 --gc_interval=1000 ./src/update-mapping.js --env $1 $2
