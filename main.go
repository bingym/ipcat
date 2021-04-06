package main

import (
	"fmt"
	"net/http"
)

func IPHandler(w http.ResponseWriter, req *http.Request) {
	fmt.Fprint(w, req.RemoteAddr)
}

func main() {
	http.HandleFunc("/", IPHandler)
	if err := http.ListenAndServe(":9993", nil); err != nil {
		panic(err)
	}
}
