package main

import (
	"fmt"
	"github.com/bingym/ipcat/ip2region"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"os"
	"strings"
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
	r.LoadHTMLGlob("templates/*")

	r.GET("/", func(c *gin.Context) {
		if strings.HasPrefix(c.GetHeader("User-Agent"), "Mozilla") {
			c.HTML(http.StatusOK, "index.html", nil)
		} else {
			c.String(http.StatusOK, fmt.Sprintf("%s\n", c.ClientIP()))
		}
	})

	r.GET("/api/v1/info", func(c *gin.Context) {
		ipStr := c.DefaultQuery("addr", "")
		if ipStr == "" {
			ipStr = c.ClientIP()
		}
		ipInfo, err := region.MemorySearch(ipStr)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
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
