.PHONY: init build

all: init

test: init
	npm test

init:
	./bin/init.sh

build: init
	rm -rf dist
	gulp build
