# plenty-server

Server for Plenty app. Scan products to see if they are vegan (Dutch).

## Running locally

### Postgres database

```bash
# Run and start (first time)
docker run \
    --name postgres-plenty \
    -d -p 5432:5432 \
    -e POSTGRES_USER=plenty \
    -e POSTGRES_PASSWORD=plenty \
    -e POSTGRES_DB=plenty \
    postgres:alpine

# Start
docker start postgres-plenty

# Stop
docker stop postgres-plenty
```

You can now connect via:

```
DATABASE_URL=postgres://plenty:plenty@localhost:5432/plenty
```
