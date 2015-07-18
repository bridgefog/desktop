.PHONY: init build

all: init

test: init
	npm test

init:
	./bin/init.sh

build: init
	rm -rf dist
	./bin/prepare-build-tools.sh
	gulp build
