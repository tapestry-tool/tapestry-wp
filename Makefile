start:
	make start-wp
	make start-app

start-wp:
	docker-compose up -d

start-app:
	cd templates/vue && npm start

init:
	make start-wp
	make install
	make env

install:
	sh ./bin/install.sh
	cd templates/vue && npm i

env:
	bash ./bin/setup-env.sh

clear-db:
	docker volume rm tapestry-wp_db_data

uninstall:
	make stop
	make clear-db
	cd templates/vue && rm -r node_modules

stop:
	make stop-app
	make stop-wp

stop-wp:
	docker-compose down

stop-app:
	sh ./bin/stop-app.sh
	