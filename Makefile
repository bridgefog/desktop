.PHONY: init

all: init

test: init
	npm test

init: node_modules
	npm prune
	npm update
