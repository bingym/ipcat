FROM golang:latest
ENV GOPROXY https://goproxy.cn
WORKDIR /app/src
COPY . /app
RUN go build
EXPOSE 80
ENTRYPOINT ["./yinchuan"]
