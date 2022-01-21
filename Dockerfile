FROM golang:1.17
ENV GOPROXY https://goproxy.cn
WORKDIR /app
COPY . /app
RUN go build
EXPOSE 80
ENTRYPOINT ["./ipcat"]
