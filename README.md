# cryplarm

crypto alarm

docker-compose.yml example
```
version: '2'
services:
  cryplarm:
    build: .
    restart: always
    ports:
      - "8042"
    volumes:
      - ./data/:/usr/src/app/data
    environment:
      - DEBUG=*,-send,-express*,-morgan,-body-parser*
