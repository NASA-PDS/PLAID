export NAME=PLAID

dev-build:
	docker-compose build

dev-up:
	docker-compose up

dev: dev-build dev-up