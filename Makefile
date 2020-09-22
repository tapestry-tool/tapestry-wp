start:
	make start-wp
	make start-app

start-wp:
	docker-compose up -d

start-app:
	cd templates/vue && npm start

init:
	make start-wp
	@echo "Waiting for 30s for containers to be ready..."
	# Change 30 to a higher number if it fails to install
	@sleep 30
	make install

install:
	sh ./bin/install.sh
	cd templates/vue && npm i

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
	