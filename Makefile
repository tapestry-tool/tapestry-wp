start:
	make start-wp
	make start-app

start-wp:
	docker-compose up -d

start-app:
	cd templates/vue && npm start

init:
	make start-wp
	@echo "Waiting for 15s for containers to be ready..."
	# Change 15 to a higher number if it fails to install
	@sleep 15
	make install

install:
	sh ./bin/install.sh
	cd templates/vue && npm i

stop:
	kill $$(lsof -t -i:8080) && docker-compose down
	