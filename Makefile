# FoodSource — команды для разработки и Docker
# Windows: GNU Make из Git for Windows (`make help`). Python: `make PY="py -3" test-backend`

.DEFAULT_GOAL := help

COMPOSE   ?= docker compose
PY        ?= python
NPM       ?= npm
API_URL   ?= http://127.0.0.1:8000

.PHONY: help
help: ## Показать список команд
	@echo FoodSource — доступные цели:
	@echo.
	@echo   make up              Поднять backend + frontend (docker compose up --build)
	@echo   make up-d            Поднять в фоне
	@echo   make down            Остановить контейнеры
	@echo   make down-v          Остановить и удалить volume SQLite
	@echo   make build           Собрать образы без запуска
	@echo   make logs            Логи всех сервисов
	@echo   make logs-api        Логи только backend
	@echo   make ps              Статус контейнеров
	@echo   make restart         Пересоздать стек в фоне
	@echo   make install         pip + npm install
	@echo   make dev-api         Uvicorn :8000 с reload
	@echo   make dev-client      Vite dev (см. make dev)
	@echo   make dev             Подсказка по двум терминалам
	@echo   make test            pytest + vitest
	@echo   make test-backend    pytest
	@echo   make test-client     vitest
	@echo   make lint-client     eslint
	@echo   make format-client   prettier
	@echo   make demo-gif        Пересобрать demo.gif
	@echo   make health          curl /health
	@echo   make openapi         URL Swagger
	@echo.
	@echo   Windows Python: make PY=py -3 test-backend

# --- Docker (демо / интеграция) ---

.PHONY: up
up: ## Поднять backend + frontend (docker compose up --build)
	$(COMPOSE) up --build

.PHONY: up-d
up-d: ## Поднять в фоне
	$(COMPOSE) up --build -d

.PHONY: down
down: ## Остановить контейнеры
	$(COMPOSE) down

.PHONY: down-v
down-v: ## Остановить и удалить volume SQLite
	$(COMPOSE) down -v

.PHONY: build
build: ## Собрать образы без запуска
	$(COMPOSE) build

.PHONY: logs
logs: ## Логи всех сервисов
	$(COMPOSE) logs -f

.PHONY: logs-api
logs-api: ## Логи только backend
	$(COMPOSE) logs -f backend

.PHONY: ps
ps: ## Статус контейнеров
	$(COMPOSE) ps

.PHONY: restart
restart: down up-d ## Пересоздать стек в фоне

# --- Локальная разработка (без Docker) ---

.PHONY: install
install: install-backend install-client ## Установить зависимости backend + client

.PHONY: install-backend
install-backend: ## pip install -r backend/requirements.txt
	cd backend && $(PY) -m pip install -r requirements.txt

.PHONY: install-client
install-client: ## npm install в client/
	cd client && $(NPM) install

.PHONY: dev-api
dev-api: ## Uvicorn с reload на :8000
	cd backend && $(PY) -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

.PHONY: dev-client
dev-client: ## Vite dev (нужен dev-api; порт смотри в выводе Vite)
	cd client && $(NPM) run dev

.PHONY: dev
dev: ## Подсказка: два терминала — make dev-api и make dev-client
	@echo Запустите в двух терминалах:
	@echo   1\) make dev-api
	@echo   2\) set VITE_API_URL=$(API_URL)  ^(Windows^)  или  export VITE_API_URL=$(API_URL)
	@echo      make dev-client

# --- Тесты и качество ---

.PHONY: test
test: test-backend test-client ## Все тесты

.PHONY: test-backend
test-backend: ## pytest в backend/
	cd backend && $(PY) -m pytest -q

.PHONY: test-client
test-client: ## vitest в client/
	cd client && $(NPM) test

.PHONY: lint-client
lint-client: ## eslint в client/
	cd client && $(NPM) run lint

.PHONY: format-client
format-client: ## prettier --write в client/
	cd client && $(NPM) run format

# --- Прочее ---

.PHONY: demo-gif
demo-gif: ## Пересобрать demo.gif (Pillow)
	$(PY) -m pip install -q pillow
	$(PY) scripts/generate_demo_gif.py

.PHONY: health
health: ## Проверить /health API (ожидает запущенный backend на :8000)
	curl -sf $(API_URL)/health && echo OK || echo FAIL — запустите make up или make dev-api

.PHONY: openapi
openapi: ## URL Swagger (печать в консоль)
	@echo $(API_URL)/docs
