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
	@echo "Setting up WP installation:"
	sh ./bin/install.sh
	@echo "Installing plugin dependencies:"
	cd templates/vue && npm i
	# TODO: bring down docker stack at this point?

clear-db:
	docker volume rm tapestry-wp_db_data

uninstall:
	@echo "Stopping application:"
	make stop
	make clear-db

stop:
	# TODO: prevent exit if lsof output is empty
	kill $$(lsof -t -i:8080) && docker-compose down
	