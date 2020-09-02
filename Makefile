start:
	sh ./bin/start.sh

install:
	sh ./bin/install.sh

stop:
	kill $(lsof -t -i:8080) && docker-compose down
	