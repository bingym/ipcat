package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/levigross/grequests"
	"net/http"
)

type IPResp struct {
	Status   int    `json:"status"`
	Message  string `json:"message"`
	Addr     string `json:"addr"`
	Country  string `json:"country"`
	Area     string `json:"area"`
	Provider string `json:"provider"`
}

func main() {
	r := gin.Default()
	r.GET("/", func(c *gin.Context) {
		clientIP := c.ClientIP()
		response, err := grequests.Get(
			"https://ip.mcr.moe",
			&grequests.RequestOptions{Params: map[string]string{
				"ip":  clientIP,
				"db2": "",
			}},
		)
		if err != nil {
			c.String(http.StatusBadRequest, "查询IP信息失败: "+err.Error())
			return
		}
		defer response.Close()
		if response.StatusCode != 200 {
			c.String(http.StatusInternalServerError, "查询IP信息失败: "+response.String())
			return
		}
		var resp IPResp
		if err := response.JSON(&resp); err != nil {
			c.String(http.StatusInternalServerError, "查询IP信息失败: ", err.Error())
			return
		}
		c.String(http.StatusOK, fmt.Sprintf("%s\n%s %s %s", clientIP, resp.Country, resp.Area, resp.Provider))
	})
	if err := r.Run(":9993"); err != nil {
		panic(err)
	}
}
