# ipcat

## Develop

```shell
# start server
go run main.go
```

## Deploy

```shell
# build image
docker build -t registry.cn-hangzhou.aliyuncs.com/bingym/ipcat:latest .

# push image
docker push registry.cn-hangzhou.aliyuncs.com/bingym/ipcat:latest
```

## Thanks

https://github.com/lionsoul2014/ip2region
