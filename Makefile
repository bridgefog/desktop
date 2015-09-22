.PHONY: init build

all: init

test: init
	npm test

init:
	./bin/init.sh

build: init
	./bin/prepare-build-tools.sh
	gulp build-osx
