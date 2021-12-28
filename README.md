# ipcat

## API

### Request for only IP Address

`GET /`

### Reqeust for details

`GET /info`

## Develop

```shell
# start server
go run main.go
```

## Deploy

```shell
# build
docker build --platform linux/amd64 -t registry.cn-hangzhou.aliyuncs.com/bingym/ipcat_amd64:latest .

# push
docker push registry.cn-hangzhou.aliyuncs.com/bingym/ipcat_amd64:latest

# pull
docker pull registry.cn-hangzhou.aliyuncs.com/bingym/ipcat_amd64:latest
```

## Thanks

https://github.com/lionsoul2014/ip2region
