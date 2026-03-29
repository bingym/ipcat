GOCMD=go
BUILD_FLAGS=-ldflags "-w -s"
GOOS=linux
GOARCH=amd64
CGO_ENABLED=0

build:
	CGO_ENABLED=$(CGO_ENABLED) GOOS=$(GOOS) GOARCH=$(GOARCH) $(GOCMD) build -o ipcat $(BUILD_FLAGS)

clean:
	rm -f ipcat
