TESTS = $(shell find ./test/specs -type f -name "*.js")
TEST_TIMEOUT = 10000
install:
	npm install
build: install
	node build/build.js
test: unit test-report codecov
unit:
	@NODE_ENV=test \
	node ./node_modules/.bin/mocha \
	--require babel-register \
	--timeout $(TEST_TIMEOUT) \
	$(TESTS)
test-cov:
	@NODE_ENV=test \
	node ./node_modules/.bin/nyc \
	make unit
test-report: test-cov
	@NODE_ENV=test \
	node ./node_modules/.bin/nyc \
	report --reporter=html
codecov:
	codecov
.PHONY: test test-cov test-report build unit codecov