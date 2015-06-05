.PHONY: init

all: init

test: init
	npm test

init: node_modules
	npm prune
	npm update
	which fpcalc 2> /dev/null || brew install chromaprint
