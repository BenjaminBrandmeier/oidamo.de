#!/bin/bash

now=$(date +"%m_%d_%Y")

mkdir -p dist
mkdir -p upload
cp -r *.html img css js vendor dist/
pushd dist
zip -r "../upload/oidamo_$now.zip" *
popd
