package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
)

func main() {
	r := gin.Default()
	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, fmt.Sprintf("%s\n", c.ClientIP()))
	})
	if err := r.Run(":9993"); err != nil {
		panic(err)
	}
}
