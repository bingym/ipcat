package main

import (
	"net/http"

	"github.com/bingym/ipcat/ip2region"
	"github.com/gin-gonic/gin"
)

type IPResp struct {
	Address string
	ip2region.IpInfo
}

func main() {
	region, err := ip2region.New("./data/ip2region.db")
	if err != nil {
		panic(err)
	}

	r := gin.Default()
	r.GET("/", func(c *gin.Context) {
		ipStr := c.DefaultQuery("addr", "")
		if ipStr == "" {
			ipStr = c.ClientIP()
		}
		ipInfo, err := region.BinarySearch(ipStr)
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
		panic(err)
	}
}
