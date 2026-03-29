FROM golang:1.25 AS builder

WORKDIR /app

COPY . /app
RUN make build

FROM ubuntu:22.04
WORKDIR /app

COPY --from=builder /app/ipcat /app/ipcat

EXPOSE 80
CMD ["./ipcat"]
