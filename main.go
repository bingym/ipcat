package main

import (
	"fmt"
	"github.com/bingym/ipcat/ip2region"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"os"
)

func main() {
	region, err := ip2region.New("./data/ip2region.db")
	if err != nil {
		log.Fatalln("init ip database failed: ", err)
	}

	if os.Getenv("APP_MODE") == "prod" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()

	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, fmt.Sprintf("%s\n", c.ClientIP()))
	})

	r.GET("/info", func(c *gin.Context) {
		ipStr := c.DefaultQuery("addr", "")
		if ipStr == "" {
			ipStr = c.ClientIP()
		}
		ipInfo, err := region.MemorySearch(ipStr)
		if err != nil {
			c.JSON(http.StatusInternalServerError, map[string]interface{}{
				"code": http.StatusInternalServerError,
				"msg":  err.Error(),
			})
			return
		}
		c.JSON(http.StatusOK, ipInfo)
	})

	if err := r.Run(":80"); err != nil {
		log.Fatalln("server start failed: ", err)
	}
}
