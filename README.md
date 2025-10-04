# install

npm i

# start postgres in docker in detached mode
docker compose up -d 

# run

npm run dev

# reset db

npm run db:hard-reset

# seed

npm run seed

# artillery run load-test.yml

npm run load-test


# Completely Remove Database (including data):

docker compose down -v