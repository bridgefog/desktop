.PHONY: init build

all: init

test: init
	npm test

init: node_modules
	./bin/init.sh

build: init
	./bin/build.sh
